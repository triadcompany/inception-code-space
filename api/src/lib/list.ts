import type { Context } from "hono";
import { asc, desc, type Column, type SQL } from "drizzle-orm";
import type { AppEnv } from "../types.ts";

export interface ListQuery {
  limit: number;
  offset: number;
  order: string | null;
  dir: "asc" | "desc";
  search: string | null;
}

/** Parses ?limit=&offset=&order=&dir=&search= with sane bounds. */
export function parseListQuery(c: Context<AppEnv>, maxLimit = 500): ListQuery {
  const q = c.req.query();
  const limit = Math.min(Math.max(Number.parseInt(q.limit ?? "", 10) || maxLimit, 1), maxLimit);
  const offset = Math.max(Number.parseInt(q.offset ?? "", 10) || 0, 0);
  const dir = q.dir === "asc" ? "asc" : "desc";
  return {
    limit,
    offset,
    order: q.order ?? null,
    dir,
    search: q.search?.trim() ? q.search.trim() : null,
  };
}

/** Resolves an order column from a whitelist and applies the direction. */
export function orderBy(
  columns: Record<string, Column>,
  requested: string | null,
  fallback: string,
  dir: "asc" | "desc",
): SQL {
  const col = (requested && columns[requested]) || columns[fallback];
  return dir === "asc" ? asc(col) : desc(col);
}

/** True when the request carries a valid admin access token. */
export function isAdmin(c: Context<AppEnv>): boolean {
  return (c.get("user")?.roles ?? []).includes("admin");
}
