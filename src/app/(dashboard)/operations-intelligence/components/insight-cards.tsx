"use client";

import type { ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquarePlus,
  Wrench,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  OperationalRecommendation,
  PressureArea,
  ProviderWorkload,
} from "@/infrastructure/services/operations-intelligence.service";
import { cn } from "@/lib/utils";
import {
  evidenceNumber,
  formatDateTime,
  formatNumber,
  levelClass,
  levelLabels,
  priorityClass,
  priorityLabels,
  slaClass,
  slaLabels,
  statusLabels,
  workloadClass,
  workloadLabels,
} from "../lib";
import type {
  AlertCardProps,
  DecisionRowData,
  RecommendationCardProps,
  SectionTitleProps,
} from "../types";

/**
 * Presentational cards for the operations-intelligence page.
 *
 * These fourteen components lived at the bottom of page.tsx, which ran to 1141
 * lines. A pattern that lives inside a page file gets copied rather than
 * imported the next time it is needed — which is how dashboards drift apart.
 */

export type KpiTone = "emerald" | "amber" | "rose" | "violet" | "sky";

export function CommandInsight({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "rose" | "amber";
}) {
  const toneClass = {
    primary: "border-primary/20 bg-primary/10 text-primary",
    rose: "border-rose-500/20 bg-rose-500/10 text-danger",
    amber: "border-amber-500/20 bg-amber-500/10 text-warning",
  } satisfies Record<string, string>;

  return (
    <div className="flex min-h-20 items-center gap-3 rounded-xl border border-border/35 bg-card/70 p-4">
      <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border", toneClass[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-muted-foreground">{label}</p>
        <p className="mt-1 line-clamp-2 text-sm font-black leading-6 text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
  isLoading,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: KpiTone;
  isLoading?: boolean;
}) {
  const toneClass = {
    emerald: "text-success bg-emerald-500/10 border-emerald-500/20",
    amber: "text-warning bg-amber-500/10 border-amber-500/20",
    rose: "text-danger bg-rose-500/10 border-rose-500/20",
    violet: "text-info bg-violet-500/10 border-violet-500/20",
    sky: "text-info bg-sky-500/10 border-sky-500/20",
  } satisfies Record<KpiTone, string>;

  return (
    <Card className="overflow-hidden border-border/40 bg-card/70 p-0">
      <div className={cn("h-1", tone === "emerald" && "bg-emerald-400", tone === "amber" && "bg-amber-400", tone === "rose" && "bg-rose-400", tone === "violet" && "bg-violet-400", tone === "sky" && "bg-sky-400")} />
      <div className="flex items-center justify-between p-5">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          {isLoading ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 truncate text-3xl font-black text-foreground">{value}</p>}
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl border", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function ExecutiveMetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  tone: KpiTone;
}) {
  const toneClass = {
    emerald: "text-success bg-emerald-500/10 border-emerald-500/20",
    amber: "text-warning bg-amber-500/10 border-amber-500/20",
    rose: "text-danger bg-rose-500/10 border-rose-500/20",
    violet: "text-info bg-violet-500/10 border-violet-500/20",
    sky: "text-info bg-sky-500/10 border-sky-500/20",
  } satisfies Record<KpiTone, string>;

  return (
    <Card className="p-5 bg-card/70 border-border/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-black text-foreground">{value}</p>
          <p className="mt-1 line-clamp-1 text-xs font-bold text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl border", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function DecisionRow({ row, onOpen }: { row: DecisionRowData; onOpen: () => void }) {
  const pressureWidth = Math.min(100, Math.max(6, row.pressureScore || 0));
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-4 text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary/20 lg:grid-cols-[1.1fr_1fr_.8fr_.8fr_.9fr_.7fr] lg:items-center">
      <div className="min-w-0">
        <p className="font-black text-foreground">{row.city || "غير محدد"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{row.governorate || "محافظة غير محددة"}</p>
      </div>
      <div className="min-w-0">
        <p className="font-black text-foreground">{row.serviceNameAr || row.serviceName || "خدمة غير محددة"}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-l from-rose-400 via-amber-400 to-primary" style={{ width: `${pressureWidth}%` }} />
        </div>
      </div>
      <Badge className={cn("w-fit border", priorityClass(row.decisionPriority))}>
        {priorityLabels[row.decisionPriority] || row.decisionPriority}
      </Badge>
      <span>{formatNumber(row.ordersCount)} طلب</span>
      <span className="text-foreground">{formatNumber(row.providersNeeded)} مزود <span className="text-muted-foreground">/ أثر {row.expectedRelief}%</span></span>
      <Button size="sm" variant="outline" onClick={onOpen} className="w-fit">
        <FileText className="h-3.5 w-3.5" />
        تقرير
      </Button>
    </div>
  );
}

export function DecisionDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-3">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-sm font-black text-foreground">{title}</h2>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function PressureRow({ area, maxPressure }: { area: PressureArea; maxPressure: number }) {
  const width = Math.max(((area.pressureScore || 0) / maxPressure) * 100, 4);
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-foreground">{area.city || "غير محدد"}</h3>
            <Badge className={cn("border", levelClass(area.level))}>{levelLabels[area.level]}</Badge>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{area.serviceNameAr || area.serviceName}</p>
        </div>
        <div className="text-end">
          <p className="text-xl font-black text-foreground">{area.pressureScore}</p>
          <p className="text-xs font-bold text-muted-foreground">Pressure</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/60">
        <div className="h-full rounded-full bg-gradient-to-l from-primary via-amber-400 to-rose-500" style={{ width: `${width}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-muted-foreground md:grid-cols-4">
        <span>الطلبات: {formatNumber(area.ordersCount)}</span>
        <span>المزودون: {formatNumber(area.activeProviders)}</span>
        <span>الإلغاء: {area.cancelRate}%</span>
        <span>الاستجابة: {area.avgResponseMinutes || 0}د</span>
      </div>
    </div>
  );
}

export function RecommendationMiniCard({ item }: { item: OperationalRecommendation }) {
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge className={cn("border", priorityClass(item.priority))}>{priorityLabels[item.priority]}</Badge>
        <span className="text-xs font-black text-primary">+{item.recommendedProviders || 1} مزود</span>
      </div>
      <p className="mt-3 text-sm font-black text-foreground">{item.city || "منطقة غير محددة"} - {item.serviceName}</p>
      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-muted-foreground">{item.reason || item.summary}</p>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/25 bg-secondary/15 px-3 py-2">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-foreground">{value}</p>
    </div>
  );
}

export function RecommendationCard({ item, canManage, isPending, onStatus, onNote }: RecommendationCardProps) {
  const currentStatus = item.status || "new";
  const currentSla = item.slaStatus || "on_track";
  const latestNote = item.notes?.at(-1);
  return (
    <div className={cn("rounded-xl border bg-background/35 p-4 transition-colors hover:border-primary/25", currentSla === "overdue" ? "border-rose-500/30" : currentSla === "due_soon" ? "border-amber-500/30" : "border-border/35")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("border", priorityClass(item.priority))}>{priorityLabels[item.priority]}</Badge>
            <Badge variant="outline">{statusLabels[currentStatus] || currentStatus}</Badge>
            <Badge className={cn("border", slaClass(currentSla))}>{slaLabels[currentSla] || currentSla}</Badge>
            <span className="text-xs font-bold text-muted-foreground">{item.city || "غير محدد"} / {item.serviceName}</span>
          </div>
          <h3 className="mt-3 text-sm font-black text-foreground">{item.title || item.summary}</h3>
          <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">{item.reason || item.summary}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-muted-foreground md:grid-cols-5">
            <MiniStat label="الطلبات" value={formatNumber(evidenceNumber(item.evidence, "ordersCount"))} />
            <MiniStat label="المزودون" value={formatNumber(evidenceNumber(item.evidence, "activeProviders"))} />
            <MiniStat label="الضغط" value={evidenceNumber(item.evidence, "pressureScore")} />
            <MiniStat label="المقترح" value={`${formatNumber(item.recommendedProviders)} مزود`} />
            <MiniStat label="المتابعة" value={formatDateTime(item.dueAt)} />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 rounded-lg border border-border/25 bg-card/40 p-2 lg:w-44 lg:flex-col">
          {canManage && currentStatus === "new" && (
            <Button size="sm" onClick={() => onStatus("in_progress")} disabled={isPending} className="w-full">بدء المعالجة</Button>
          )}
          {canManage && currentStatus === "in_progress" && (
            <Button size="sm" onClick={() => onStatus("resolved")} disabled={isPending} className="w-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> تم الحل
            </Button>
          )}
          {canManage && !["resolved", "dismissed"].includes(currentStatus) && (
            <Button size="sm" variant="outline" onClick={() => onStatus("dismissed")} disabled={isPending} className="w-full">
              <XCircle className="h-3.5 w-3.5" /> تجاهل
            </Button>
          )}
          {canManage && (
            <Button size="sm" variant="outline" onClick={onNote} className="w-full">
              <MessageSquarePlus className="h-3.5 w-3.5" /> ملاحظة
            </Button>
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-border/25 bg-secondary/15 p-3 text-xs font-bold text-muted-foreground md:grid-cols-4">
        <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-primary" /> اكتشاف: {formatDateTime(item.detectedAt)}</span>
        <span>مراجعة: {formatDateTime(item.acknowledgedAt)}</span>
        <span>حل: {formatDateTime(item.resolvedAt)}</span>
        <span>آخر ظهور: {formatDateTime(item.lastSeenAt)}</span>
      </div>
      {latestNote && (
        <div className="mt-3 rounded-lg border border-border/25 bg-secondary/20 p-3 text-xs text-muted-foreground">
          آخر ملاحظة: {latestNote.text}
        </div>
      )}
    </div>
  );
}

export function AlertCard({ alert, canManage, onRead, onResolve }: AlertCardProps) {
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
        </div>
      </div>
    </div>
  );
}

export function ProviderWorkloadCard({ provider }: { provider: ProviderWorkload }) {
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black text-foreground">{provider.businessName || "مزود بدون اسم"}</h3>
            <Badge className={cn("border", workloadClass(provider.workloadLevel))}>{workloadLabels[provider.workloadLevel]}</Badge>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{provider.city || provider.governorate || "غير محدد"}</p>
        </div>
        <div className="text-end">
          <p className="text-xl font-black text-foreground">{formatNumber(provider.totalOrders)}</p>
          <p className="text-xs font-bold text-muted-foreground">طلب</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-muted-foreground md:grid-cols-4">
        <span>نشطة: {formatNumber(provider.activeOrders)}</span>
        <span>إكمال: {provider.completionRate ?? 0}%</span>
        <span>إلغاء: {provider.cancelRate ?? 0}%</span>
        <span>استجابة: {provider.avgResponseMinutes || 0}د</span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-muted-foreground">
        {(provider.reasons || []).join("، ")}
      </p>
    </div>
  );
}

export function SkeletonList({ count }: { count: number }) {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export function EmptyMessage({ text }: { text: string }) {
  // was a dashed-border panel — one of several ways this dashboard said
  // "no data"; routed through the shared component so they all match
  return (
    <div className="mt-5">
      <EmptyState icon={AlertTriangle} title={text} />
    </div>
  );
}
