import { api } from "../api/client";

export type ServiceFilters = {
  search?: string;
  category?: string;
  isActive?: string;
  isEmergency?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"),
  );

export const getAllServices = (filters: ServiceFilters = {}, page = 1, limit = 100) =>
  api.get("/admin/services", { params: cleanParams({ ...filters, page, limit }) }).then((r) => r.data);

export const createService = (data: Record<string, unknown>) =>
  api.post("/admin/services", data).then((r) => r.data);

export const updateService = (id: string, data: Record<string, unknown>) =>
  api.patch(`/admin/services/${id}`, data).then((r) => r.data);

export const deleteService = (id: string) =>
  api.delete(`/admin/services/${id}`).then((r) => r.data);
