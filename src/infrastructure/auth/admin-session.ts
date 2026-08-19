import type { Admin } from "@/domain/entities/auth.types";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const ADMIN_DATA_KEY = "admin_data";
const AUTH_COOKIE_NAME = "admin_access_token";

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
};

export function normalizeAdmin(admin: Admin | null | undefined): Admin | null {
  if (!admin) return null;

  const id = admin._id ?? admin.id;
  return {
    ...admin,
    _id: id,
    id,
    permissions: admin.permissions ?? [],
  };
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredAdmin() {
  if (typeof window === "undefined") return null;

  const storedToken = getAccessToken();
  const storedAdmin = localStorage.getItem(ADMIN_DATA_KEY);
  if (!storedToken || !storedAdmin) return null;

  try {
    return normalizeAdmin(JSON.parse(storedAdmin) as Admin);
  } catch {
    clearStoredSession();
    return null;
  }
}

export function storeSession(accessToken: string, refreshToken: string, admin: Admin) {
  const adminData = normalizeAdmin(admin);
  if (!adminData) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
  writeAuthCookie(accessToken);
}

export function updateStoredTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  writeAuthCookie(accessToken);
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function writeAuthCookie(accessToken: string) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax${secure}`;
}
