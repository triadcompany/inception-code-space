import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../env.ts";
import * as schema from "./schema.ts";

export type DB = NodePgDatabase<typeof schema>;

let poolRef: pg.Pool | null = null;
let dbRef: DB | null = null;

export function getPool(): pg.Pool {
  if (!poolRef) {
    poolRef = new pg.Pool({ connectionString: env.DATABASE_URL, max: 10 });
  }
  return poolRef;
}

export function getDb(): DB {
  if (!dbRef) {
    dbRef = drizzle(getPool(), { schema, casing: "snake_case" });
  }
  return dbRef;
}

export async function closeDb(): Promise<void> {
  if (poolRef) {
    await poolRef.end();
    poolRef = null;
    dbRef = null;
  }
}

export { schema };
