export interface AuditLog {
  _id?: string; id?: string; admin?: string; adminName?: string; adminEmail?: string;
  action: string; entityType: string; entityId?: string; summary?: string;
  before?: Record<string, unknown>; after?: Record<string, unknown>; metadata?: Record<string, unknown>;
  ipAddress?: string; userAgent?: string; createdAt?: string; updatedAt?: string;
}
