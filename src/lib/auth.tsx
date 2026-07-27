import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, ACCESS_KEY, REFRESH_KEY } from "./api";
import type { AdminUser } from "./types";

const ADMIN_ROLES = ["admin", "super_admin"];

type Ctx = {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  logIn: (mobile: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem(ACCESS_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        const me: AdminUser = res.data.data.user;
        if (!ADMIN_ROLES.includes(me.role)) {
          localStorage.removeItem(ACCESS_KEY);
          localStorage.removeItem(REFRESH_KEY);
        } else {
          setUser(me);
        }
      } catch {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logIn = async (mobile: string, password: string) => {
    setError(null);
    try {
      const res = await api.post("/auth/login", { mobile, password });
      const { user: loggedInUser, accessToken, refreshToken } = res.data.data;
      if (!ADMIN_ROLES.includes(loggedInUser.role)) {
        throw new Error("This account does not have admin access.");
      }
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      setUser(loggedInUser);
    } catch (e: any) {
      const message = e?.response?.data?.message || e.message || "Login failed";
      setError(message);
      throw new Error(message);
    }
  };

  const logOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — we clear local state regardless
    }
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, error, logIn, logOut }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
