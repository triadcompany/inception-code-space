import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";
import type { DB } from "./db/client.ts";
import { env } from "./env.ts";
import { authRoutes } from "./routes/auth.ts";
import type { AppEnv } from "./types.ts";

export interface AppOptions {
  db: DB;
  /** Disable request logging (tests). */
  quiet?: boolean;
}

export function createApp({ db, quiet }: AppOptions): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  if (!quiet) app.use("*", logger());

  if (env.CORS_ORIGINS.length > 0) {
    app.use(
      "*",
      cors({
        origin: env.CORS_ORIGINS,
        credentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      }),
    );
  }

  // Make the DB handle available to every route (swapped for PGlite in tests).
  app.use("*", async (c, next) => {
    c.set("db", db);
    await next();
  });

  app.get("/api/health", (c) => c.json({ ok: true }));

  app.route("/api/auth", authRoutes);

  app.notFound((c) => c.json({ error: "Não encontrado" }, 404));

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    if (err instanceof ZodError) {
      return c.json({ error: err.issues[0]?.message ?? "Dados inválidos" }, 400);
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Erro interno" }, 500);
  });

  return app;
}
