import { and, eq, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { optionalAuth, requireAdmin } from "../auth/middleware.ts";
import { doutrinas, estudos } from "../db/schema.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import { isAdmin, orderBy, parseListQuery } from "../lib/list.ts";
import type { AppEnv } from "../types.ts";

/**
 * `doutrinas` and `estudos` are structurally identical (estudos adds `tema_id`).
 * One factory serves both; visibility mirrors the old RLS: non-admins see
 * `publicado = true` only.
 */
type ConteudoTable = typeof doutrinas | typeof estudos;

const baseInput = z.object({
  titulo: z.string().trim().min(1).max(500),
  autor: z.string().trim().min(1).max(200),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser YYYY-MM-DD"),
  resumo: z.string().max(100000).nullish(),
  conteudo: z.string().max(500000).nullish(),
  publicado: z.boolean().optional(),
  created_by: z.string().uuid().nullish(),
});

const withTema = baseInput.extend({ tema_id: z.string().uuid().nullish() });

export function makeConteudoRoutes(table: ConteudoTable, opts: { tema: boolean }) {
  const createInput = opts.tema ? withTema : baseInput;
  const updateInput = createInput.partial();
  const cols = table as typeof estudos; // widest shape; `tema_id` guarded by opts.tema

  const routes = new Hono<AppEnv>();

  const visibility = (c: Parameters<typeof isAdmin>[0]): SQL | undefined =>
    isAdmin(c) ? undefined : eq(cols.publicado, true);

  routes.get("/", optionalAuth, async (c) => {
    const { limit, offset, order, dir } = parseListQuery(c);
    const rows = await c
      .get("db")
      .select()
      .from(table)
      .where(visibility(c))
      .orderBy(orderBy({ data: cols.data, created_at: cols.created_at }, order, "data", dir))
      .limit(limit)
      .offset(offset);
    return ok(c, rows);
  });

  routes.get("/:id", optionalAuth, async (c) => {
    const [row] = await c
      .get("db")
      .select()
      .from(table)
      .where(and(eq(cols.id, c.req.param("id")), visibility(c)));
    if (!row) throw notFound("Não encontrado");
    return ok(c, row);
  });

  routes.post("/", requireAdmin, async (c) => {
    const parsed = createInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
    const [row] = await c.get("db").insert(table).values(parsed.data as never).returning();
    return ok(c, row, 201);
  });

  routes.patch("/:id", requireAdmin, async (c) => {
    const parsed = updateInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
    if (Object.keys(parsed.data).length === 0) throw badRequest("Nada para atualizar");
    const [row] = await c
      .get("db")
      .update(table)
      .set(parsed.data as never)
      .where(eq(cols.id, c.req.param("id")))
      .returning();
    if (!row) throw notFound("Não encontrado");
    return ok(c, row);
  });

  routes.delete("/:id", requireAdmin, async (c) => {
    const [row] = await c
      .get("db")
      .delete(table)
      .where(eq(cols.id, c.req.param("id")))
      .returning({ id: cols.id });
    if (!row) throw notFound("Não encontrado");
    return ok(c, { success: true });
  });

  return routes;
}

export const doutrinasRoutes = makeConteudoRoutes(doutrinas, { tema: false });
export const estudosRoutes = makeConteudoRoutes(estudos, { tema: true });
