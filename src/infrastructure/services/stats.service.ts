import { api } from "../api/client";

export const getDashboardSummary = () =>
  api.get("/admin/dashboard/summary").then((r) => r.data);

export const getProvidersByGovernorate = () =>
  api.get("/admin/dashboard/providers-by-governorate").then((r) => r.data);

export const getProvidersByService = () =>
  api.get("/admin/dashboard/providers-by-service").then((r) => r.data);

export const getProvidersGrowth = (period?: string) =>
  api.get("/admin/dashboard/providers-growth", { params: { period } }).then((r) => r.data);

export const getTopCities = (limit?: number) =>
  api.get("/admin/dashboard/top-cities", { params: { limit } }).then((r) => r.data);

export const getSyriaProvidersMap = () =>
  api.get("/admin/dashboard/map/syria-providers").then((r) => r.data);

export const getGeneralStats = () =>
  api.get("/admin/stats").then((r) => r.data);

export const getBookingStats = () =>
  api.get("/admin/stats/orders").then((r) => r.data);

export const getMonthlyRevenue = () =>
  api.get("/admin/stats/revenue").then((r) => r.data);

export const getTopServices = () =>
  api.get("/admin/stats/top-services").then((r) => r.data);

export const getExcelSummary = () =>
  api.get("/admin/dashboard/excel-summary").then((r) => r.data);
