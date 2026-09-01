import { createHash, randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import type { DB } from "../db/client.ts";
import { refresh_tokens } from "../db/schema.ts";
import { env } from "../env.ts";

export const ACCESS_TTL_SECONDS = 15 * 60; // 15 min
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AccessClaims {
  sub: string;
  email: string;
  roles: string[];
  approved: boolean;
}

export function signAccess(claims: AccessClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_TTL_SECONDS,
  });
}

export function verifyAccess(token: string): AccessClaims | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "string") return null;
    return {
      sub: String(decoded.sub),
      email: String(decoded.email ?? ""),
      roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : [],
      approved: decoded.approved === true,
    };
  } catch {
    return null;
  }
}

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Creates a refresh token, stores only its hash, returns the raw value. */
export async function issueRefresh(db: DB, userId: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS).toISOString();
  await db.insert(refresh_tokens).values({ user_id: userId, token_hash: sha256(raw), expires_at: expiresAt });
  return raw;
}

/**
 * Validates a raw refresh token, deletes it (single use), and issues a fresh
 * one. Returns the new raw token + user id, or null if invalid/expired.
 */
export async function rotateRefresh(
  db: DB,
  raw: string,
): Promise<{ token: string; userId: string } | null> {
  const hash = sha256(raw);
  const [row] = await db.select().from(refresh_tokens).where(eq(refresh_tokens.token_hash, hash));
  if (!row) return null;
  await db.delete(refresh_tokens).where(eq(refresh_tokens.id, row.id));
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  const token = await issueRefresh(db, row.user_id);
  return { token, userId: row.user_id };
}

export async function revokeRefresh(db: DB, raw: string): Promise<void> {
  await db.delete(refresh_tokens).where(eq(refresh_tokens.token_hash, sha256(raw)));
}

export async function revokeAllForUser(db: DB, userId: string): Promise<void> {
  await db.delete(refresh_tokens).where(eq(refresh_tokens.user_id, userId));
}

/** Housekeeping: drop expired rows. Safe to call opportunistically. */
export async function purgeExpired(db: DB): Promise<void> {
  await db.delete(refresh_tokens).where(lt(refresh_tokens.expires_at, new Date().toISOString()));
}
