"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { api } from "@/infrastructure/api/client";
import { Admin, AuthContextType } from "@/domain/entities/auth.types";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => getStoredAdmin());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Dev Bypass / Mock Login (Only if email or password is 'dev')
    if (trimmedEmail === "dev" || password === "dev") {
      const accessToken = "dev-admin-access-token";
      const refreshToken = "dev-admin-refresh-token";
      const adminData: Admin = {
        _id: "dev-admin",
        id: "dev-admin",
        name: "Dev Admin",
        email: trimmedEmail === "dev" ? "admin@carhero.dev" : trimmedEmail,
        role: "admin",
        permissions: ["*"],
      };

      storeSession(accessToken, refreshToken, adminData);
      setToken(accessToken);
      setAdmin(adminData);
      return;
    }

    // 2. Real Backend Login
    const res = await api.post("/admin/login", { email: trimmedEmail, password });
    const payload = res.data?.data ?? res.data;
    const { accessToken, refreshToken, admin: rawAdmin } = payload ?? {};
    const adminData = normalizeAdmin(rawAdmin);

    const normalizedRole = adminData?.role?.toLowerCase();
    const isAllowedRole = normalizedRole === "admin" || normalizedRole === "super_admin";

    if (!accessToken || !refreshToken || !adminData || !isAllowedRole) {
      throw new Error("هذا الحساب لا يملك صلاحية دخول لوحة الإدارة");
    }

    storeSession(accessToken, refreshToken, adminData);
    setToken(accessToken);
    setAdmin(adminData);
  };

  const logout = () => {
    api.post("/admin/logout").catch(() => {});
    clearStoredSession();
    setAdmin(null);
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function normalizeAdmin(admin: Admin | null | undefined): Admin | null {
  if (!admin) return null;

  const id = admin._id ?? admin.id;
  return {
    ...admin,
    _id: id,
    id,
    permissions: admin.permissions ?? [],
  };
}

function clearStoredSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_data");
  
  document.cookie = "admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

function storeSession(accessToken: string, refreshToken: string, adminData: Admin) {
  localStorage.setItem("admin_access_token", accessToken);
  localStorage.setItem("admin_refresh_token", refreshToken);
  localStorage.setItem("admin_data", JSON.stringify(adminData));

  document.cookie = `admin_access_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_access_token");
}

function getStoredAdmin() {
  if (typeof window === "undefined") return null;

  const storedToken = localStorage.getItem("admin_access_token");
  const storedAdmin = localStorage.getItem("admin_data");
  if (!storedToken || !storedAdmin) return null;

  try {
    return normalizeAdmin(JSON.parse(storedAdmin) as Admin);
  } catch {
    clearStoredSession();
    return null;
  }
}
