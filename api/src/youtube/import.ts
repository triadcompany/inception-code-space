import { eq } from "drizzle-orm";
import type { DB } from "../db/client.ts";
import { cultos } from "../db/schema.ts";

export interface ImportParams {
  channelId: string;
  pageToken?: string;
  mode?: "live" | "videos";
  years?: number[];
  userId: string;
  apiKey: string;
}

export interface ImportResult {
  success: true;
  imported: number;
  skipped: number;
  total: number;
  nextPageToken: string | null;
  hasMore: boolean;
}

/**
 * Port of the `youtube-import` edge function: walks one page of a channel's
 * uploads playlist and inserts matching videos into `cultos`.
 */
export async function importFromYouTube(db: DB, p: ImportParams): Promise<ImportResult> {
  const { channelId, pageToken, mode = "live", years = [], userId, apiKey } = p;

  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelUrl.searchParams.set("part", "contentDetails");
  channelUrl.searchParams.set("id", channelId);
  channelUrl.searchParams.set("key", apiKey);
  const channelData = await fetchJson(channelUrl);
  const uploadsPlaylistId =
    channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
  if (!uploadsPlaylistId) throw new Error("Uploads playlist não encontrado para este canal");

  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet,contentDetails");
  playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
  playlistUrl.searchParams.set("maxResults", "50");
  playlistUrl.searchParams.set("key", apiKey);
  if (pageToken) playlistUrl.searchParams.set("pageToken", pageToken);
  const ytData = await fetchJson(playlistUrl);

  const items: any[] = ytData.items ?? [];
  const videoIds = items
    .map((i) => i.contentDetails?.videoId)
    .filter(Boolean)
    .join(",");

  const detail: Record<string, any> = {};
  if (videoIds) {
    const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailUrl.searchParams.set("part", "snippet,contentDetails,liveStreamingDetails");
    detailUrl.searchParams.set("id", videoIds);
    detailUrl.searchParams.set("key", apiKey);
    const detailData = await fetchJson(detailUrl).catch(() => ({ items: [] }));
    for (const v of detailData.items ?? []) detail[v.id] = v;
  }

  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    const videoId = item.contentDetails?.videoId;
    const d = videoId ? detail[videoId] : null;
    if (!videoId || !d) {
      skipped++;
      continue;
    }

    const live = d.liveStreamingDetails;
    const isLive = !!(live?.actualStartTime || live?.actualEndTime);
    if ((mode === "live" && !isLive) || (mode === "videos" && isLive)) {
      skipped++;
      continue;
    }

    const snippet = d.snippet ?? item.snippet;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const [existing] = await db
      .select({ id: cultos.id })
      .from(cultos)
      .where(eq(cultos.video_url, videoUrl));
    if (existing) {
      skipped++;
      continue;
    }

    const thumbs = snippet?.thumbnails ?? {};
    const thumbnailUrl =
      thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? null;

    const publishedAt = (mode === "live" ? live?.actualStartTime : null) ?? snippet?.publishedAt;
    const dateOnly = publishedAt
      ? String(publishedAt).substring(0, 10)
      : new Date().toISOString().substring(0, 10);

    if (years.length > 0 && !years.includes(Number.parseInt(dateOnly.substring(0, 4), 10))) {
      skipped++;
      continue;
    }

    try {
      await db.insert(cultos).values({
        titulo: snippet?.title || "Culto sem título",
        data: dateOnly,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        pregador: "Pr. Rafael Delmonego",
        descricao: snippet?.description || null,
        status: "publicado",
        created_by: userId,
      });
      imported++;
    } catch (err) {
      console.error("Insert error for video", videoId, err);
    }
  }

  return {
    success: true,
    imported,
    skipped,
    total: items.length,
    nextPageToken: ytData.nextPageToken ?? null,
    hasMore: !!ytData.nextPageToken,
  };
}

async function fetchJson(url: URL): Promise<any> {
  const res = await fetch(url.toString());
  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `YouTube API error (${res.status})`);
  }
  return data;
}
