// Thin fetch wrapper around the self-hosted API. Mirrors the supabase-js
// ergonomics: every call resolves to `{ data, error }` and never throws.

import { clearSession, getToken, setToken } from "./session";

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api";

export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Query;
  /** Send `body` as-is (FormData); don't JSON-encode or set Content-Type. */
  raw?: boolean;
  /** Internal: prevents infinite refresh loops. */
  _retried?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(buildUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return false;
        const json = await res.json();
        if (json?.accessToken) {
          setToken(json.accessToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, query, raw, _retried } = opts;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (raw) {
    payload = body as BodyInit;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      credentials: "include",
    });
  } catch {
    return { data: null, error: { message: "Falha de conexão com o servidor", status: 0 } };
  }

  // Expired access token — refresh once and replay.
  if (res.status === 401 && !_retried && !path.startsWith("/auth/")) {
    if (await tryRefresh()) {
      return apiRequest<T>(path, { ...opts, _retried: true });
    }
    clearSession();
  }

  if (res.status === 204) return { data: null, error: null };

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    return {
      data: null,
      error: { message: json?.error || `Erro ${res.status}`, status: res.status },
    };
  }
  return { data: json as T, error: null };
}

export const api = {
  get: <T = unknown>(path: string, query?: Query) => apiRequest<T>(path, { query }),
  post: <T = unknown>(path: string, body?: unknown) => apiRequest<T>(path, { method: "POST", body }),
  patch: <T = unknown>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  put: <T = unknown>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  del: <T = unknown>(path: string, query?: Query) =>
    apiRequest<T>(path, { method: "DELETE", query }),
};

/** Uploads a file to a bucket, returns `{ data: { url, path }, error }`. */
export async function uploadFile(
  bucket: "galeria" | "avatars",
  file: File | Blob,
  filename?: string,
): Promise<ApiResult<{ url: string; path: string }>> {
  const fd = new FormData();
  fd.set("bucket", bucket);
  fd.set("file", file, filename ?? (file instanceof File ? file.name : "upload"));
  return apiRequest("/uploads", { method: "POST", body: fd, raw: true });
}

/** Deletes a stored file by its `<bucket>/<name>` path. */
export function deleteFile(path: string): Promise<ApiResult<{ success: boolean }>> {
  return apiRequest("/uploads", { method: "DELETE", query: { path } });
}
