import { api } from "../api/client";

export const listAdmins = () =>
  api.get("/admin/list").then((r) => r.data);

export const createAdmin = (data: Record<string, unknown>) =>
  api.post("/admin/create", data).then((r) => r.data);

export const updateAdminPermissions = (id: string, permissions: string[]) =>
  api.patch(`/admin/${id}/permissions`, { permissions }).then((r) => r.data);

export const toggleAdminStatus = (id: string, isActive: boolean) =>
  api.patch(`/admin/${id}/status`, { isActive }).then((r) => r.data);

export const deleteAdmin = (id: string) =>
  api.delete(`/admin/${id}`).then((r) => r.data);
