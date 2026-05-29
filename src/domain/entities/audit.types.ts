export interface AuditLogAdmin {
  id?: string;
  _id?: string;
  name: string;
  email: string;
}

export interface AuditLog {
  _id?: string;
  id?: string;
  action: string;
  entityType: string;
  entityId: string;
  admin: AuditLogAdmin;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
