import { api } from "../api/client";

export type AuditLogQuery = {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  admin?: string;
};

export const getAuditLogs = (params: AuditLogQuery = {}) =>
  api.get("/admin/audit-logs", { params }).then((r) => r.data);

export const getAuditLogsByEntity = (
  entityType: string,
  entityId: string,
  page = 1,
  limit = 10
) =>
  api
    .get(`/admin/audit-logs/entity/${entityType}/${entityId}`, {
      params: { page, limit },
    })
    .then((r) => r.data);
