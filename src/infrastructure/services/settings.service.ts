import { api } from "../api/client";

export const getSettings = () =>
  api.get("/admin/settings").then((r) => r.data);

export const updateMaintenanceMode = (data: {
  maintenanceMode: boolean;
  message?: string;
  messageAr?: string;
}) => api.patch("/admin/settings/maintenance", data).then((r) => r.data);
