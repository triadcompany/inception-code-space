import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../auth/password.ts";
import { requireAuth } from "../auth/middleware.ts";
import {
  REFRESH_TTL_MS,
  issueRefresh,
  revokeRefresh,
  rotateRefresh,
  signAccess,
} from "../auth/tokens.ts";
import type { DB } from "../db/client.ts";
import { user_roles, users } from "../db/schema.ts";
import { env } from "../env.ts";
import { badRequest, conflict, notFound, ok, unauthorized } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";

const REFRESH_COOKIE = "refresh_token";

const credentials = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres"),
  display_name: z.string().trim().min(1).max(120).optional(),
});

const profilePatch = z.object({
  display_name: z.string().trim().min(1).max(120).optional(),
  avatar_url: z.string().trim().max(2048).nullable().optional(),
});

export async function loadRoles(db: DB, userId: string): Promise<string[]> {
  const rows = await db
    .select({ role: user_roles.role })
    .from(user_roles)
    .where(eq(user_roles.user_id, userId));
  return rows.map((r) => r.role);
}

export function serializeUser(u: typeof users.$inferSelect, roles: string[]) {
  return {
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
    approved: u.approved,
    created_at: u.created_at,
    roles,
    is_admin: roles.includes("admin"),
  };
}

function setRefreshCookie(c: Context<AppEnv>, token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: Math.floor(REFRESH_TTL_MS / 1000),
  });
}

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/register", async (c) => {
  const parsed = credentials.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos");
  const { email, password, display_name } = parsed.data;
  const db = c.get("db");

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length) throw conflict("E-mail já cadastrado");

  const [created] = await db
    .insert(users)
    .values({ email, password_hash: await hashPassword(password), display_name: display_name ?? email })
    .returning();

  const roles = await loadRoles(db, created.id);
  setRefreshCookie(c, await issueRefresh(db, created.id));
  return ok(
    c,
    {
      accessToken: signAccess({ sub: created.id, email: created.email, roles, approved: created.approved }),
      user: serializeUser(created, roles),
    },
    201,
  );
});

authRoutes.post("/login", async (c) => {
  const parsed = credentials
    .pick({ email: true, password: true })
    .safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest("Informe e-mail e senha");
  const { email, password } = parsed.data;
  const db = c.get("db");

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw unauthorized("E-mail ou senha incorretos");
  }

  const roles = await loadRoles(db, user.id);
  setRefreshCookie(c, await issueRefresh(db, user.id));
  return ok(c, {
    accessToken: signAccess({ sub: user.id, email: user.email, roles, approved: user.approved }),
    user: serializeUser(user, roles),
  });
});

authRoutes.post("/refresh", async (c) => {
  const db = c.get("db");
  const raw = getCookie(c, REFRESH_COOKIE);
  if (!raw) throw unauthorized("Sem sessão");

  const rotated = await rotateRefresh(db, raw);
  if (!rotated) {
    deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
    throw unauthorized("Sessão inválida");
  }

  const [user] = await db.select().from(users).where(eq(users.id, rotated.userId));
  if (!user) {
    deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
    throw unauthorized("Usuário não encontrado");
  }

  const roles = await loadRoles(db, user.id);
  setRefreshCookie(c, rotated.token);
  return ok(c, {
    accessToken: signAccess({ sub: user.id, email: user.email, roles, approved: user.approved }),
    user: serializeUser(user, roles),
  });
});

authRoutes.post("/logout", async (c) => {
  const raw = getCookie(c, REFRESH_COOKIE);
  if (raw) await revokeRefresh(c.get("db"), raw);
  deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
  return ok(c, { success: true });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const db = c.get("db");
  const [user] = await db.select().from(users).where(eq(users.id, c.get("user").id));
  if (!user) throw notFound("Usuário não encontrado");
  return ok(c, { user: serializeUser(user, await loadRoles(db, user.id)) });
});

authRoutes.patch("/me", requireAuth, async (c) => {
  const parsed = profilePatch.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) throw badRequest("Dados inválidos");
  const patch = parsed.data;
  if (Object.keys(patch).length === 0) throw badRequest("Nada para atualizar");

  const db = c.get("db");
  const [user] = await db
    .update(users)
    .set({
      ...(patch.display_name !== undefined ? { display_name: patch.display_name } : {}),
      ...(patch.avatar_url !== undefined ? { avatar_url: patch.avatar_url } : {}),
    })
    .where(eq(users.id, c.get("user").id))
    .returning();
  if (!user) throw notFound("Usuário não encontrado");
  return ok(c, { user: serializeUser(user, await loadRoles(db, user.id)) });
});
