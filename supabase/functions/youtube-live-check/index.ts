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

/** Check if a specific video is currently live using Videos API */
async function checkVideoLiveStatus(videoId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,liveStreamingDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!res.ok || !data.items?.length) return null;

  const item = data.items[0];
  const liveBroadcastContent = item.snippet?.liveBroadcastContent; // "live", "upcoming", "none"
  const isLive = liveBroadcastContent === "live";

  return {
    isLive,
    title: item.snippet?.title || "",
    thumbnail: item.snippet?.thumbnails?.high?.url || "",
  };
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

    // --- 1) Check manual URL first (most reliable for unlisted lives) ---
    if (manualVideoId) {
      const manualStatus = await checkVideoLiveStatus(manualVideoId, youtubeApiKey);
      console.log("Manual video check:", manualVideoId, manualStatus?.isLive, manualStatus?.title);

      if (manualStatus) {
        // Save state (whether live or not, the manual URL is set intentionally)
        await sb.from("site_config").upsert({
          key: "current_live",
          value: {
            videoId: manualVideoId,
            title: manualStatus.title,
            thumbnail: manualStatus.thumbnail,
            source: "manual",
            isLive: manualStatus.isLive,
          },
          updated_at: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            live: manualStatus.isLive,
            videoId: manualVideoId,
            title: manualStatus.title,
            thumbnail: manualStatus.thumbnail,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- 2) Auto-detect public live stream via Search API ---
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
        const candidateId = ytData.items[0].id?.videoId;
        // Double-check with Videos API for accuracy
        if (candidateId) {
          const videoStatus = await checkVideoLiveStatus(candidateId, youtubeApiKey);
          if (videoStatus?.isLive) {
            autoLive = true;
            autoVideoId = candidateId;
            autoTitle = videoStatus.title;
            autoThumbnail = videoStatus.thumbnail;
          }
        }
      }
    }

    if (autoVideoId && autoLive) {
      await sb.from("site_config").upsert({
        key: "current_live",
        value: { videoId: autoVideoId, title: autoTitle, thumbnail: autoThumbnail, source: "auto", isLive: true },
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ live: true, videoId: autoVideoId, title: autoTitle, thumbnail: autoThumbnail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 3) No active stream — archive previous if needed ---
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
