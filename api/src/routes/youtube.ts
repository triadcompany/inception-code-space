import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin, requireInternalToken } from "../auth/middleware.ts";
import { site_config } from "../db/schema.ts";
import { env } from "../env.ts";
import { badRequest, ok } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";
import { importFromYouTube } from "../youtube/import.ts";
import { runLiveCheck } from "../youtube/live-check.ts";

const importInput = z.object({
  channelId: z.string().min(1),
  pageToken: z.string().optional(),
  mode: z.enum(["live", "videos"]).optional(),
  years: z.array(z.number().int()).optional(),
});

export const youtubeRoutes = new Hono<AppEnv>();

// Admin — import channel uploads into `cultos`.
youtubeRoutes.post("/import", requireAdmin, async (c) => {
  if (!env.YOUTUBE_API_KEY) throw badRequest("YOUTUBE_API_KEY não configurada");
  const parsed = importInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const result = await importFromYouTube(c.get("db"), {
    ...parsed.data,
    userId: c.get("user").id,
    apiKey: env.YOUTUBE_API_KEY,
  });
  return ok(c, result);
});

// Public — cheap read of the persisted live state (no YouTube call).
youtubeRoutes.get("/live", async (c) => {
  const [row] = await c
    .get("db")
    .select()
    .from(site_config)
    .where(eq(site_config.key, "current_live"));
  const v = (row?.value as Record<string, any>) ?? {};
  return ok(c, {
    live: v.isLive === true,
    videoId: v.videoId ?? null,
    title: v.title ?? null,
    thumbnail: v.thumbnail ?? null,
  });
});

// Internal — the heavy check, called by the cron (and manually with the token).
youtubeRoutes.post("/live-check", requireInternalToken(env.INTERNAL_TOKEN), async (c) => {
  return ok(c, await runLiveCheck(c.get("db"), env.YOUTUBE_API_KEY));
});
