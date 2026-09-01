import type { DB } from "./db/client.ts";

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

/** Hono generics shared by every route module. */
export type AppEnv = {
  Variables: {
    user: AuthUser;
    db: DB;
  };
};
