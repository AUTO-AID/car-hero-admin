import { api } from "../api/client";

export const getAllProviders = (status?: string, page = 1, limit = 10) =>
  api
    .get("/admin/providers", { params: { status, page, limit } })
    .then((r) => r.data);

export const getProviderById = (id: string) =>
  api.get(`/admin/providers/${id}`).then((r) => r.data);

export const approveProvider = (id: string) =>
  api.patch(`/admin/providers/${id}/approve`).then((r) => r.data);

export const rejectProvider = (id: string, reason: string) =>
  api.patch(`/admin/providers/${id}/reject`, { reason }).then((r) => r.data);

export const updateProvider = (id: string, data: Record<string, unknown>) =>
  api.patch(`/admin/providers/${id}`, data).then((r) => r.data);
