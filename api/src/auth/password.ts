import bcrypt from "bcryptjs";

/**
 * bcrypt with cost 10. Supabase GoTrue also stores bcrypt hashes in
 * `auth.users.encrypted_password`, so migrated hashes verify here unchanged.
 */
const COST = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
