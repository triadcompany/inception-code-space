import cron from "node-cron";
import type { DB } from "./db/client.ts";
import { env } from "./env.ts";
import { runLiveCheck } from "./youtube/live-check.ts";

/** Starts the youtube-live-check cron (every 2 min) when enabled. */
export function startCron(db: DB): void {
  if (!env.ENABLE_CRON) return;
  if (!env.YOUTUBE_API_KEY) {
    console.warn("ENABLE_CRON=true but YOUTUBE_API_KEY is empty — live-check cron disabled");
    return;
  }
  cron.schedule("*/2 * * * *", async () => {
    try {
      const status = await runLiveCheck(db, env.YOUTUBE_API_KEY);
      console.log(`[cron] live-check: live=${status.live}${status.videoId ? ` (${status.videoId})` : ""}`);
    } catch (err) {
      console.error("[cron] live-check failed:", err);
    }
  });
  console.log("live-check cron scheduled (*/2 * * * *)");
}
