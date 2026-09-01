import type { Context, MiddlewareHandler } from "hono";
import type { AppEnv } from "../types.ts";
import { forbidden, unauthorized } from "../lib/http.ts";
import { verifyAccess } from "./tokens.ts";

function bearer(header: string | undefined): string | null {
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header.trim());
  return m ? m[1] : null;
}

/** Verifies the access token and stores c.var.user; throws 401 on failure. */
function toUser(claims: NonNullable<ReturnType<typeof verifyAccess>>) {
  return {
    id: claims.sub,
    email: claims.email,
    roles: claims.roles,
    approved: claims.approved,
  };
}

/** Verifies the access token and stores c.var.user; throws 401 on failure. */
function authenticate(c: Context<AppEnv>): void {
  const token = bearer(c.req.header("Authorization"));
  if (!token) throw unauthorized();
  const claims = verifyAccess(token);
  if (!claims) throw unauthorized("Sessão expirada");
  c.set("user", toUser(claims));
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  authenticate(c);
  await next();
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  authenticate(c);
  if (!c.get("user").roles.includes("admin")) throw forbidden("Apenas administradores");
  await next();
};

/** Attaches c.var.user when a valid token is present, otherwise continues. */
export const optionalAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = bearer(c.req.header("Authorization"));
  const claims = token ? verifyAccess(token) : null;
  if (claims) c.set("user", toUser(claims));
  await next();
};

/** Guards the internal youtube-live-check endpoint. */
export const requireInternalToken =
  (expected: string): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    if (c.req.header("x-internal-token") !== expected) throw unauthorized();
    await next();
  };
