"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/infrastructure/services/audit-logs.service";
import LogsStats from "./components/logs-stats";
import LogsTable from "./components/logs-table";
import LogDetailsSheet from "./components/log-details-sheet";

type AuditLog = {
  _id?: string;
  id?: string;
  admin?: string;
  adminEmail?: string;
  adminName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuditResponse = {
  logs?: AuditLog[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
};

const entityLabels: Record<string, string> = {
  all: "كل الأنواع",
  user: "مستخدم",
  provider: "مزود",
  service: "خدمة",
  subscription_plan: "خطة اشتراك",
  setting: "إعدادات",
  admin: "مسؤول",
  vehicle: "سيارة",
  wallet: "محفظة",
  transaction: "عملية مالية",
};

const actionLabels: Record<string, string> = {
  "user.status_update": "تغيير حالة مستخدم",
  "user.update": "تعديل مستخدم",
  "user.delete": "حذف مستخدم",
  "provider.create": "إنشاء مزود",
  "provider.approve": "قبول مزود",
  "provider.reject": "رفض مزود",
  "provider.update": "تعديل مزود",
  "provider.status_update": "تغيير حالة مزود",
  "provider.deactivate": "تعطيل مزود",
  "service.create": "إنشاء خدمة",
  "service.update": "تعديل خدمة",
  "service.status_update": "تغيير حالة خدمة",
  "service.delete": "حذف خدمة",
  "membership.create": "إنشاء خطة",
  "membership.update": "تعديل خطة",
  "membership.delete": "حذف خطة",
  "subscription_plan.create": "إنشاء خطة اشتراك",
  "subscription_plan.update": "تعديل خطة اشتراك",
  "subscription_plan.delete": "حذف خطة اشتراك",
  "setting.maintenance_update": "تغيير وضع الصيانة",
  "admin.create": "إنشاء مسؤول",
  "admin.permissions_update": "تعديل صلاحيات مسؤول",
  "admin.status_update": "تغيير حالة مسؤول",
  "admin.delete": "حذف مسؤول",
  "vehicle.delete": "حذف سيارة",
  "wallet.adjust": "تسوية محفظة",
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [action, setAction] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      entityType: entityType === "all" ? undefined : entityType,
      action: action === "all" ? undefined : action,
    }),
    [action, entityType, page]
  );

  const logsQuery = useQuery<AuditResponse>({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
  });

  const logs = useMemo(() => logsQuery.data?.logs || [], [logsQuery.data?.logs]);
  
  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => {
      const actLabel = actionLabels[log.action] || log.action;
      return [
        log.adminName,
        log.adminEmail,
        log.action,
        actLabel,
        log.entityType,
        log.entityId?.toString(),
        log.summary,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [logs, search]);

  const total = logsQuery.data?.total || filteredLogs.length;
  const pages = logsQuery.data?.pages || 1;

  const activeFiltersCount = [
    entityType !== "all",
    action !== "all",
    Boolean(search),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6" dir="rtl">
      <LogsStats
        total={total}
        activeFiltersCount={activeFiltersCount}
        isFetching={logsQuery.isFetching}
        onRefresh={() => logsQuery.refetch()}
      />

      <LogsTable
        logs={filteredLogs}
        isLoading={logsQuery.isLoading}
        isError={logsQuery.isError}
        total={total}
        search={search}
        setSearch={setSearch}
        entityType={entityType}
        setEntityType={setEntityType}
        action={action}
        setAction={setAction}
        page={page}
        pages={pages}
        setPage={setPage}
        onSelectLog={setSelectedLog}
        onRefetch={() => logsQuery.refetch()}
        actionLabels={actionLabels}
        entityLabels={entityLabels}
      />

      <LogDetailsSheet
        selectedLog={selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        onSelectLog={setSelectedLog}
        actionLabels={actionLabels}
        entityLabels={entityLabels}
      />
    </div>
  );
}
