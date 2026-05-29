import { api } from "../api/client";

export const getAllMembershipPlans = () =>
  api.get("/admin/memberships").then((r) => r.data);

export const createMembershipPlan = (data: Record<string, unknown>) =>
  api.post("/admin/memberships", data).then((r) => r.data);

export const updateMembershipPlan = (id: string, data: Record<string, unknown>) =>
  api.patch(`/admin/memberships/${id}`, data).then((r) => r.data);

export const deleteMembershipPlan = (id: string) =>
  api.delete(`/admin/memberships/${id}`).then((r) => r.data);

export const getMembershipSubscribers = (page = 1, limit = 10) =>
  api
    .get("/admin/memberships/subscribers", { params: { page, limit } })
    .then((r) => r.data);
