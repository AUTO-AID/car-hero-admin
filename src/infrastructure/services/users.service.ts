import { api } from "../api/client";

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  isPremium?: boolean;
  subscriptionStatus?: string;
  planTier?: string;
  minBalance?: string;
  maxBalance?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function unwrapAdminData<T = any>(payload: any): T {
  let current = payload;

  while (
    current &&
    typeof current === "object" &&
    "data" in current &&
    ("success" in current || "timestamp" in current)
  ) {
    current = current.data;
  }

  return current as T;
}

export const getAllUsers = (page = 1, limit = 10, filters: UserFilters = {}) =>
  api
    .get("/admin/users", { params: { page, limit, ...filters } })
    .then((r) => unwrapAdminData(r.data));

export const getUserById = (id: string) =>
  api.get(`/admin/users/${id}`).then((r) => unwrapAdminData(r.data));

export const updateUserStatus = (id: string, isActive: boolean) =>
  api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => unwrapAdminData(r.data));

export const deleteUser = (id: string) =>
  api.delete(`/admin/users/${id}`).then((r) => unwrapAdminData(r.data));

export const searchUsers = (query: string) =>
  api.get("/admin/users/search", { params: { query } }).then((r) => r.data);

export const getUsersAnalytics = () =>
  api.get("/admin/stats/users-analytics").then((r) => unwrapAdminData(r.data));
