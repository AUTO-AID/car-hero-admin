import { api } from "../api/client";

export const getAiRecommendationSummary = () =>
  api.get("/admin/ai-recommendations/summary").then((r) => r.data);

export const getAiRecommendationTopProviders = (limit?: number) =>
  api.get("/admin/ai-recommendations/top-providers", { params: { limit } }).then((r) => r.data);

export const getAiRecommendationServicePerformance = () =>
  api.get("/admin/ai-recommendations/service-performance").then((r) => r.data);

export const getAiRecommendationCityPerformance = () =>
  api.get("/admin/ai-recommendations/city-performance").then((r) => r.data);
