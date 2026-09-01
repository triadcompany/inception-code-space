import { eq, sql } from "drizzle-orm";
import type { DB } from "../db/client.ts";
import { cultos, site_config } from "../db/schema.ts";

export interface LiveStatus {
  live: boolean;
  videoId?: string;
  title?: string;
  thumbnail?: string;
  error?: string;
}

const YT_ID_PATTERNS = [
  /[?&]v=([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
];

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  for (const p of YT_ID_PATTERNS) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function checkVideoLiveStatus(videoId: string, apiKey: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet,liveStreamingDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);
  const res = await fetch(url.toString());
  const data: any = await res.json();
  if (!res.ok || !data.items?.length) return null;
  const item = data.items[0];
  return {
    isLive: item.snippet?.liveBroadcastContent === "live",
    title: item.snippet?.title || "",
    thumbnail: item.snippet?.thumbnails?.high?.url || "",
  };
}

async function readConfig(db: DB, key: string): Promise<Record<string, any>> {
  const [row] = await db.select().from(site_config).where(eq(site_config.key, key));
  return (row?.value as Record<string, any>) ?? {};
}

async function writeConfig(db: DB, key: string, value: Record<string, any>): Promise<void> {
  await db
    .insert(site_config)
    .values({ key, value })
    .onConflictDoUpdate({ target: site_config.key, set: { value, updated_at: sql`now()` } });
}

/**
 * Port of the `youtube-live-check` edge function. Detects the current live
 * stream (manual URL first, then channel search), persists it under
 * `site_config.current_live`, and archives the previous stream into `cultos`
 * once it ends.
 */
export async function runLiveCheck(db: DB, apiKey: string): Promise<LiveStatus> {
  if (!apiKey) return { live: false, error: "YOUTUBE_API_KEY not configured" };

  const site = await readConfig(db, "site");
  const channelId = site.youtube_channel_id;
  const manualVideoId = extractYouTubeId(site.ao_vivo_url || "");
  const previous = await readConfig(db, "current_live");

  // 1) Manual URL (most reliable for unlisted lives)
  if (manualVideoId) {
    const status = await checkVideoLiveStatus(manualVideoId, apiKey);
    if (status) {
      await writeConfig(db, "current_live", {
        videoId: manualVideoId,
        title: status.title,
        thumbnail: status.thumbnail,
        source: "manual",
        isLive: status.isLive,
      });
      return {
        live: status.isLive,
        videoId: manualVideoId,
        title: status.title,
        thumbnail: status.thumbnail,
      };
    }
  }

  // 2) Auto-detect a public live stream via Search API
  if (channelId) {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("eventType", "live");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", apiKey);
    const res = await fetch(searchUrl.toString());
    const data: any = await res.json();
    const candidateId = res.ok ? data.items?.[0]?.id?.videoId : null;
    if (candidateId) {
      const status = await checkVideoLiveStatus(candidateId, apiKey);
      if (status?.isLive) {
        await writeConfig(db, "current_live", {
          videoId: candidateId,
          title: status.title,
          thumbnail: status.thumbnail,
          source: "auto",
          isLive: true,
        });
        return { live: true, videoId: candidateId, title: status.title, thumbnail: status.thumbnail };
      }
    }
  }

  // 3) No active stream — archive the previous one if needed
  if (previous.videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${previous.videoId}`;
    const [existing] = await db
      .select({ id: cultos.id })
      .from(cultos)
      .where(eq(cultos.video_url, videoUrl));
    if (!existing) {
      await db.insert(cultos).values({
        titulo: previous.title || "Culto ao Vivo",
        data: new Date().toISOString().split("T")[0],
        video_url: videoUrl,
        thumbnail_url: previous.thumbnail || null,
        pregador: "Pr. Rafael Delmonego",
        status: "publicado",
      });
    }
    await writeConfig(db, "current_live", {});
  }

  return { live: false };
}
