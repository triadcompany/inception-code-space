import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type AuthUser, fetchMe, logout } from "@/lib/auth";
import { getToken, onAuthChange } from "@/lib/session";

/**
 * Auth state derived from the access token. Re-resolves whenever the token
 * changes (login/logout anywhere in the app).
 */
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const resolve = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    const me = await fetchMe();
    setUser(me);
    setLoading(false);
  }, []);

  useEffect(() => {
    resolve();
    return onAuthChange(() => {
      setLoading(true);
      resolve();
    });
  }, [resolve]);

  const signOut = async () => {
    await logout();
    navigate("/admin/login");
  };

  return { user, isAdmin: !!user?.is_admin, loading, signOut };
};
