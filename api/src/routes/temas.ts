import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { optionalAuth, requireAdmin } from "../auth/middleware.ts";
import { temas } from "../db/schema.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import { isAdmin, parseListQuery } from "../lib/list.ts";
import type { AppEnv } from "../types.ts";

const createInput = z.object({
  nome: z.string().trim().min(1).max(300),
  descricao: z.string().max(20000).nullish(),
  ordem: z.number().int().optional(),
  publicado: z.boolean().optional(),
  parent_id: z.string().uuid().nullish(),
});
const updateInput = createInput.partial();

export const temasRoutes = new Hono<AppEnv>();

temasRoutes.get("/", optionalAuth, async (c) => {
  const { limit, offset } = parseListQuery(c);
  const rows = await c
    .get("db")
    .select()
    .from(temas)
    .where(isAdmin(c) ? undefined : eq(temas.publicado, true))
    .orderBy(asc(temas.ordem), asc(temas.nome))
    .limit(limit)
    .offset(offset);
  return ok(c, rows);
});

temasRoutes.get("/:id", optionalAuth, async (c) => {
  const [row] = await c
    .get("db")
    .select()
    .from(temas)
    .where(and(eq(temas.id, c.req.param("id")), isAdmin(c) ? undefined : eq(temas.publicado, true)));
  if (!row) throw notFound("Tema não encontrado");
  return ok(c, row);
});

temasRoutes.post("/", requireAdmin, async (c) => {
  const parsed = createInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const [row] = await c.get("db").insert(temas).values(parsed.data).returning();
  return ok(c, row, 201);
});

temasRoutes.patch("/:id", requireAdmin, async (c) => {
  const parsed = updateInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  if (Object.keys(parsed.data).length === 0) throw badRequest("Nada para atualizar");
  const [row] = await c
    .get("db")
    .update(temas)
    .set(parsed.data)
    .where(eq(temas.id, c.req.param("id")))
    .returning();
  if (!row) throw notFound("Tema não encontrado");
  return ok(c, row);
});

temasRoutes.delete("/:id", requireAdmin, async (c) => {
  const [row] = await c
    .get("db")
    .delete(temas)
    .where(eq(temas.id, c.req.param("id")))
    .returning({ id: temas.id });
  if (!row) throw notFound("Tema não encontrado");
  return ok(c, { success: true });
});
