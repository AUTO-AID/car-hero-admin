import { api } from "../api/client";

export const getAllServices = () =>
  api.get("/admin/services").then((r) => r.data);

export const createService = (data: Record<string, unknown>) =>
  api.post("/admin/services", data).then((r) => r.data);

export const updateService = (id: string, data: Record<string, unknown>) =>
  api.patch(`/admin/services/${id}`, data).then((r) => r.data);

export const deleteService = (id: string) =>
  api.delete(`/admin/services/${id}`).then((r) => r.data);
