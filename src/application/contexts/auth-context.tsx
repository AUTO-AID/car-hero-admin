"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { Admin, AuthContextType } from "@/domain/entities/auth.types";
import { adminLogin, adminLogout } from "@/infrastructure/services/auth.service";
import {
  clearStoredSession,
  getAccessToken,
  getStoredAdmin,
  normalizeAdmin,
  storeSession,
} from "@/infrastructure/auth/admin-session";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => getStoredAdmin());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    const { accessToken, refreshToken, admin: rawAdmin } = await adminLogin({ email: trimmedEmail, password });
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
    adminLogout().catch(() => {});
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

function getStoredToken() {
  return getAccessToken();
}
