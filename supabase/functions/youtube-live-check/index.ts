import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ live: false, error: "YOUTUBE_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to be able to insert cultos
    const sb = createClient(supabaseUrl, serviceRoleKey);

    // Fetch channel ID from site_config
    const { data: configRow } = await sb
      .from("site_config")
      .select("value")
      .eq("key", "site")
      .maybeSingle();

    const siteValue = (configRow?.value as Record<string, string>) || {};
    const channelId = siteValue.youtube_channel_id;

    if (!channelId) {
      return new Response(
        JSON.stringify({ live: false, error: "youtube_channel_id not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search for active live broadcasts on this channel
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("eventType", "live");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", youtubeApiKey);

    const ytRes = await fetch(searchUrl.toString());
    const ytData = await ytRes.json();

    if (!ytRes.ok) {
      console.error("YouTube API error:", JSON.stringify(ytData));
      return new Response(
        JSON.stringify({ live: false, error: "YouTube API error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const items = ytData.items || [];

    // Fetch current live state from site_config
    const { data: liveStateRow } = await sb
      .from("site_config")
      .select("value")
      .eq("key", "current_live")
      .maybeSingle();

    const previousLive = (liveStateRow?.value as Record<string, string>) || {};

    if (items.length > 0) {
      const videoId = items[0].id?.videoId;
      const title = items[0].snippet?.title || "";
      const thumbnail = items[0].snippet?.thumbnails?.high?.url || "";

      // Store current live info
      await sb.from("site_config").upsert({
        key: "current_live",
        value: { videoId, title, thumbnail },
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ live: true, videoId, title, thumbnail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Not live anymore — check if there was a previous live stream to archive
    if (previousLive.videoId) {
      console.log("Live ended, archiving:", previousLive.videoId, previousLive.title);

      // Check if this video was already added to cultos
      const { data: existing } = await sb
        .from("cultos")
        .select("id")
        .eq("video_url", `https://www.youtube.com/watch?v=${previousLive.videoId}`)
        .maybeSingle();

      if (!existing) {
        const today = new Date().toISOString().split("T")[0];
        await sb.from("cultos").insert({
          titulo: previousLive.title || "Culto ao Vivo",
          data: today,
          video_url: `https://www.youtube.com/watch?v=${previousLive.videoId}`,
          thumbnail_url: previousLive.thumbnail || null,
          pregador: "Pr. Rafael Delmonego",
          status: "publicado",
        });
        console.log("Culto archived successfully");
      } else {
        console.log("Culto already exists, skipping");
      }

      // Clear the live state
      await sb.from("site_config").upsert({
        key: "current_live",
        value: {},
        updated_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ live: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ live: false, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
