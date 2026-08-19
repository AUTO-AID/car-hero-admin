import axios from "axios";
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  updateStoredTokens,
} from "@/infrastructure/auth/admin-session";

const configuredApiBase = process.env.NEXT_PUBLIC_API_URL;
const API_BASE =
  configuredApiBase && !configuredApiBase.includes("localhost:3000")
    ? configuredApiBase
    : "http://localhost:3001/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

let refreshRequest: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      typeof originalRequest?.url === "string" &&
      ["/admin/login", "/admin/refresh-token", "/admin/logout"].some((path) => originalRequest.url.includes(path));

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const token = await refreshAccessToken();
      if (token) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        clearStoredSession();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

async function refreshAccessToken() {
  if (typeof window === "undefined") return null;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshRequest ??= axios
    .post(`${API_BASE}/admin/refresh-token`, { refreshToken })
    .then((response) => {
      const payload = response.data?.data ?? response.data;
      const accessToken = payload?.accessToken;
      const nextRefreshToken = payload?.refreshToken;

      if (!accessToken || !nextRefreshToken) return null;
      updateStoredTokens(accessToken, nextRefreshToken);
      return accessToken as string;
    })
    .catch(() => null)
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}
