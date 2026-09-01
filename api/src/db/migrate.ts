import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDb, getDb } from "./client.ts";

/** Applies every pending migration in ./drizzle, then exits. */
async function main() {
  const db = getDb();
  await migrate(db, { migrationsFolder: new URL("../../drizzle", import.meta.url).pathname });
  console.log("Migrations applied.");
  await closeDb();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
