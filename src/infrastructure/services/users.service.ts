import { api } from "../api/client";

export const getAllUsers = (page = 1, limit = 10, search = "", isActive?: boolean) =>
  api
    .get("/admin/users", { params: { page, limit, search, isActive } })
    .then((r) => r.data);

export const getUserById = (id: string) =>
  api.get(`/admin/users/${id}`).then((r) => r.data);

export const updateUserStatus = (id: string, isActive: boolean) =>
  api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data);

export const deleteUser = (id: string) =>
  api.delete(`/admin/users/${id}`).then((r) => r.data);

export const searchUsers = (query: string) =>
  api.get("/admin/users/search", { params: { query } }).then((r) => r.data);
