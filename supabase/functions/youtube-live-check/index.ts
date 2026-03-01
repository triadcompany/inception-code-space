import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ live: false, error: "YOUTUBE_API_KEY not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch channel ID from site_config
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data: configRow } = await sb
      .from("site_config")
      .select("value")
      .eq("key", "site")
      .maybeSingle();

    const channelId = (configRow?.value as Record<string, string>)?.youtube_channel_id;

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
    if (items.length > 0) {
      const videoId = items[0].id?.videoId;
      const title = items[0].snippet?.title || "";
      const thumbnail = items[0].snippet?.thumbnails?.high?.url || "";
      return new Response(
        JSON.stringify({ live: true, videoId, title, thumbnail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
