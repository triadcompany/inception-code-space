import { eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin } from "../auth/middleware.ts";
import { site_config } from "../db/schema.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";

const valueInput = z.object({ value: z.record(z.string(), z.unknown()) });

export const siteConfigRoutes = new Hono<AppEnv>();

// Public — anyone can read the site config.
siteConfigRoutes.get("/", async (c) => {
  const rows = await c.get("db").select().from(site_config);
  return ok(c, rows);
});

siteConfigRoutes.get("/:key", async (c) => {
  const [row] = await c
    .get("db")
    .select()
    .from(site_config)
    .where(eq(site_config.key, c.req.param("key")));
  if (!row) throw notFound("Configuração não encontrada");
  return ok(c, row);
});

// Upsert a config key.
siteConfigRoutes.put("/:key", requireAdmin, async (c) => {
  const parsed = valueInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest("Envie { value: {...} }");
  const key = c.req.param("key");
  const [row] = await c
    .get("db")
    .insert(site_config)
    .values({ key, value: parsed.data.value })
    .onConflictDoUpdate({
      target: site_config.key,
      set: { value: parsed.data.value, updated_at: sql`now()` },
    })
    .returning();
  return ok(c, row);
});
