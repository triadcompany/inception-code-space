// Access-token session store: kept in memory, mirrored to localStorage so a
// page reload stays logged in until the token is validated against the API.

const STORAGE_KEY = "auth_token";

let accessToken: string | null = readStored();
const listeners = new Set<() => void>();

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string | null): void {
  accessToken = token;
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / storage disabled — in-memory still works */
  }
  for (const fn of listeners) fn();
}

export function clearSession(): void {
  setToken(null);
}

/** Subscribe to token changes (login/logout). Returns an unsubscribe fn. */
export function onAuthChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
