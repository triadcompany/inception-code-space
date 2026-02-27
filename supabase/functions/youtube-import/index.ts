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

    // Fetch all videos from channel
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("order", "date");
    searchUrl.searchParams.set("maxResults", "50");
    searchUrl.searchParams.set("key", youtubeApiKey);
    if (pageToken) {
      searchUrl.searchParams.set("pageToken", pageToken);
    }

    console.log("Fetching YouTube lives for channel:", channelId);
    const ytRes = await fetch(searchUrl.toString());
    const ytData = await ytRes.json();

    if (!ytRes.ok) {
      console.error("YouTube API error:", JSON.stringify(ytData));
      return new Response(
        JSON.stringify({ error: ytData.error?.message || "YouTube API error" }),
        { status: ytRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = ytData.items || [];
    let imported = 0;
    let skipped = 0;

    // Get video IDs for detailed info (duration, thumbnails)
    const videoIds = items.map((item: any) => item.id.videoId).join(",");

    let videosDetail: Record<string, any> = {};
    if (videoIds) {
      const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailUrl.searchParams.set("part", "snippet,contentDetails");
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
      const videoId = item.id.videoId;
      const snippet = item.snippet;
      const detail = videosDetail[videoId];
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
      const thumbs = detail?.snippet?.thumbnails || snippet.thumbnails;
      const thumbnailUrl =
        thumbs?.maxres?.url || thumbs?.high?.url || thumbs?.medium?.url || thumbs?.default?.url || null;

      // Parse date
      const publishedAt = snippet.publishedAt;
      const dateOnly = publishedAt ? publishedAt.substring(0, 10) : new Date().toISOString().substring(0, 10);

      const { error: insertErr } = await supabase.from("cultos").insert({
        titulo: snippet.title,
        data: dateOnly,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        pregador: null,
        descricao: snippet.description || null,
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
