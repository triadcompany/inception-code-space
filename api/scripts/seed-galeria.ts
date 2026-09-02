/**
 * Imports a folder of images into `galeria_fotos` + the uploads volume.
 *
 *   tsx scripts/seed-galeria.ts <dir> --categoria "Sexta"   # flat: all images -> one categoria
 *   tsx scripts/seed-galeria.ts <dir>                        # nested: each subfolder name = categoria
 *
 * Copies each file to $UPLOAD_DIR/galeria/<uuid><ext> and inserts a row with
 * url = /uploads/galeria/<file>. Safe to re-run (it always appends new rows —
 * dedupe by clearing the table first if you need a clean slate).
 */
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { closeDb, getDb } from "../src/db/client.ts";
import { galeria_fotos } from "../src/db/schema.ts";
import { env } from "../src/env.ts";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

async function listImages(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXT.has(extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();
}

async function importDir(srcDir: string, categoria: string): Promise<number> {
  const db = getDb();
  const targetDir = join(resolve(env.UPLOAD_DIR), "galeria");
  await mkdir(targetDir, { recursive: true });

  const files = await listImages(srcDir);
  let n = 0;
  for (const [i, name] of files.entries()) {
    const ext = extname(name).toLowerCase();
    const stored = `${randomUUID()}${ext}`;
    await copyFile(join(srcDir, name), join(targetDir, stored));
    await db.insert(galeria_fotos).values({
      url: `/uploads/galeria/${stored}`,
      categoria,
      descricao: name.replace(/\.[^/.]+$/, ""),
      ordem: i,
    });
    n++;
  }
  console.log(`  ${categoria}: ${n} foto(s)`);
  return n;
}

async function main() {
  const [dirArg, ...rest] = process.argv.slice(2);
  if (!dirArg) {
    console.error("uso: tsx scripts/seed-galeria.ts <dir> [--categoria \"Nome\"]");
    process.exit(1);
  }
  const catFlag = rest.indexOf("--categoria");
  const categoria = catFlag >= 0 ? rest[catFlag + 1] : null;
  const root = resolve(dirArg);

  let total = 0;
  if (categoria) {
    total = await importDir(root, categoria);
  } else {
    const subdirs = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory());
    if (subdirs.length === 0) {
      console.error("Sem --categoria e sem subpastas — nada a importar.");
      process.exit(1);
    }
    for (const d of subdirs) {
      total += await importDir(join(root, d.name), d.name);
    }
  }

  console.log(`\nTotal: ${total} foto(s) importada(s) em ${env.UPLOAD_DIR}/galeria`);
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
