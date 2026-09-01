import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin } from "../auth/middleware.ts";
import { paginas } from "../db/schema.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";

const createInput = z.object({
  slug: z.string().trim().min(1).max(200),
  titulo: z.string().trim().min(1).max(300),
  conteudo: z.string().max(500000).nullish(),
});
const updateInput = createInput.partial();

export const paginasRoutes = new Hono<AppEnv>();

// Public — pages are readable by anyone.
paginasRoutes.get("/", async (c) => {
  const rows = await c.get("db").select().from(paginas).orderBy(asc(paginas.titulo));
  return ok(c, rows);
});

paginasRoutes.get("/slug/:slug", async (c) => {
  const [row] = await c.get("db").select().from(paginas).where(eq(paginas.slug, c.req.param("slug")));
  if (!row) throw notFound("Página não encontrada");
  return ok(c, row);
});

paginasRoutes.get("/:id", async (c) => {
  const [row] = await c.get("db").select().from(paginas).where(eq(paginas.id, c.req.param("id")));
  if (!row) throw notFound("Página não encontrada");
  return ok(c, row);
});

paginasRoutes.post("/", requireAdmin, async (c) => {
  const parsed = createInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const [row] = await c.get("db").insert(paginas).values(parsed.data).returning();
  return ok(c, row, 201);
});

paginasRoutes.patch("/:id", requireAdmin, async (c) => {
  const parsed = updateInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  if (Object.keys(parsed.data).length === 0) throw badRequest("Nada para atualizar");
  const [row] = await c
    .get("db")
    .update(paginas)
    .set(parsed.data)
    .where(eq(paginas.id, c.req.param("id")))
    .returning();
  if (!row) throw notFound("Página não encontrada");
  return ok(c, row);
});

paginasRoutes.delete("/:id", requireAdmin, async (c) => {
  const [row] = await c
    .get("db")
    .delete(paginas)
    .where(eq(paginas.id, c.req.param("id")))
    .returning({ id: paginas.id });
  if (!row) throw notFound("Página não encontrada");
  return ok(c, { success: true });
});
