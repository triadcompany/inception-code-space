import { useEffect } from "react";

/**
 * Scopes the light theme to the admin area: adds `admin-light` on <html> while
 * mounted (so shadcn primitives and their portals render light), removes on
 * unmount. The public site keeps the dark :root palette.
 */
export function useAdminTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("admin-light");
    return () => root.classList.remove("admin-light");
  }, []);
}
