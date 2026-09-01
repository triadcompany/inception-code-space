import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { startCron } from "./cron.ts";
import { closeDb, getDb } from "./db/client.ts";
import { env } from "./env.ts";

const db = getDb();
const app = createApp({ db });
startCron(db);

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

async function shutdown() {
  server.close();
  await closeDb();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
