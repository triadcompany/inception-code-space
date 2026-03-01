import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Extract YouTube video ID from various URL formats */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

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

    const sb = createClient(supabaseUrl, serviceRoleKey);

    // Fetch site config
    const { data: configRow } = await sb
      .from("site_config")
      .select("value")
      .eq("key", "site")
      .maybeSingle();

    const siteValue = (configRow?.value as Record<string, string>) || {};
    const channelId = siteValue.youtube_channel_id;
    const manualUrl = siteValue.ao_vivo_url || "";
    const manualVideoId = extractYouTubeId(manualUrl);

    // Fetch previous live state
    const { data: liveStateRow } = await sb
      .from("site_config")
      .select("value")
      .eq("key", "current_live")
      .maybeSingle();

    const previousLive = (liveStateRow?.value as Record<string, string>) || {};

    // --- 1) Check for auto-detected public live stream ---
    let autoLive = false;
    let autoVideoId: string | null = null;
    let autoTitle = "";
    let autoThumbnail = "";

    if (channelId) {
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("channelId", channelId);
      searchUrl.searchParams.set("eventType", "live");
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("maxResults", "1");
      searchUrl.searchParams.set("key", youtubeApiKey);

      const ytRes = await fetch(searchUrl.toString());
      const ytData = await ytRes.json();

      if (ytRes.ok && ytData.items?.length > 0) {
        autoLive = true;
        autoVideoId = ytData.items[0].id?.videoId;
        autoTitle = ytData.items[0].snippet?.title || "";
        autoThumbnail = ytData.items[0].snippet?.thumbnails?.high?.url || "";
      }
    }

    // --- 2) Determine current active video (auto or manual) ---
    const currentVideoId = autoVideoId || manualVideoId;
    let currentTitle = autoTitle;
    let currentThumbnail = autoThumbnail;

    // If manual video, fetch its title from YouTube
    if (!autoLive && manualVideoId) {
      const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      videoUrl.searchParams.set("part", "snippet");
      videoUrl.searchParams.set("id", manualVideoId);
      videoUrl.searchParams.set("key", youtubeApiKey);

      const vRes = await fetch(videoUrl.toString());
      const vData = await vRes.json();
      if (vRes.ok && vData.items?.length > 0) {
        currentTitle = vData.items[0].snippet?.title || "";
        currentThumbnail = vData.items[0].snippet?.thumbnails?.high?.url || currentThumbnail;
      }
    }

    // --- 3) Track state & archive ---
    if (currentVideoId) {
      // There's an active stream — save state
      await sb.from("site_config").upsert({
        key: "current_live",
        value: { videoId: currentVideoId, title: currentTitle, thumbnail: currentThumbnail, source: autoLive ? "auto" : "manual" },
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ live: autoLive, videoId: currentVideoId, title: currentTitle, thumbnail: currentThumbnail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No active stream — check if we need to archive previous one
    if (previousLive.videoId) {
      console.log("Stream ended, archiving:", previousLive.videoId, previousLive.title);

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
      }

      // Clear live state
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
