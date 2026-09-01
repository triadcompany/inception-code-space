import { asc, count, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin } from "../auth/middleware.ts";
import { galeria_fotos } from "../db/schema.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import { parseListQuery } from "../lib/list.ts";
import type { AppEnv } from "../types.ts";

const createInput = z.object({
  url: z.string().trim().min(1).max(2048),
  categoria: z.string().trim().min(1).max(120),
  descricao: z.string().max(2000).nullish(),
  ordem: z.number().int().nullish(),
});
const updateInput = createInput.partial();

export const galeriaRoutes = new Hono<AppEnv>();

// Public — gallery photos are readable by anyone.
galeriaRoutes.get("/", async (c) => {
  const { limit, offset } = parseListQuery(c, 2000);
  const categoria = c.req.query("categoria");
  const rows = await c
    .get("db")
    .select()
    .from(galeria_fotos)
    .where(categoria ? eq(galeria_fotos.categoria, categoria) : undefined)
    .orderBy(asc(galeria_fotos.ordem), asc(galeria_fotos.created_at))
    .limit(limit)
    .offset(offset);
  return ok(c, rows);
});

// Counts grouped by categoria: { [categoria]: number }.
galeriaRoutes.get("/counts", async (c) => {
  const rows = await c
    .get("db")
    .select({ categoria: galeria_fotos.categoria, total: count() })
    .from(galeria_fotos)
    .groupBy(galeria_fotos.categoria);
  return ok(c, Object.fromEntries(rows.map((r) => [r.categoria, Number(r.total)])));
});

galeriaRoutes.post("/", requireAdmin, async (c) => {
  const parsed = createInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const [row] = await c.get("db").insert(galeria_fotos).values(parsed.data).returning();
  return ok(c, row, 201);
});

galeriaRoutes.patch("/:id", requireAdmin, async (c) => {
  const parsed = updateInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  if (Object.keys(parsed.data).length === 0) throw badRequest("Nada para atualizar");
  const [row] = await c
    .get("db")
    .update(galeria_fotos)
    .set(parsed.data)
    .where(eq(galeria_fotos.id, c.req.param("id")))
    .returning();
  if (!row) throw notFound("Foto não encontrada");
  return ok(c, row);
});

galeriaRoutes.delete("/:id", requireAdmin, async (c) => {
  const [row] = await c
    .get("db")
    .delete(galeria_fotos)
    .where(eq(galeria_fotos.id, c.req.param("id")))
    .returning({ id: galeria_fotos.id });
  if (!row) throw notFound("Foto não encontrada");
  return ok(c, { success: true });
});
