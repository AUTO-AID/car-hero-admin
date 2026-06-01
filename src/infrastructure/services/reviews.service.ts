import { api } from "@/infrastructure/api/client";

export type ReviewFilters = {
  search?: string;
  isReported?: string;
  isVisible?: string;
  rating?: string;
  hasResponse?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== "all"));

export const getReviews = (page = 1, limit = 10, filters: ReviewFilters = {}) =>
  api.get("/reviews", { params: clean({ page, limit, ...filters }) }).then((r) => r.data);

export const getReviewStats = () =>
  api.get("/reviews/stats").then((r) => r.data);

export const toggleReviewVisibility = (id: string, isVisible: boolean) =>
  api.patch(`/reviews/${id}`, { isVisible }).then((r) => r.data);

export const deleteReview = (id: string) =>
  api.delete(`/reviews/${id}`).then((r) => r.data);
