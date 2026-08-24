"use client";

import type { ComponentType } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  MapPin,
  MessageSquarePlus,
  ShieldCheck,
  UsersRound,
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
  ProviderWorkload,
} from "@/infrastructure/services/operations-intelligence.service";
import { cn } from "@/lib/utils";
import {
  alertTypeLabels,
  areaLabel,
  componentLabels,
  evidenceNumber,
  formatDateTime,
  formatNumber,
  governorateLabel,
  levelBarClass,
  levelClass,
  levelLabels,
  levelStrokeClass,
  priorityClass,
  priorityLabels,
  severityClass,
  severityLabels,
  slaClass,
  slaLabels,
  statusLabels,
  translateReason,
  translateReasons,
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
 * بطاقات العرض لصفحة ذكاء العمليات.
 *
 * المبدأ الحاكم هنا: كل رقم يجب أن يجيب على «ولماذا؟» في المكان نفسه. درجة
 * ضغط 88 بلا تفصيل مكوّناتها هي رقم لا يُتصرَّف بناءً عليه، وهو ما كانت عليه
 * هذه الشاشة.
 */

export type KpiTone = "emerald" | "amber" | "rose" | "violet" | "sky" | "primary";

const TONE_SOFT: Record<KpiTone, string> = {
  emerald: "text-success bg-emerald-500/10 border-emerald-500/25",
  amber: "text-warning bg-amber-500/10 border-amber-500/25",
  rose: "text-danger bg-rose-500/10 border-rose-500/25",
  violet: "text-info bg-violet-500/10 border-violet-500/25",
  sky: "text-info bg-sky-500/10 border-sky-500/25",
  primary: "text-primary bg-primary/10 border-primary/25",
};

const TONE_BAR: Record<KpiTone, string> = {
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  sky: "bg-sky-400",
  primary: "bg-primary",
};

// ------------------------------------------------------------
//  مؤشرات علوية
// ------------------------------------------------------------

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  isLoading,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone: KpiTone;
  isLoading?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border/40 bg-card/70 p-0">
      <div className={cn("h-1", TONE_BAR[tone])} />
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : (
            <p className="mt-2 truncate text-3xl font-black tabular-nums text-foreground">{value}</p>
          )}
          {hint && !isLoading && (
            <p className="mt-1 line-clamp-1 text-xs font-semibold text-muted-foreground/80">{hint}</p>
          )}
        </div>
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl border", TONE_SOFT[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

/**
 * شريط «الإجراء التالي». الغرض من الصفحة كلها قرار واحد، فيستحق أن يُعرض
 * كجملة مفهومة لا كبطاقة رقم بين بطاقات.
 */
export function NextActionBanner({
  headline,
  detail,
  score,
  level,
  relief,
  onOpen,
  disabled,
}: {
  headline: string;
  detail: string;
  score?: number;
  level?: string;
  relief?: number;
  onOpen?: () => void;
  disabled?: boolean;
}) {
  return (
    <Card className="overflow-hidden border-primary/25 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent p-0">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-primary">الإجراء التالي</p>
            <h2 className="mt-1 text-lg font-black leading-7 text-foreground">{headline}</h2>
            <p className="mt-1 text-xs font-semibold leading-6 text-muted-foreground">{detail}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {typeof score === "number" && <PressureGauge score={score} level={level} size={72} />}
          {typeof relief === "number" && relief > 0 && (
            <div className="rounded-xl border border-border/35 bg-background/40 px-4 py-3 text-center">
              <p className="text-xs font-bold text-muted-foreground">الأثر المتوقّع</p>
              <p className="mt-1 text-xl font-black tabular-nums text-success">{relief}%</p>
            </div>
          )}
          {onOpen && (
            <Button onClick={onOpen} disabled={disabled} className="h-11 gap-2 font-black">
              عرض التفاصيل
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
//  درجة الضغط
// ------------------------------------------------------------

/**
 * حلقة الضغط. مقياسها **مطلق** من 0 إلى 100.
 *
 * الشريط السابق كان يقسم على أعلى قيمة معروضة، فحين تتساوى كل المناطق عند 88
 * كانت كلها تُرسم ممتلئة 100% — أي أن التمثيل البصري يقول «الكل في الحد
 * الأقصى» بينما الرقم يقول 88. المقياس المطلق يبقى صادقاً في كل الحالات.
 */
export function PressureGauge({
  score,
  level,
  size = 56,
}: {
  score: number;
  level?: string;
  size?: number;
}) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0));
  const stroke = size >= 70 ? 7 : 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-secondary/70"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className={cn("transition-[stroke-dasharray] duration-500", levelStrokeClass(level))}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="font-black tabular-nums text-foreground"
          style={{ fontSize: size >= 70 ? 20 : 15 }}
        >
          {safe}
        </span>
      </div>
    </div>
  );
}

/**
 * تفصيل الدرجة إلى مكوّناتها. هذا ما يحوّل «88» من رقم إلى سبب:
 * المسؤول يرى أن الضغط قادم من الإلغاء لا من كثرة الطلبات، فيتصرّف بناءً عليه.
 */
export function ScoreBreakdown({
  scores,
}: {
  scores?: Record<string, number>;
}) {
  if (!scores) return null;
  return (
    <div className="space-y-2">
      {componentLabels.map(({ key, label, weight }) => {
        const value = Math.max(0, Math.min(100, Number(scores[key]) || 0));
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-xs font-bold text-muted-foreground">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  value >= 70 ? "bg-rose-500" : value >= 40 ? "bg-amber-400" : "bg-emerald-400",
                )}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-end text-xs font-black tabular-nums text-foreground">
              {value}
            </span>
            <span className="w-10 shrink-0 text-end text-xs font-bold text-muted-foreground/70">
              {weight}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** مفتاح ألوان مستويات الضغط — بدونه الألوان زينة لا معنى. */
export function PressureLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {(["healthy", "watch", "pressured", "critical"] as const).map((level) => (
        <span key={level} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <span className={cn("h-2 w-2 rounded-full", levelBarClass(level))} />
          {levelLabels[level]}
        </span>
      ))}
      <span className="text-xs font-semibold text-muted-foreground/70">
        الدرجة من 100: كلما ارتفعت زاد احتياج المنطقة لمزوّدين.
      </span>
    </div>
  );
}

// ------------------------------------------------------------
//  صف المنطقة
// ------------------------------------------------------------

/**
 * صف منطقة/خدمة واحد. يجمع ما كان موزّعاً على تبويبَين (قائمة الضغط وجدول
 * القرارات) وكانا يعرضان الحقول نفسها من المصدر نفسه.
 */
export function AreaRow({
  row,
  serviceAr,
  expanded,
  onToggle,
  onOpen,
}: {
  row: DecisionRowData;
  serviceAr?: string;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const gov = governorateLabel(row.governorate, row.city);
  const service = serviceAr || row.serviceNameAr || row.serviceName || "خدمة غير محدّدة";
  const noCoverage = (row.activeProviders || 0) === 0 && (row.ordersCount || 0) > 0;

  return (
    <div
      className={cn(
        "border-b border-border/25 transition-colors last:border-b-0",
        expanded ? "bg-secondary/20" : "hover:bg-secondary/10",
      )}
    >
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <PressureGauge score={row.pressureScore} level={row.level} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <h3 className="text-sm font-black text-foreground">{areaLabel(row.city, row.governorate)}</h3>
            {gov && <span className="text-xs font-semibold text-muted-foreground">/ {gov}</span>}
            <Badge className={cn("border", levelClass(row.level))}>{levelLabels[row.level]}</Badge>
            {noCoverage && (
              <Badge className="border border-rose-500/25 bg-rose-500/10 text-danger">بلا تغطية</Badge>
            )}
          </div>
          <p className="mt-1 truncate text-xs font-bold text-muted-foreground">{service}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-bold text-muted-foreground">
            <Metric label="الطلبات" value={formatNumber(row.ordersCount)} />
            <Metric label="المزوّدون" value={formatNumber(row.activeProviders)} danger={noCoverage} />
            <Metric label="الإلغاء" value={`${row.cancelRate ?? 0}%`} danger={(row.cancelRate ?? 0) >= 30} />
            <Metric label="بلا إسناد" value={`${row.unassignedRate ?? 0}%`} danger={(row.unassignedRate ?? 0) >= 30} />
            <Metric label="الاستجابة" value={`${row.avgResponseMinutes || 0} د`} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-end">
          <div className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 text-center">
            <span className="text-xs font-black text-primary">
              +{formatNumber(row.providersNeeded)} مزوّد
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onToggle} className="h-8 px-2 text-xs font-bold">
              {expanded ? "إخفاء التفصيل" : "لماذا؟"}
            </Button>
            <Button size="sm" variant="outline" onClick={onOpen} className="h-8 text-xs font-bold">
              التقرير
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/25 bg-background/40 px-4 py-4">
          <p className="mb-3 text-xs font-black text-foreground">من أين جاءت درجة {row.pressureScore}؟</p>
          <ScoreBreakdown scores={row.componentScores} />
          {!row.componentScores && (
            <p className="text-xs font-semibold text-muted-foreground">
              تفصيل المكوّنات غير متوفّر لهذه المنطقة.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-muted-foreground/70">{label}</span>
      <span className={cn("font-black tabular-nums", danger ? "text-danger" : "text-foreground")}>{value}</span>
    </span>
  );
}

export function DecisionDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-3">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle }: SectionTitleProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-black text-foreground">{title}</h2>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  التوصيات
// ------------------------------------------------------------

/** عنوان التوصية مبنيّاً من الحقول المهيكلة بدل عرض العنوان الإنجليزي المحفوظ. */
export function recommendationHeadline(item: OperationalRecommendation, serviceAr?: string) {
  const where = areaLabel(item.city, item.governorate);
  const service = serviceAr || item.serviceName || "خدمة غير محدّدة";
  const count = formatNumber(item.recommendedProviders || 1);
  if (item.type === "provider_recruitment") {
    return `التعاقد مع ${count} مزوّد لخدمة ${service} في ${where}`;
  }
  return `توصية تشغيلية في ${where}`;
}

export function RecommendationCard({
  item,
  canManage,
  isPending,
  onStatus,
  onNote,
  serviceAr,
}: RecommendationCardProps & { serviceAr?: string }) {
  const currentStatus = item.status || "new";
  const currentSla = item.slaStatus || "on_track";
  const latestNote = item.notes?.at(-1);
  const reasons = translateReasons(item.reasons?.length ? item.reasons : [item.reason || ""]);
  const isClosed = ["resolved", "dismissed"].includes(currentStatus);

  return (
    <div
      className={cn(
        "rounded-xl border bg-background/35 p-4 transition-colors",
        currentSla === "overdue" && !isClosed
          ? "border-rose-500/35"
          : currentSla === "due_soon" && !isClosed
            ? "border-amber-500/35"
            : "border-border/35 hover:border-primary/25",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("border", priorityClass(item.priority))}>
              {priorityLabels[item.priority] || item.priority}
            </Badge>
            <Badge variant="outline">{statusLabels[currentStatus] || currentStatus}</Badge>
            {!isClosed && (
              <Badge className={cn("border", slaClass(currentSla))}>{slaLabels[currentSla] || currentSla}</Badge>
            )}
          </div>

          <h3 className="mt-3 text-sm font-black leading-6 text-foreground">
            {recommendationHeadline(item, serviceAr)}
          </h3>

          {reasons.length > 0 && (
            <ul className="mt-2 space-y-1">
              {reasons.map((reason, index) => (
                <li key={index} className="flex gap-2 text-xs font-semibold leading-6 text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                  {reason}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            <MiniStat label="الطلبات" value={formatNumber(evidenceNumber(item.evidence, "ordersCount"))} />
            <MiniStat label="المزوّدون" value={formatNumber(evidenceNumber(item.evidence, "activeProviders"))} />
            <MiniStat label="الضغط" value={evidenceNumber(item.evidence, "pressureScore")} />
            <MiniStat label="المقترح" value={`${formatNumber(item.recommendedProviders)} مزوّد`} />
            <MiniStat label="موعد المتابعة" value={formatDateTime(item.dueAt)} />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:w-40 lg:flex-col">
          {canManage && currentStatus === "new" && (
            <Button size="sm" onClick={() => onStatus("in_progress")} disabled={isPending} className="w-full font-bold">
              بدء المعالجة
            </Button>
          )}
          {canManage && currentStatus === "in_progress" && (
            <Button size="sm" onClick={() => onStatus("resolved")} disabled={isPending} className="w-full gap-1.5 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> تم الحل
            </Button>
          )}
          {canManage && !isClosed && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatus("dismissed")}
              disabled={isPending}
              className="w-full gap-1.5 font-bold"
            >
              <XCircle className="h-3.5 w-3.5" /> تجاهل
            </Button>
          )}
          {canManage && (
            <Button size="sm" variant="outline" onClick={onNote} className="w-full gap-1.5 font-bold">
              <MessageSquarePlus className="h-3.5 w-3.5" /> ملاحظة
            </Button>
          )}
          {!canManage && (
            <p className="text-xs font-semibold text-muted-foreground">
              تحتاج صلاحية operations.manage لاتخاذ إجراء.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 rounded-lg border border-border/25 bg-secondary/15 px-3 py-2 text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-primary" /> اكتُشفت: {formatDateTime(item.detectedAt)}
        </span>
        <span>آخر ظهور: {formatDateTime(item.lastSeenAt)}</span>
        {item.resolvedAt && <span>حُلّت: {formatDateTime(item.resolvedAt)}</span>}
      </div>

      {latestNote && (
        <div className="mt-2 rounded-lg border border-border/25 bg-secondary/20 px-3 py-2 text-xs font-semibold text-muted-foreground">
          آخر ملاحظة: {latestNote.text}
        </div>
      )}
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/25 bg-secondary/15 px-3 py-2">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xs font-black tabular-nums text-foreground">{value}</p>
    </div>
  );
}

// ------------------------------------------------------------
//  التنبيهات
// ------------------------------------------------------------

/**
 * بطاقة التنبيه.
 *
 * كانت هذه الدالة تُرجع `div` فارغاً تماماً، فكان تبويب التنبيهات يرسم
 * صفوفاً رمادية بلا محتوى مهما بلغ عددها. أُعيدت كتابتها من عقد البيانات:
 * النوع والخطورة والمنطقة والرسالة وأدلّة التنبيه، مع إجراءَي القراءة والحل.
 */
export function AlertCard({ alert, canManage, onRead, onResolve, serviceAr }: AlertCardProps & { serviceAr?: string }) {
  const isUnread = alert.status === "unread";
  const isResolved = alert.status === "resolved";
  const where = areaLabel(alert.city, alert.governorate);
  // اسم الخدمة في أدلّة التنبيه إنجليزي دائماً؛ نفضّل العربي حين يتوفّر
  const service = serviceAr || (alert.evidence?.serviceName as string) || "";
  const providers = Number(alert.evidence?.recommendedProviders || 0);

  // الرسائل المحفوظة إنجليزية؛ نبنيها من الحقول المهيكلة ونُبقي المخزّنة
  // كاحتياط لأنواع لم نعرّبها بعد.
  const body =
    alert.type === "recommendation_overdue"
      ? `تجاوزت توصية ${service ? `خدمة ${service} ` : ""}في ${where} موعد المتابعة المحدّد لها.`
      : alert.type === "coverage_gap" || alert.type === "pressure_critical"
        ? `ضغط مرتفع على ${service ? `خدمة ${service} ` : "الخدمة "}في ${where}${providers ? ` — المقترح إضافة ${formatNumber(providers)} مزوّد.` : "."}`
        : translateReason(alert.message) || alert.message;

  return (
    <div
      className={cn(
        "rounded-xl border bg-background/35 p-4 transition-colors",
        isResolved
          ? "border-border/25 opacity-70"
          : isUnread
            ? "border-primary/30 bg-primary/[0.04]"
            : "border-border/35",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border", severityClass(alert.severity))}>
            <Bell className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border", severityClass(alert.severity))}>
                {severityLabels[alert.severity] || alert.severity}
              </Badge>
              <Badge variant="outline">{alertTypeLabels[alert.type] || alert.type}</Badge>
              {isUnread && (
                <span className="flex items-center gap-1 text-xs font-black text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  غير مقروء
                </span>
              )}
              {isResolved && <Badge variant="outline">محلول</Badge>}
            </div>

            <p className="mt-2.5 text-sm font-black leading-6 text-foreground">{body}</p>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {where}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDateTime(alert.detectedAt)}
              </span>
              {service && (
                <span className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" />
                  {service}
                </span>
              )}
            </div>
          </div>
        </div>

        {canManage && !isResolved && (
          <div className="flex shrink-0 flex-wrap gap-2 lg:w-36 lg:flex-col">
            {isUnread && (
              <Button size="sm" variant="outline" onClick={onRead} className="w-full font-bold">
                تعليم كمقروء
              </Button>
            )}
            <Button size="sm" onClick={onResolve} className="w-full gap-1.5 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> حلّ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
//  المزوّدون
// ------------------------------------------------------------

export function ProviderWorkloadCard({ provider }: { provider: ProviderWorkload }) {
  const reasons = translateReasons(provider.reasons);
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-foreground">
              {provider.businessName || "مزوّد بدون اسم"}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge className={cn("border", workloadClass(provider.workloadLevel))}>
                {workloadLabels[provider.workloadLevel] || provider.workloadLevel}
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground">
                {areaLabel(provider.city, provider.governorate)}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-end">
          <p className="text-xl font-black tabular-nums text-foreground">{formatNumber(provider.totalOrders)}</p>
          <p className="text-xs font-bold text-muted-foreground">طلب</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        <MiniStat label="نشطة" value={formatNumber(provider.activeOrders)} />
        <MiniStat label="الإكمال" value={`${provider.completionRate ?? 0}%`} />
        <MiniStat label="الإلغاء" value={`${provider.cancelRate ?? 0}%`} />
        <MiniStat label="الاستجابة" value={`${provider.avgResponseMinutes || 0} د`} />
      </div>

      {reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {reasons.map((reason, index) => (
            <li key={index} className="flex gap-2 text-xs font-semibold leading-5 text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------
//  حالات فارغة/تحميل
// ------------------------------------------------------------

export function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function EmptyMessage({
  title,
  description,
  icon = AlertTriangle,
  action,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: { label: string; onClick: () => void };
}) {
  return <EmptyState icon={icon as never} title={title} description={description} action={action} />;
}

export { UsersRound };
