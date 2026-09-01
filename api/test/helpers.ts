import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { createApp } from "../src/app.ts";
import type { DB } from "../src/db/client.ts";
import * as schema from "../src/db/schema.ts";

const MIGRATIONS = new URL("../drizzle", import.meta.url).pathname;

export interface TestCtx {
  db: DB;
  app: ReturnType<typeof createApp>;
  request: (path: string, init?: RequestInit) => Promise<Response>;
  close: () => Promise<void>;
}

/** Fresh in-memory Postgres (PGlite) + migrated schema + wired Hono app. */
export async function setupTest(): Promise<TestCtx> {
  const client = new PGlite();
  const db = drizzle(client, { schema, casing: "snake_case" }) as unknown as DB;
  await migrate(db as never, { migrationsFolder: MIGRATIONS });

  const app = createApp({ db, quiet: true });
  const request = (path: string, init?: RequestInit): Promise<Response> =>
    Promise.resolve(app.request(path, init));

  return {
    db,
    app,
    request,
    close: () => client.close(),
  };
}

/** Typed JSON body reader for terse assertions. */
export function body<T = any>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

/** Reads the Set-Cookie value for a given cookie name from a response. */
export function readCookie(res: Response, name: string): string | null {
  const raw = res.headers.get("set-cookie");
  if (!raw) return null;
  const m = new RegExp(`${name}=([^;]+)`).exec(raw);
  return m ? m[1] : null;
}

export const jsonHeaders = { "Content-Type": "application/json" };
