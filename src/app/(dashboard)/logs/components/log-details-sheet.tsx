"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ArrowLeft,
  Database,
  FileJson,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getAuditLogsByEntity } from "@/infrastructure/services/audit-logs.service";

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

interface LogDetailsSheetProps {
  selectedLog: AuditLog | null;
  onOpenChange: (open: boolean) => void;
  onSelectLog: (log: AuditLog) => void;
  actionLabels: Record<string, string>;
  entityLabels: Record<string, string>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "yyyy-MM-dd HH:mm", { locale: ar });
}

function JsonBlock({ title, value }: { title: string; value?: Record<string, unknown> }) {
  const entries = value && Object.keys(value).length ? value : null;

  return (
    <section className="overflow-hidden rounded-xl border border-border/30 bg-background/40">
      <div className="flex items-center gap-2 border-b border-border/20 px-4 py-3">
        <FileJson className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold text-white">{title}</h3>
      </div>
      {entries ? (
        <pre dir="ltr" className="max-h-72 overflow-auto p-4 text-left text-[11px] leading-relaxed text-muted-foreground">
          {JSON.stringify(entries, null, 2)}
        </pre>
      ) : (
        <p className="px-4 py-5 text-xs text-muted-foreground">لا توجد بيانات مسجلة في هذا القسم.</p>
      )}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-border/25 bg-secondary/20 p-3">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</p>
      <p className="break-all text-xs font-semibold text-foreground">{value || "-"}</p>
    </div>
  );
}

export default function LogDetailsSheet({
  selectedLog,
  onOpenChange,
  onSelectLog,
  actionLabels,
  entityLabels,
}: LogDetailsSheetProps) {
  const selectedEntityId = selectedLog?.entityId?.toString();

  const relatedQuery = useQuery({
    queryKey: ["audit-logs-entity", selectedLog?.entityType, selectedEntityId],
    queryFn: () => getAuditLogsByEntity(selectedLog!.entityType, selectedEntityId!, 1, 8),
    enabled: Boolean(selectedLog?.entityType && selectedEntityId),
  });

  const relatedLogs = relatedQuery.data?.logs || [];

  return (
    <Sheet open={Boolean(selectedLog)} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full overflow-y-auto border-r border-border/40 bg-card p-0 sm:max-w-[560px]" dir="rtl">
        {selectedLog && (
          <>
            <SheetHeader className="border-b border-border/30 bg-secondary/20 p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle className="text-lg font-black text-white">تفاصيل النشاط</SheetTitle>
              <SheetDescription className="text-xs">عرض معلومات العملية كما سجلها الباك إند، مع البيانات اللاحقة والـ metadata.</SheetDescription>
            </SheetHeader>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailRow label="اسم الأدمن" value={selectedLog.adminName || "مسؤول"} />
                <DetailRow label="البريد" value={selectedLog.adminEmail} />
                <DetailRow label="نوع العملية" value={actionLabels[selectedLog.action] || selectedLog.action} />
                <DetailRow label="الجدول المتأثر" value={entityLabels[selectedLog.entityType] || selectedLog.entityType} />
                <DetailRow label="رقم السجل" value={selectedLog.entityId?.toString()} />
                <DetailRow label="وقت العملية" value={formatDate(selectedLog.createdAt)} />
              </div>

              <JsonBlock title="البيانات بعد التعديل" value={selectedLog.after} />
              <JsonBlock title="Metadata" value={selectedLog.metadata} />

              <section className="rounded-xl border border-border/30 bg-background/40">
                <div className="flex items-center justify-between border-b border-border/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-white">نشاطات أخرى على نفس السجل</h3>
                  </div>
                  {relatedQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <div className="space-y-2 p-3">
                  {relatedLogs.length === 0 ? (
                    <p className="px-2 py-4 text-xs text-muted-foreground">لا توجد سجلات أخرى لهذا الكيان.</p>
                  ) : (
                    relatedLogs.map((log: any) => (
                      <button
                        key={log._id || log.id || `${log.action}-${log.createdAt}`}
                        type="button"
                        onClick={() => onSelectLog(log)}
                        className="flex w-full items-center justify-between rounded-lg border border-border/20 bg-secondary/20 px-3 py-2 text-right transition-colors hover:bg-secondary/40"
                      >
                        <span>
                          <span className="block text-xs font-bold text-white">{actionLabels[log.action] || log.action}</span>
                          <span className="block text-[11px] text-muted-foreground">{formatDate(log.createdAt)}</span>
                        </span>
                        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
