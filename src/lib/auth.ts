// Auth calls against /api/auth. Access token is kept by `session.ts`; the
// refresh token lives in an httpOnly cookie the browser sends automatically.

import { api } from "./api";
import { clearSession, setToken } from "./session";

export interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  approved: boolean;
  created_at: string;
  roles: string[];
  is_admin: boolean;
}

interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export async function login(email: string, password: string) {
  const { data, error } = await api.post<AuthPayload>("/auth/login", {
    email: email.trim(),
    password,
  });
  if (data?.accessToken) setToken(data.accessToken);
  return { data: data?.user ?? null, error };
}

export async function register(email: string, password: string, displayName: string) {
  const { data, error } = await api.post<AuthPayload>("/auth/register", {
    email: email.trim(),
    password,
    display_name: displayName.trim(),
  });
  // Accounts need admin approval before use — drop the session immediately.
  await api.post("/auth/logout");
  clearSession();
  return { data: data?.user ?? null, error };
}

export async function logout() {
  await api.post("/auth/logout");
  clearSession();
}

export async function fetchMe(): Promise<AuthUser | null> {
  const { data } = await api.get<{ user: AuthUser }>("/auth/me");
  return data?.user ?? null;
}

export function updateProfile(patch: { display_name?: string; avatar_url?: string | null }) {
  return api.patch<{ user: AuthUser }>("/auth/me", patch);
}

export function changePassword(newPassword: string) {
  return api.patch<{ success: boolean }>("/auth/password", { newPassword });
}
