const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get params
    const body = await req.json().catch(() => ({}));
    const channelId = body.channelId;
    const pageToken = body.pageToken || undefined;

    if (!channelId) {
      return new Response(JSON.stringify({ error: "channelId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) {
      return new Response(JSON.stringify({ error: "YOUTUBE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve uploads playlist for this channel
    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "contentDetails");
    channelUrl.searchParams.set("id", channelId);
    channelUrl.searchParams.set("key", youtubeApiKey);

    const channelRes = await fetch(channelUrl.toString());
    const channelData = await channelRes.json();

    if (!channelRes.ok) {
      console.error("YouTube channels API error:", JSON.stringify(channelData));
      return new Response(
        JSON.stringify({ error: channelData.error?.message || "YouTube channels API error" }),
        { status: channelRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uploadsPlaylistId = channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return new Response(JSON.stringify({ error: "Uploads playlist não encontrado para este canal" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch one uploads page
    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.searchParams.set("part", "snippet,contentDetails");
    playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
    playlistUrl.searchParams.set("maxResults", "50");
    playlistUrl.searchParams.set("key", youtubeApiKey);
    if (pageToken) {
      playlistUrl.searchParams.set("pageToken", pageToken);
    }

    console.log("Fetching YouTube uploads page for channel:", channelId);
    const ytRes = await fetch(playlistUrl.toString());
    const ytData = await ytRes.json();

    if (!ytRes.ok) {
      console.error("YouTube playlistItems API error:", JSON.stringify(ytData));
      return new Response(
        JSON.stringify({ error: ytData.error?.message || "YouTube playlistItems API error" }),
        { status: ytRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = ytData.items || [];
    let imported = 0;
    let skipped = 0;

    // Fetch video details to identify real live streams
    const videoIds = items.map((item: any) => item.contentDetails?.videoId).filter(Boolean).join(",");

    let videosDetail: Record<string, any> = {};
    if (videoIds) {
      const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailUrl.searchParams.set("part", "snippet,contentDetails,liveStreamingDetails");
      detailUrl.searchParams.set("id", videoIds);
      detailUrl.searchParams.set("key", youtubeApiKey);

      const detailRes = await fetch(detailUrl.toString());
      const detailData = await detailRes.json();
      if (detailRes.ok && detailData.items) {
        for (const v of detailData.items) {
          videosDetail[v.id] = v;
        }
      }
    }

    for (const item of items) {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) {
        skipped++;
        continue;
      }

      const detail = videosDetail[videoId];
      if (!detail) {
        skipped++;
        continue;
      }

      const liveDetails = detail.liveStreamingDetails;
      const isLiveStream = !!(liveDetails?.actualStartTime || liveDetails?.actualEndTime);
      if (!isLiveStream) {
        skipped++;
        continue;
      }

      const snippet = detail.snippet || item.snippet;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Check if already exists by video_url
      const { data: existing } = await supabase
        .from("cultos")
        .select("id")
        .eq("video_url", videoUrl)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Extract best thumbnail
      const thumbs = snippet?.thumbnails || item.snippet?.thumbnails;
      const thumbnailUrl =
        thumbs?.maxres?.url || thumbs?.high?.url || thumbs?.medium?.url || thumbs?.default?.url || null;

      // Parse date (prefer actual live start time)
      const publishedAt = liveDetails?.actualStartTime || snippet?.publishedAt;
      const dateOnly = publishedAt ? publishedAt.substring(0, 10) : new Date().toISOString().substring(0, 10);

      const { error: insertErr } = await supabase.from("cultos").insert({
        titulo: snippet?.title || "Culto sem título",
        data: dateOnly,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        pregador: null,
        descricao: snippet?.description || null,
        status: "publicado",
        created_by: userId,
      });

      if (insertErr) {
        console.error("Insert error for video", videoId, insertErr.message);
      } else {
        imported++;
      }
    }

    console.log(`Import done: ${imported} imported, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        skipped,
        total: items.length,
        nextPageToken: ytData.nextPageToken || null,
        hasMore: !!ytData.nextPageToken,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
