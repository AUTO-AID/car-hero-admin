import { api } from "../api/client";

export const getAllMembershipPlans = () =>
  api.get("/admin/subscription-plans").then((r) => r.data);

export const createMembershipPlan = (data: Record<string, unknown>) =>
  api.post("/admin/subscription-plans", data).then((r) => r.data);

export const updateMembershipPlan = (id: string, data: Record<string, unknown>) =>
  api.patch(`/admin/subscription-plans/${id}`, data).then((r) => r.data);

export const deleteMembershipPlan = (id: string) =>
  api.delete(`/admin/subscription-plans/${id}`).then((r) => r.data);

export type SubscriberFilters = {
  search?: string;
  status?: string;
  plan?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"));

export const getMembershipSubscribers = (page = 1, limit = 10, filters: SubscriberFilters = {}) =>
  api
    .get("/admin/subscriptions", { params: cleanParams({ page, limit, ...filters }) })
    .then((r) => r.data);

export const getMembershipStats = () =>
  api.get("/admin/memberships/stats").then((r) => r.data);
