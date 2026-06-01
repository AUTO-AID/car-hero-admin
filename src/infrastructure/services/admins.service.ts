import { api } from "../api/client";

export interface AdminListFilters {
  search?: string;
  status?: "all" | "active" | "inactive";
  permission?: string;
}

export const listAdmins = (filters: AdminListFilters = {}) =>
  api.get("/admin/list", { params: filters }).then((r) => r.data);

export const createAdmin = (data: Record<string, unknown>) =>
  api.post("/admin/create", data).then((r) => r.data);

export const updateAdminPermissions = (id: string, permissions: string[]) =>
  api.patch(`/admin/${id}/permissions`, { permissions }).then((r) => r.data);

export const toggleAdminStatus = (id: string, isActive: boolean) =>
  api.patch(`/admin/${id}/status`, { isActive }).then((r) => r.data);

export const resetAdminPassword = (id: string, password: string) =>
  api.patch(`/admin/${id}/password`, { password }).then((r) => r.data);

export const deleteAdmin = (id: string) =>
  api.delete(`/admin/${id}`).then((r) => r.data);
