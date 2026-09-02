import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { Hono } from "hono";
import { requireAdmin, requireAuth } from "../auth/middleware.ts";
import { env } from "../env.ts";
import { badRequest, notFound, ok } from "../lib/http.ts";
import type { AppEnv } from "../types.ts";

const BUCKETS = new Set(["galeria", "avatars"]);
const MAX_BYTES = 15 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
const CONTENT_TYPE_BY_EXT = Object.fromEntries(
  Object.entries(EXT_BY_TYPE).map(([t, e]) => [e, t]),
);

const uploadRoot = resolve(env.UPLOAD_DIR);

/** Resolves `<bucket>/<file>` under UPLOAD_DIR, rejecting path traversal. */
function safePath(relative: string): string | null {
  const clean = normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = resolve(uploadRoot, clean);
  return abs === uploadRoot || abs.startsWith(uploadRoot + "/") ? abs : null;
}

export const uploadsRoutes = new Hono<AppEnv>();

uploadsRoutes.post("/", requireAuth, async (c) => {
  const form = await c.req.parseBody();
  const file = form.file;
  const bucket = String(form.bucket ?? "galeria");
  if (!(file instanceof File)) throw badRequest("Envie um arquivo no campo 'file'");
  if (!BUCKETS.has(bucket)) throw badRequest("Bucket inválido");
  if (file.size > MAX_BYTES) throw badRequest("Arquivo maior que 15MB");

  const ext = EXT_BY_TYPE[file.type] ?? extname(file.name).toLowerCase();
  if (!CONTENT_TYPE_BY_EXT[ext]) throw badRequest("Tipo de arquivo não suportado");

  const name = `${randomUUID()}${ext}`;
  const dir = join(uploadRoot, bucket);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), Buffer.from(await file.arrayBuffer()));

  const rel = `${bucket}/${name}`;
  return ok(c, { path: rel, url: `/uploads/${rel}` }, 201);
});

uploadsRoutes.delete("/", requireAdmin, async (c) => {
  const rel = c.req.query("path");
  if (!rel) throw badRequest("Informe ?path=<bucket>/<arquivo>");
  const abs = safePath(rel);
  if (!abs) throw badRequest("Caminho inválido");
  try {
    await unlink(abs);
  } catch {
    throw notFound("Arquivo não encontrado");
  }
  return ok(c, { success: true });
});

/**
 * Dev/fallback static serving. In production nginx serves /uploads directly from
 * the shared volume; this keeps `npm run dev` self-contained.
 */
export const uploadsStatic = new Hono();
uploadsStatic.get("/uploads/*", async (c) => {
  const rel = decodeURIComponent(c.req.path.replace(/^\/uploads\//, ""));
  const abs = safePath(rel);
  if (!abs) return c.json({ error: "Caminho inválido" }, 400);
  try {
    const info = await stat(abs);
    if (!info.isFile()) return c.json({ error: "Não encontrado" }, 404);
    const buf = await readFile(abs);
    return new Response(buf, {
      headers: {
        "Content-Type": CONTENT_TYPE_BY_EXT[extname(abs).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return c.json({ error: "Não encontrado" }, 404);
  }
});
