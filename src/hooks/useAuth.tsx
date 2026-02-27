import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Cache admin status to avoid redundant DB queries
const adminCache = new Map<string, { value: boolean; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const initialCheckDone = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    // Return cached result if fresh
    const cached = adminCache.get(userId);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.value;

    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      const result = !!data;
      adminCache.set(userId, { value: result, ts: Date.now() });
      return result;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialCheckDone.current) return;

        // Skip if user hasn't changed
        const newUserId = session?.user?.id ?? null;
        if (newUserId === lastUserId.current && event === "TOKEN_REFRESHED") {
          return;
        }

        if (session?.user) {
          setUser(session.user);
          lastUserId.current = session.user.id;
          const admin = await checkAdminRole(session.user.id);
          setIsAdmin(admin);
        } else {
          setUser(null);
          setIsAdmin(false);
          lastUserId.current = null;
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        lastUserId.current = session.user.id;
        const admin = await checkAdminRole(session.user.id);
        setIsAdmin(admin);
      }
      setLoading(false);
      initialCheckDone.current = true;
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { user, isAdmin, loading, signOut };
};
