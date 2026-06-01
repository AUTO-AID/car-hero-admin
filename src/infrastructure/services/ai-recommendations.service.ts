import { api } from "../api/client";

export interface AiAnalyticsFilters {
  period?: "all" | "30d" | "90d" | "365d";
  city?: string;
  serviceCategory?: string;
  modelType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const compact = (filters: AiAnalyticsFilters = {}) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value && value !== "all"));

export const getAiRecommendationSummary = (filters?: AiAnalyticsFilters) =>
  api.get("/admin/ai-recommendations/summary", { params: compact(filters) }).then((r) => r.data);

export const getAiRecommendationTopProviders = (filters?: AiAnalyticsFilters, limit = 10) =>
  api.get("/admin/ai-recommendations/top-providers", { params: { ...compact(filters), limit } }).then((r) => r.data);

export const getAiRecommendationServicePerformance = (filters?: AiAnalyticsFilters) =>
  api.get("/admin/ai-recommendations/service-performance", { params: compact(filters) }).then((r) => r.data);

export const getAiRecommendationCityPerformance = (filters?: AiAnalyticsFilters) =>
  api.get("/admin/ai-recommendations/city-performance", { params: compact(filters) }).then((r) => r.data);

export const getAiRecommendationFilters = () =>
  api.get("/admin/ai-recommendations/filters").then((r) => r.data);

export const getAiRecommendationLogs = (filters?: AiAnalyticsFilters) =>
  api.get("/admin/ai-recommendations/logs", { params: compact(filters) }).then((r) => r.data);

export const exportAiRecommendationLogs = (filters?: AiAnalyticsFilters) =>
  api.get("/admin/ai-recommendations/export", { params: compact(filters), responseType: "blob" }).then((r) => r.data);

export const retrainAiModel = () =>
  api.post("/admin/ai-recommendations/retrain").then((r) => r.data);
