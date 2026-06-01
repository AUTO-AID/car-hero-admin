import { api } from "@/infrastructure/api/client";

export type NotificationCampaignFilters = {
  search?: string;
  audience?: string;
  status?: string;
  type?: string;
};

const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"));

export const sendNotificationCampaign = (data: Record<string, unknown>) =>
  api.post("/notifications/admin/broadcast", data).then((response) => response.data);

export const getNotificationCampaigns = (page = 1, limit = 10, filters: NotificationCampaignFilters = {}) =>
  api.get("/notifications/admin/history", { params: clean({ page, limit, ...filters }) }).then((response) => response.data);

export const getNotificationStats = () =>
  api.get("/notifications/admin/stats").then((response) => response.data);
