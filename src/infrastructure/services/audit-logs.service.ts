import { api } from "../api/client";
import { unwrapApiData } from "@/infrastructure/api/response";

export type AuditLogQuery = {
  page?: number; limit?: number; action?: string; entityType?: string; entityId?: string;
  admin?: string; search?: string; dateFrom?: string; dateTo?: string; sortOrder?: "asc" | "desc";
};
const clean = (params: AuditLogQuery) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
export const getAuditLogs = (params: AuditLogQuery = {}) => api.get("/admin/audit-logs", { params: clean(params) }).then((r) => unwrapApiData(r.data));
export const getAuditLogStats = () => api.get("/admin/audit-logs/stats").then((r) => unwrapApiData(r.data));
export const exportAuditLogs = (params: AuditLogQuery = {}) => api.get("/admin/audit-logs/export", { params: clean(params) }).then((r) => unwrapApiData(r.data));
export const getAuditLogsByEntity = (entityType: string, entityId: string, page = 1, limit = 10) =>
  api.get(`/admin/audit-logs/entity/${entityType}/${entityId}`, { params: { page, limit } }).then((r) => unwrapApiData(r.data));
