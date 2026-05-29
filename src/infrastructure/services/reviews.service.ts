import { api } from "@/infrastructure/api/client";

export const getReviews = (page: number, filter: string) => {
  const params: Record<string, any> = { page, limit: 10 };
  if (filter !== "all") {
    if (filter === "reported") {
      params.isReported = true;
    } else if (filter === "hidden") {
      params.isVisible = false;
    }
  }
  return api.get("/reviews", { params }).then((r) => r.data);
};

export const toggleReviewVisibility = (id: string, isVisible: boolean) =>
  api.patch(`/reviews/${id}`, { isVisible }).then((r) => r.data);

export const deleteReview = (id: string) =>
  api.delete(`/reviews/${id}`).then((r) => r.data);
