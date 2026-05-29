"use client";

import {
  CalendarDays,
  UserRound,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  History,
  Search,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

interface LogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  isError: boolean;
  total: number;
  search: string;
  setSearch: (s: string) => void;
  entityType: string;
  setEntityType: (s: string) => void;
  action: string;
  setAction: (s: string) => void;
  page: number;
  pages: number;
  setPage: (updater: number | ((p: number) => number)) => void;
  onSelectLog: (log: AuditLog) => void;
  onRefetch: () => void;
  actionLabels: Record<string, string>;
  entityLabels: Record<string, string>;
}

const toneStyles: Record<string, string> = {
  danger: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-300",
};

function actionTone(action = "") {
  if (action.includes("delete") || action.includes("reject")) return "danger";
  if (action.includes("approve") || action.includes("create")) return "success";
  if (action.includes("status") || action.includes("maintenance") || action.includes("permissions")) return "warning";
  return "info";
}

function ToneIcon({ tone }: { tone: string }) {
  if (tone === "danger") return <XCircle className="h-3.5 w-3.5" />;
  if (tone === "success") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (tone === "warning") return <AlertTriangle className="h-3.5 w-3.5" />;
  return <Info className="h-3.5 w-3.5" />;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "yyyy-MM-dd HH:mm", { locale: ar });
}

function shortId(value?: string) {
  if (!value) return "-";
  return value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

export default function LogsTable({
  logs,
  isLoading,
  isError,
  total,
  search,
  setSearch,
  entityType,
  setEntityType,
  action,
  setAction,
  page,
  pages,
  setPage,
  onSelectLog,
  onRefetch,
  actionLabels,
  entityLabels,
}: LogsTableProps) {
  return (
    <Card className="overflow-hidden border-border/40 bg-card">
      <div className="flex flex-col gap-4 border-b border-border/30 bg-secondary/20 p-5 lg:flex-row lg:items-center">
        <div className="mr-auto flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">سجل النشاطات</h2>
            <p className="text-xs text-muted-foreground">كل العمليات الإدارية الحساسة كما تم تسجيلها من الباك إند.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[720px]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/45" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="بحث داخل الصفحة..."
              className="h-10 rounded-xl border-border/40 bg-background pr-10 text-xs"
            />
          </div>

          <Select value={entityType} onValueChange={(value) => { setEntityType(value || "all"); setPage(1); }}>
            <SelectTrigger className="h-10 rounded-xl border-border/40 bg-background text-xs">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(entityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={action} onValueChange={(value) => { setAction(value || "all"); setPage(1); }}>
            <SelectTrigger className="h-10 rounded-xl border-border/40 bg-background text-xs">
              <SelectValue placeholder="العملية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل العمليات</SelectItem>
              {Object.entries(actionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-right">
          <thead>
            <tr className="border-b border-border/20 bg-background/30">
              {["الوقت", "الأدمن", "العملية", "النوع", "السجل المتأثر", "التفاصيل"].map((header) => (
                <th key={header} className="px-5 py-3 text-[11px] font-black text-muted-foreground/70">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={6} className="px-5 py-3">
                    <Skeleton className="h-10 w-full bg-secondary/50" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-rose-400" />
                  <p className="text-sm font-semibold text-white">تعذر تحميل سجل النشاطات</p>
                  <Button variant="outline" size="sm" onClick={onRefetch} className="mt-4 border-border/40">
                    إعادة المحاولة
                  </Button>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <History className="mx-auto mb-3 h-9 w-9 text-muted-foreground/30" />
                  <p className="text-sm font-semibold text-white">لا توجد نشاطات مطابقة</p>
                  <p className="mt-1 text-xs text-muted-foreground">جرّب تغيير الفلاتر أو تحديث الصفحة.</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const tone = actionTone(log.action);
                const key = log._id || log.id || `${log.action}-${log.createdAt}`;
                return (
                  <tr key={key} className="transition-colors hover:bg-secondary/25">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{formatDate(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-secondary/50">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">{log.adminName || "مسؤول"}</p>
                          <p dir="ltr" className="truncate text-left text-[11px] text-muted-foreground">{log.adminEmail || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className={cn("gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold", toneStyles[tone])}>
                        <ToneIcon tone={tone} />
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-border/35 bg-background px-2.5 py-1 text-[11px] font-bold text-foreground">
                        {entityLabels[log.entityType] || log.entityType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span dir="ltr" className="inline-flex rounded-lg border border-border/30 bg-secondary/35 px-2.5 py-1 text-left font-mono text-[11px] text-muted-foreground">
                        {shortId(log.entityId?.toString())}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Button variant="outline" size="sm" onClick={() => onSelectLog(log)} className="h-8 gap-2 rounded-lg border-border/40 bg-background text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        عرض
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/20 bg-secondary/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          عرض <span className="font-bold text-white">{logs.length}</span> من <span className="font-bold text-white">{total}</span> سجل
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="h-8 border-border/40 bg-background text-xs">
            السابق
          </Button>
          <span className="min-w-20 text-center text-xs font-bold text-muted-foreground tabular-nums">{page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages || isLoading} onClick={() => setPage((value) => value + 1)} className="h-8 border-border/40 bg-background text-xs">
            التالي
          </Button>
        </div>
      </div>
    </Card>
  );
}
