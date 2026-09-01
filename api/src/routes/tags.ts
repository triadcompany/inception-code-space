import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin } from "../auth/middleware.ts";
import { tags_gerais, tags_jovens } from "../db/schema.ts";
import { badRequest, conflict, notFound, ok } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";

type TagTable = typeof tags_gerais | typeof tags_jovens;

const nameInput = z.object({ nome: z.string().trim().min(1).max(200) });

export function makeTagRoutes(table: TagTable) {
  const cols = table as typeof tags_gerais;
  const routes = new Hono<AppEnv>();

  routes.get("/", async (c) => {
    const rows = await c.get("db").select().from(table).orderBy(asc(cols.nome));
    return ok(c, rows);
  });

  routes.post("/", requireAdmin, async (c) => {
    const parsed = nameInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw badRequest("Informe o nome da tag");
    const existing = await c.get("db").select({ id: cols.id }).from(table).where(eq(cols.nome, parsed.data.nome));
    if (existing.length) throw conflict("Tag já existe");
    const [row] = await c.get("db").insert(table).values(parsed.data).returning();
    return ok(c, row, 201);
  });

  routes.delete("/:id", requireAdmin, async (c) => {
    const [row] = await c
      .get("db")
      .delete(table)
      .where(eq(cols.id, c.req.param("id")))
      .returning({ id: cols.id });
    if (!row) throw notFound("Tag não encontrada");
    return ok(c, { success: true });
  });

  return routes;
}

export const tagsGeraisRoutes = makeTagRoutes(tags_gerais);
export const tagsJovensRoutes = makeTagRoutes(tags_jovens);
