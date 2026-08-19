import { api } from "../api/client";
import { unwrapApiData } from "../api/response";
import type { ProviderMapResponse } from "@/domain/entities/provider.types";

export type ProviderFilters = {
  status?: string;
  search?: string;
  isActive?: string;
  location?: string;
  governorate?: string;
  runtimeStatus?: string;
  city?: string;
  service?: string;
  emergency?: string;
  minRating?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"),
  );

export const getAllProviders = (filters: ProviderFilters = {}, page = 1, limit = 10) =>
  api
    .get("/admin/providers", { params: cleanParams({ ...filters, page, limit }) })
    .then((r) => r.data);

export const getProvidersMap = (filters: ProviderFilters = {}) =>
  api
    .get<ProviderMapResponse>("/admin/providers/map", { params: cleanParams(filters) })
    .then((r) => r.data);

export const getTopRequestedProviders = (limit = 100) =>
  api.get("/admin/providers/top-requested", { params: { limit } }).then((r) => unwrapApiData(r.data));

export const getProviderById = (id: string) =>
  api.get(`/admin/providers/${id}`).then((r) => r.data);

export const approveProvider = (id: string) =>
  api.patch(`/admin/providers/${id}/approve`).then((r) => r.data);

export const rejectProvider = (id: string, reason: string) =>
  api.patch(`/admin/providers/${id}/reject`, { reason }).then((r) => r.data);

export const updateProvider = (id: string, data: Record<string, unknown>) =>
  api.patch(`/admin/providers/${id}`, data).then((r) => r.data);
