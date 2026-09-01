import { and, eq, gte, ilike, inArray, lte, or, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { optionalAuth, requireAdmin } from "../auth/middleware.ts";
import { cultos } from "../db/schema.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import { isAdmin, orderBy, parseListQuery } from "../lib/list.ts";
import type { AppEnv } from "../types.ts";

const ORDER_COLS = { data: cultos.data, created_at: cultos.created_at, titulo: cultos.titulo };

const nullableText = z.string().trim().max(20000).nullish();

const createInput = z.object({
  titulo: z.string().trim().min(1).max(500),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  pregador: nullableText,
  video_url: nullableText,
  thumbnail_url: nullableText,
  descricao: nullableText,
  resumo: nullableText,
  status: z.string().trim().max(40).default("rascunho"),
  tipo: z.string().trim().max(40).default("geral"),
  tema_id: z.string().uuid().nullish(),
  tag_jovem_id: z.string().uuid().nullish(),
  tag_geral_id: z.string().uuid().nullish(),
  created_by: z.string().uuid().nullish(),
});

const updateInput = createInput.partial();

/** Row-visibility condition mirroring the old RLS policies. */
function visibilityFilter(c: Parameters<typeof isAdmin>[0]): SQL | undefined {
  if (isAdmin(c)) return undefined;
  const user = c.get("user");
  const tipos = user?.approved ? ["geral", "jovens"] : ["geral"];
  return and(eq(cultos.status, "publicado"), inArray(cultos.tipo, tipos));
}

export const cultosRoutes = new Hono<AppEnv>();

cultosRoutes.get("/", optionalAuth, async (c) => {
  const db = c.get("db");
  const { limit, offset, order, dir, search } = parseListQuery(c);
  const q = c.req.query();

  const conds: (SQL | undefined)[] = [visibilityFilter(c)];
  if (search) conds.push(ilike(cultos.titulo, `%${search}%`));
  if (q.tipo) conds.push(eq(cultos.tipo, q.tipo));
  if (isAdmin(c) && q.status) conds.push(eq(cultos.status, q.status));
  if (q.year && /^\d{4}$/.test(q.year)) {
    conds.push(gte(cultos.data, `${q.year}-01-01`), lte(cultos.data, `${q.year}-12-31`));
  }

  const rows = await db
    .select()
    .from(cultos)
    .where(and(...conds.filter(Boolean)))
    .orderBy(orderBy(ORDER_COLS, order, "data", dir))
    .limit(limit)
    .offset(offset);
  return ok(c, rows);
});

cultosRoutes.get("/:id", optionalAuth, async (c) => {
  const db = c.get("db");
  const [row] = await db
    .select()
    .from(cultos)
    .where(and(eq(cultos.id, c.req.param("id")), visibilityFilter(c)));
  if (!row) throw notFound("Culto não encontrado");
  return ok(c, row);
});

cultosRoutes.post("/", requireAdmin, async (c) => {
  const parsed = createInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const [row] = await c.get("db").insert(cultos).values(parsed.data).returning();
  return ok(c, row, 201);
});

cultosRoutes.patch("/:id", requireAdmin, async (c) => {
  const parsed = updateInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  if (Object.keys(parsed.data).length === 0) throw badRequest("Nada para atualizar");
  const [row] = await c
    .get("db")
    .update(cultos)
    .set(parsed.data)
    .where(eq(cultos.id, c.req.param("id")))
    .returning();
  if (!row) throw notFound("Culto não encontrado");
  return ok(c, row);
});

cultosRoutes.delete("/:id", requireAdmin, async (c) => {
  const [row] = await c
    .get("db")
    .delete(cultos)
    .where(eq(cultos.id, c.req.param("id")))
    .returning({ id: cultos.id });
  if (!row) throw notFound("Culto não encontrado");
  return ok(c, { success: true });
});
