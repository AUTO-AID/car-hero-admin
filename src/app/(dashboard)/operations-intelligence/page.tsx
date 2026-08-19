"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Lightbulb,
  Loader2,
  MapPinned,
  MessageSquarePlus,
  Play,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/application/contexts/auth-context";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/infrastructure/query/query-keys";
import {
  addOperationalRecommendationNote,
  getOperationalAlerts,
  getOperationalRecommendations,
  getOperationsPreview,
  markOperationalAlertRead,
  resolveOperationalAlert,
  runOperationsScan,
  updateOperationalRecommendationStatus,
  type OperationalAlert,
  type OperationalRecommendation,
  type OperationsPreviewParams,
  type PressureArea,
  type ProviderWorkload,
} from "@/infrastructure/services/operations-intelligence.service";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertCard,
  CommandInsight,
  DecisionDetail,
  DecisionRow,
  EmptyMessage,
  ExecutiveMetricCard,
  KpiCard,
  MiniStat,
  PressureRow,
  ProviderWorkloadCard,
  RecommendationCard,
  RecommendationMiniCard,
  SectionTitle,
  SkeletonList,
} from "./components/insight-cards";
import type {
  AlertCardProps,
  DecisionRowData,
  RecommendationCardProps,
  SectionTitleProps,
} from "./types";
import {
  evidenceNumber,
  formatDateTime,
  formatNumber,
  idOf,
  levelClass,
  levelLabels,
  priorityClass,
  priorityLabels,
  slaClass,
  slaLabels,
  statusLabels,
  workloadClass,
  workloadLabels,
} from "./lib";




const periodLabels: Record<string, string> = {
  "7": "آخر 7 أيام",
  "14": "آخر 14 يوم",
  "30": "آخر 30 يوم",
};


function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function OperationsIntelligencePage() {
  const queryClient = useQueryClient();
  const { admin } = useAuth();
  const canManage = Boolean(admin?.permissions?.some((permission: string) => ["*", "all", "operations.manage"].includes(permission)));
  const [tab, setTab] = useState("overview");
  const [days, setDays] = useState("14");
  const [city, setCity] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [recommendationStatus, setRecommendationStatus] = useState("all");
  const [alertStatus, setAlertStatus] = useState("all");
  const [noteTarget, setNoteTarget] = useState<OperationalRecommendation | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<DecisionRowData | null>(null);
  const [noteText, setNoteText] = useState("");

  const previewParams: OperationsPreviewParams = useMemo(
    () => ({
      days: Number(days),
      previousDays: Number(days),
      limit: 50,
      city: city.trim() || undefined,
      serviceId: serviceId.trim() || undefined,
    }),
    [city, days, serviceId],
  );

  const recommendationsParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      status: recommendationStatus,
      city: city.trim() || undefined,
      serviceId: serviceId.trim() || undefined,
    }),
    [city, recommendationStatus, serviceId],
  );

  const alertsParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      status: alertStatus,
      city: city.trim() || undefined,
      serviceId: serviceId.trim() || undefined,
    }),
    [alertStatus, city, serviceId],
  );

  const previewQuery = useQuery({
    queryKey: queryKeys.operationsIntelligence.preview(previewParams),
    queryFn: () => getOperationsPreview(previewParams),
    retry: 1,
    staleTime: 30_000,
  });

  const recommendationsQuery = useQuery({
    queryKey: queryKeys.operationsIntelligence.recommendations(recommendationsParams),
    queryFn: () => getOperationalRecommendations(recommendationsParams),
    retry: 1,
  });

  const alertsQuery = useQuery({
    queryKey: queryKeys.operationsIntelligence.alerts(alertsParams),
    queryFn: () => getOperationalAlerts(alertsParams),
    retry: 1,
  });

  const scanMutation = useMutation({
    mutationFn: () => runOperationsScan(previewParams),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.all });
      toast.success(`تم تشغيل التحليل وحفظ ${result.scan?.recommendationsSaved ?? 0} توصية و ${result.scan?.alertsSaved ?? 0} تنبيه`);
    },
    onError: () => toast.error("تعذر تشغيل تحليل ذكاء العمليات. تحقق من الصلاحيات أو الاتصال."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      updateOperationalRecommendationStatus(id, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.all });
      toast.success("تم تحديث حالة التوصية");
    },
    onError: () => toast.error("تعذر تحديث حالة التوصية"),
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => addOperationalRecommendationNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.recommendations(recommendationsParams) });
      toast.success("تمت إضافة الملاحظة");
      setNoteTarget(null);
      setNoteText("");
    },
    onError: () => toast.error("تعذر إضافة الملاحظة"),
  });

  const readAlertMutation = useMutation({
    mutationFn: markOperationalAlertRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.alerts(alertsParams) });
      toast.success("تم تعليم التنبيه كمقروء");
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: resolveOperationalAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.alerts(alertsParams) });
      toast.success("تم حل التنبيه");
    },
  });

  const preview = previewQuery.data;
  const pressureAreas = preview?.pressureAreas ?? [];
  const previewRecommendations = preview?.recommendations ?? [];
  const providerWorkload = preview?.providerWorkload ?? [];
  const recommendations = recommendationsQuery.data?.recommendations ?? [];
  const alerts = alertsQuery.data?.alerts ?? [];
  const unreadAlerts = alertsQuery.data?.stats?.unread ?? 0;
  const maxPressure = Math.max(...pressureAreas.map((area) => area.pressureScore || 0), 1);

  const openRecommendations = recommendations.filter((item: OperationalRecommendation) =>
    !["resolved", "dismissed"].includes(item.status || "new"),
  ).length;
  const followUpRecommendations = recommendations.filter((item: OperationalRecommendation) =>
    !["resolved", "dismissed"].includes(item.status || "new") &&
    (item.slaStatus === "overdue" || item.slaStatus === "due_soon" || item.priority === "critical"),
  );
  const decisionRows: DecisionRowData[] = pressureAreas.map((area: PressureArea) => {
    const recommendation = [...previewRecommendations, ...recommendations].find((item: OperationalRecommendation) =>
      (item.city || "").toLowerCase() === (area.city || "").toLowerCase() &&
      String(item.serviceId || item.evidence?.serviceId || item.serviceName || "") === String(area.serviceId || area.serviceName || ""),
    ) || [...previewRecommendations, ...recommendations].find((item: OperationalRecommendation) =>
      (item.city || "").toLowerCase() === (area.city || "").toLowerCase() &&
      (item.serviceName || "") === (area.serviceName || area.serviceNameAr || ""),
    );
    const providersNeeded = recommendation?.recommendedProviders || Math.max(1, Math.ceil((area.ordersPerProvider || 0) / 3));
    const expectedRelief = Math.min(95, Math.round((providersNeeded / Math.max(area.activeProviders + providersNeeded, 1)) * 100));

    const decisionPriority: DecisionRowData["decisionPriority"] =
      area.level === "critical" ? "critical" : area.level === "pressured" ? "high" : "medium";

    return {
      ...area,
      recommendation,
      providersNeeded,
      expectedRelief,
      decisionPriority,
    };
  }).sort((a, b) => (b.pressureScore || 0) - (a.pressureScore || 0));
  const topDecision = decisionRows[0];
  const totalProvidersNeeded = decisionRows.reduce((sum, row) => sum + (row.providersNeeded || 0), 0);
  const urgentDecisionRows = decisionRows.filter((row) => ["critical", "high"].includes(row.decisionPriority));
  const activeFilters = [
    periodLabels[days],
    city.trim() ? `المدينة: ${city.trim()}` : null,
    serviceId.trim() ? `Service: ${serviceId.trim()}` : null,
  ].filter(Boolean);
  const nextMove = topDecision
    ? `تعاقد مع ${formatNumber(topDecision.providersNeeded)} مزود في ${topDecision.city || "المنطقة الأعلى ضغطاً"}`
    : "شغل تحليل جديد لبناء توصيات تنفيذية";

  return (
    <div className="space-y-6" dir="rtl">
      <div className="overflow-hidden rounded-2xl border border-border/35 bg-card/70 shadow-sm shadow-black/5">
        <div className="flex flex-col gap-4 px-4 py-4 backdrop-blur-md lg:flex-row lg:items-start lg:justify-between xl:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">ذكاء العمليات</h1>
            <p className="mt-1 max-w-3xl text-xs font-semibold leading-6 text-muted-foreground">
              تحليل ضغط الطلبات والتغطية، توليد توصيات تعاقد، ومراقبة المزودين المضغوطين بناء على بيانات التشغيل الفعلية.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/30 bg-background/35 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              نطاق التحليل
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {activeFilters.map((filter) => (
                <span key={filter} className="rounded-md border border-border/30 bg-secondary/30 px-2 py-1 text-xs font-bold text-muted-foreground">
                  {filter}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Select value={days} onValueChange={(value) => setDays(value || "14")}>
            <SelectTrigger className="h-10 bg-background/60 text-xs">
              <FilterSelectValue label="الفترة" value={periodLabels[days]} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="14">آخر 14 يوم</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="فلترة حسب المدينة"
            className="h-10 bg-background/60 text-xs"
          />
          <Input
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            placeholder="Service ID"
            className="h-10 bg-background/60 text-xs sm:col-span-2"
            dir="ltr"
          />

          <Button
            onClick={() => scanMutation.mutate()}
            disabled={!canManage || scanMutation.isPending}
            className="h-10 gap-2 font-black sm:col-span-2"
            title={!canManage ? "تحتاج صلاحية operations.manage" : undefined}
          >
            {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            تشغيل تحليل الآن
          </Button>
          </div>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <CommandInsight icon={Sparkles} label="الإجراء التالي" value={nextMove} tone="primary" />
        <CommandInsight icon={ShieldAlert} label="قرارات عاجلة" value={`${formatNumber(urgentDecisionRows.length)} منطقة`} tone="rose" />
        <CommandInsight icon={Clock3} label="متابعة حرجة" value={`${formatNumber(followUpRecommendations.length)} مهمة`} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Activity}
          label="صحة الشبكة"
          value={`${preview?.summary?.networkHealthScore ?? 0}/100`}
          tone={(preview?.summary?.networkHealthScore ?? 0) >= 70 ? "emerald" : "amber"}
          isLoading={previewQuery.isLoading}
        />
        <KpiCard
          icon={ShieldAlert}
          label="مناطق حرجة"
          value={formatNumber(preview?.summary?.criticalAreas)}
          tone="rose"
          isLoading={previewQuery.isLoading}
        />
        <KpiCard
          icon={Lightbulb}
          label="توصيات مفتوحة"
          value={formatNumber(openRecommendations || preview?.summary?.recommendationsCount)}
          tone="violet"
          isLoading={recommendationsQuery.isLoading && previewQuery.isLoading}
        />
        <KpiCard
          icon={Bell}
          label="تنبيهات غير مقروءة"
          value={formatNumber(unreadAlerts)}
          tone="sky"
          isLoading={alertsQuery.isLoading}
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value || "overview")}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-border/30 bg-card/70 p-1">
          <TabsTrigger value="overview" className="h-10 min-w-fit px-4 text-xs font-black">نظرة عامة</TabsTrigger>
          <TabsTrigger value="executive" className="h-10 min-w-fit px-4 text-xs font-black">قرار تنفيذي</TabsTrigger>
          <TabsTrigger value="recommendations" className="h-10 min-w-fit px-4 text-xs font-black">
            التوصيات <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs">{formatNumber(recommendations.length)}</span>
          </TabsTrigger>
          <TabsTrigger value="followup" className="h-10 min-w-fit px-4 text-xs font-black">
            مهام المتابعة <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs">{formatNumber(followUpRecommendations.length)}</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="h-10 min-w-fit px-4 text-xs font-black">
            التنبيهات <span className="rounded-full bg-secondary px-1.5 py-0.5 text-xs">{formatNumber(unreadAlerts)}</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="h-10 min-w-fit px-4 text-xs font-black">ضغط المزودين</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="p-5 bg-card/70 border-border/40">
            <SectionTitle icon={MapPinned} title="مناطق الضغط حسب الخدمة" subtitle="أعلى المناطق التي تحتاج متابعة أو تعاقد مزودين جدد." />
            {previewQuery.isLoading ? (
              <SkeletonList count={5} />
            ) : pressureAreas.length === 0 ? (
              <EmptyMessage text="لا توجد مناطق ضغط ضمن فترة التحليل الحالية." />
            ) : (
              <div className="mt-5 space-y-3">
                {pressureAreas.slice(0, 10).map((area) => (
                  <PressureRow key={area.key} area={area} maxPressure={maxPressure} />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 bg-card/70 border-border/40">
            <SectionTitle icon={Target} title="أفضل الإجراءات المقترحة" subtitle="توصيات مولدة من التحليل الحالي قبل الحفظ." />
            {previewQuery.isLoading ? (
              <SkeletonList count={4} />
            ) : previewRecommendations.length === 0 ? (
              <EmptyMessage text="لا توجد توصيات حرجة حاليا. الشبكة تبدو مستقرة." />
            ) : (
              <div className="mt-5 space-y-3">
                {previewRecommendations.slice(0, 6).map((item, index) => (
                  <RecommendationMiniCard key={`${item.city}-${item.serviceId}-${index}`} item={item} />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "executive" && (
        <div className="space-y-5">
          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black text-primary">القرار المقترح الآن</span>
                </div>
                <h2 className="text-xl font-black text-foreground">{nextMove}</h2>
                <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">
                  هذا الملخص مبني على أعلى منطقة ضغط ضمن الفلاتر الحالية، ويهدف لتقليل وقت القرار بين التحليل والتنفيذ.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/30 bg-background/35 p-3 text-center">
                <DecisionDetail label="ضغط المنطقة" value={topDecision?.pressureScore ?? 0} />
                <DecisionDetail label="الأثر" value={`${topDecision?.expectedRelief ?? 0}%`} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ExecutiveMetricCard icon={ShieldAlert} label="أعلى منطقة ضغط" value={topDecision?.city || "لا يوجد"} detail={topDecision?.serviceNameAr || topDecision?.serviceName || "ضمن الفلاتر الحالية"} tone="rose" />
            <ExecutiveMetricCard icon={UsersRound} label="المزودون المقترحون" value={formatNumber(totalProvidersNeeded)} detail="إجمالي تعاقدات مقترحة" tone="violet" />
            <ExecutiveMetricCard icon={Target} label="قرارات عاجلة" value={formatNumber(urgentDecisionRows.length)} detail="مناطق حرجة أو عالية الضغط" tone="amber" />
            <ExecutiveMetricCard icon={TrendingUp} label="أثر متوقع" value={`${topDecision?.expectedRelief ?? 0}%`} detail="تخفيف تقديري لأعلى منطقة" tone="emerald" />
          </div>

          <Card className="p-5 bg-card/70 border-border/40">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <SectionTitle icon={FileText} title="جدول قرارات التعاقد" subtitle="ترتيب المناطق حسب الضغط مع الإجراء المقترح والأثر المتوقع." />
              <Button
                variant="outline"
                className="w-fit gap-2"
                disabled={decisionRows.length === 0}
                onClick={() => downloadCsv(`operations-decisions-${new Date().toISOString().slice(0, 10)}.csv`, decisionRows.map((row) => ({
                  city: row.city,
                  governorate: row.governorate,
                  service: row.serviceNameAr || row.serviceName,
                  priority: row.decisionPriority,
                  pressureScore: row.pressureScore,
                  orders: row.ordersCount,
                  activeProviders: row.activeProviders,
                  providersNeeded: row.providersNeeded,
                  expectedRelief: `${row.expectedRelief}%`,
                  cancelRate: `${row.cancelRate}%`,
                  unassignedRate: `${row.unassignedRate}%`,
                })))}
              >
                <Download className="h-4 w-4" />
                تصدير CSV
              </Button>
            </div>

            {previewQuery.isLoading ? (
              <SkeletonList count={6} />
            ) : decisionRows.length === 0 ? (
              <EmptyMessage text="لا توجد بيانات ضغط كافية لبناء قرارات تنفيذية ضمن الفلاتر الحالية." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/35">
                <div className="grid grid-cols-[1.1fr_1fr_.8fr_.8fr_.8fr_.8fr] gap-3 border-b border-border/30 bg-secondary/30 px-4 py-3 text-xs font-black text-muted-foreground max-lg:hidden">
                  <span>المنطقة</span>
                  <span>الخدمة</span>
                  <span>الأولوية</span>
                  <span>الطلبات</span>
                  <span>المقترح</span>
                  <span>قرار</span>
                </div>
                <div className="divide-y divide-border/25">
                  {decisionRows.slice(0, 20).map((row) => (
                    <DecisionRow key={`${row.key}-decision`} row={row} onOpen={() => setDecisionTarget(row)} />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "recommendations" && (
        <Card className="p-5 bg-card/70 border-border/40">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SectionTitle icon={Lightbulb} title="التوصيات المحفوظة" subtitle="تابع القرار من توصية جديدة إلى معالجة ثم حل." />
            <Select value={recommendationStatus} onValueChange={(value) => setRecommendationStatus(value || "all")}>
              <SelectTrigger className="h-10 w-44 bg-background/60 text-xs">
                <FilterSelectValue label="الحالة" value={recommendationStatus === "all" ? "كل الحالات" : statusLabels[recommendationStatus]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="new">جديدة</SelectItem>
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="resolved">تم الحل</SelectItem>
                <SelectItem value="dismissed">متجاهلة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recommendationsQuery.isLoading ? (
            <SkeletonList count={6} />
          ) : recommendations.length === 0 ? (
            <EmptyMessage text="لا توجد توصيات محفوظة حسب الفلاتر الحالية. شغل تحليل جديد لحفظ توصيات." />
          ) : (
            <div className="space-y-3">
              {recommendations.map((item: OperationalRecommendation) => (
                <RecommendationCard
                  key={idOf(item)}
                  item={item}
                  canManage={canManage}
                  isPending={statusMutation.isPending}
                  onStatus={(status: string) => statusMutation.mutate({ id: idOf(item), status })}
                  onNote={() => setNoteTarget(item)}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "followup" && (
        <Card className="p-5 bg-card/70 border-border/40">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SectionTitle icon={Clock3} title="مهام المتابعة الحرجة" subtitle="التوصيات التي اقترب موعدها أو تجاوزت SLA وتحتاج إجراء إداري واضح." />
            <Badge className="w-fit border border-primary/25 bg-primary/10 text-primary">
              {formatNumber(followUpRecommendations.length)} مهمة
            </Badge>
          </div>

          {recommendationsQuery.isLoading ? (
            <SkeletonList count={5} />
          ) : followUpRecommendations.length === 0 ? (
            <EmptyMessage text="لا توجد مهام متابعة متأخرة أو حرجة حالياً." />
          ) : (
            <div className="space-y-3">
              {followUpRecommendations.map((item: OperationalRecommendation) => (
                <RecommendationCard
                  key={idOf(item)}
                  item={item}
                  canManage={canManage}
                  isPending={statusMutation.isPending}
                  onStatus={(status: string) => statusMutation.mutate({ id: idOf(item), status })}
                  onNote={() => setNoteTarget(item)}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "alerts" && (
        <Card className="p-5 bg-card/70 border-border/40">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SectionTitle icon={Bell} title="تنبيهات ذكاء العمليات" subtitle="تنبيهات قابلة للقراءة والحل حتى لا تضيع إشارات الضغط المهمة." />
            <Select value={alertStatus} onValueChange={(value) => setAlertStatus(value || "all")}>
              <SelectTrigger className="h-10 w-44 bg-background/60 text-xs">
                <FilterSelectValue label="الحالة" value={alertStatus === "all" ? "كل التنبيهات" : statusLabels[alertStatus]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التنبيهات</SelectItem>
                <SelectItem value="unread">غير مقروء</SelectItem>
                <SelectItem value="read">مقروء</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {alertsQuery.isLoading ? (
            <SkeletonList count={6} />
          ) : alerts.length === 0 ? (
            <EmptyMessage text="لا توجد تنبيهات حسب الفلاتر الحالية." />
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: OperationalAlert) => (
                <AlertCard
                  key={idOf(alert)}
                  alert={alert}
                  canManage={canManage}
                  onRead={() => readAlertMutation.mutate(idOf(alert))}
                  onResolve={() => resolveAlertMutation.mutate(idOf(alert))}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "providers" && (
        <Card className="p-5 bg-card/70 border-border/40">
          <SectionTitle icon={UsersRound} title="ضغط المزودين" subtitle="تصنيف ذكي للمزودين حسب عبء العمل والمخاطر والاستفادة." />
          {previewQuery.isLoading ? (
            <SkeletonList count={6} />
          ) : providerWorkload.length === 0 ? (
            <EmptyMessage text="لا توجد بيانات ضغط مزودين ضمن الفترة الحالية." />
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {providerWorkload.map((provider) => (
                <ProviderWorkloadCard key={provider.providerId} provider={provider} />
              ))}
            </div>
          )}
        </Card>
      )}

      <Dialog open={!!noteTarget} onOpenChange={(open) => !open && setNoteTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة على التوصية</DialogTitle>
            <DialogDescription>{noteTarget?.title || noteTarget?.summary}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="اكتب ماذا تم أو ما هي الخطوة التالية..."
            className="min-h-28"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteTarget(null)}>إلغاء</Button>
            <Button
              onClick={() => noteTarget && noteMutation.mutate({ id: idOf(noteTarget), note: noteText })}
              disabled={!noteText.trim() || noteMutation.isPending}
            >
              {noteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
              حفظ الملاحظة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!decisionTarget} onOpenChange={(open) => !open && setDecisionTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>تقرير قرار تنفيذي</DialogTitle>
            <DialogDescription>
              {decisionTarget?.city || "منطقة غير محددة"} - {decisionTarget?.serviceNameAr || decisionTarget?.serviceName || "خدمة غير محددة"}
            </DialogDescription>
          </DialogHeader>
          {decisionTarget && (
            <div className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <DecisionDetail label="درجة الضغط" value={decisionTarget.pressureScore} />
                <DecisionDetail label="الطلبات" value={formatNumber(decisionTarget.ordersCount)} />
                <DecisionDetail label="المزودون" value={formatNumber(decisionTarget.activeProviders)} />
                <DecisionDetail label="المقترح" value={`${formatNumber(decisionTarget.providersNeeded)} مزود`} />
              </div>
              <div className="rounded-xl border border-border/35 bg-secondary/15 p-4">
                <h3 className="text-sm font-black text-foreground">سبب القرار</h3>
                <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">
                  يوجد ضغط {levelLabels[decisionTarget.level] || decisionTarget.level} على خدمة {decisionTarget.serviceNameAr || decisionTarget.serviceName}
                  في {decisionTarget.city || "المنطقة المحددة"} مع {formatNumber(decisionTarget.ordersCount)} طلب،
                  و {formatNumber(decisionTarget.activeProviders)} مزود نشط. الإجراء المقترح هو التعاقد مع
                  {" "}{formatNumber(decisionTarget.providersNeeded)} مزود لتخفيف الضغط المتوقع بنسبة {decisionTarget.expectedRelief}%.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <DecisionDetail label="معدل الإلغاء" value={`${decisionTarget.cancelRate || 0}%`} />
                <DecisionDetail label="غير المسندة" value={`${decisionTarget.unassignedRate || 0}%`} />
                <DecisionDetail label="النمو الأخير" value={`${decisionTarget.recentGrowthRate || 0}%`} />
              </div>
              <div className="rounded-xl border border-primary/25 bg-primary/10 p-4">
                <h3 className="text-sm font-black text-primary">الخطوة التنفيذية المقترحة</h3>
                <p className="mt-2 text-xs font-bold leading-6 text-foreground">
                  افتح مهمة تعاقد لهذه المنطقة، وابدأ بالأولوية {priorityLabels[decisionTarget.decisionPriority] || decisionTarget.decisionPriority}.
                  بعد إضافة المزودين، أعد تشغيل التحليل لمقارنة درجة الضغط قبل وبعد القرار.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionTarget(null)}>إغلاق</Button>
            <Button onClick={() => setTab("recommendations")}>
              <Lightbulb className="h-4 w-4" />
              فتح التوصيات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
