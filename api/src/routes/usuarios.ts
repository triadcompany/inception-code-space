import { desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { requireAdmin } from "../auth/middleware.ts";
import { user_roles, users } from "../db/schema.ts";
import { badRequest, forbidden, notFound, ok } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";

const patchInput = z.object({
  approved: z.boolean().optional(),
  display_name: z.string().trim().min(1).max(120).optional(),
});

/** Shape mirrors the legacy `profiles` row the admin UI consumes. */
function serialize(u: typeof users.$inferSelect, roles: string[]) {
  return {
    id: u.id,
    user_id: u.id,
    display_name: u.display_name,
    email: u.email,
    approved: u.approved,
    created_at: u.created_at,
    roles,
  };
}

export const usuariosRoutes = new Hono<AppEnv>();

usuariosRoutes.use("*", requireAdmin);

usuariosRoutes.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(users).orderBy(desc(users.created_at));
  const roleRows = rows.length
    ? await db
        .select()
        .from(user_roles)
        .where(inArray(user_roles.user_id, rows.map((r) => r.id)))
    : [];
  const byUser = new Map<string, string[]>();
  for (const r of roleRows) byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role]);
  return ok(c, rows.map((u) => serialize(u, byUser.get(u.id) ?? [])));
});

usuariosRoutes.patch("/:id", async (c) => {
  const parsed = patchInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success || Object.keys(parsed.data).length === 0) throw badRequest("Nada para atualizar");
  const db = c.get("db");
  const [row] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, c.req.param("id")))
    .returning();
  if (!row) throw notFound("Usuário não encontrado");
  const roles = await db
    .select({ role: user_roles.role })
    .from(user_roles)
    .where(eq(user_roles.user_id, row.id));
  return ok(c, serialize(row, roles.map((r) => r.role)));
});

// Port of the `delete-user` edge function.
usuariosRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (id === c.get("user").id) throw forbidden("Você não pode excluir sua própria conta");
  const [row] = await c.get("db").delete(users).where(eq(users.id, id)).returning({ id: users.id });
  if (!row) throw notFound("Usuário não encontrado");
  return ok(c, { success: true });
});
