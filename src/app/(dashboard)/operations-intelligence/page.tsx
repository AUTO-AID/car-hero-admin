"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  Brain,
  Download,
  Lightbulb,
  Loader2,
  MapPinned,
  MessageSquarePlus,
  Play,
  RotateCcw,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/application/contexts/auth-context";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { getAllServices } from "@/infrastructure/services/services.service";
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
} from "@/infrastructure/services/operations-intelligence.service";
import {
  AlertCard,
  AreaRow,
  DecisionDetail,
  EmptyMessage,
  KpiCard,
  NextActionBanner,
  PressureLegend,
  ProviderWorkloadCard,
  RecommendationCard,
  ScoreBreakdown,
  SectionTitle,
  SkeletonList,
  recommendationHeadline,
} from "./components/insight-cards";
import type { DecisionRowData } from "./types";
import {
  areaLabel,
  formatNumber,
  idOf,
  levelLabels,
  normalizeCity,
  priorityLabels,
  statusLabels,
  translateReasons,
} from "./lib";

const periodLabels: Record<string, string> = {
  "7": "آخر 7 أيام",
  "14": "آخر 14 يوم",
  "30": "آخر 30 يوم",
};

const ALL = "__all__";

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
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
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
  const canManage = Boolean(
    admin?.permissions?.some((permission: string) => ["*", "all", "operations.manage"].includes(permission)),
  );

  const [tab, setTab] = useState("areas");
  const [days, setDays] = useState("14");
  const [city, setCity] = useState(ALL);
  const [serviceId, setServiceId] = useState(ALL);
  const [recommendationStatus, setRecommendationStatus] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [alertStatus, setAlertStatus] = useState("all");
  const [alertPage, setAlertPage] = useState(1);
  const [recommendationPage, setRecommendationPage] = useState(1);
  const [noteTarget, setNoteTarget] = useState<OperationalRecommendation | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<DecisionRowData | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  const cityParam = city === ALL ? undefined : city;
  const serviceParam = serviceId === ALL ? undefined : serviceId;

  const previewParams: OperationsPreviewParams = useMemo(
    () => ({
      days: Number(days),
      previousDays: Number(days),
      limit: 50,
      city: cityParam,
      serviceId: serviceParam,
    }),
    [cityParam, days, serviceParam],
  );

  // استعلام ثانٍ بلا فلاتر منطقة/خدمة: قوائم الفلاتر تُبنى من البيانات نفسها،
  // فلو بُنيت من النتيجة المفلترة لاختفت الخيارات فور اختيار أحدها ولتعذّر
  // على المستخدم تبديل الفلتر أو إلغاؤه.
  const optionsParams: OperationsPreviewParams = useMemo(
    () => ({ days: Number(days), previousDays: Number(days), limit: 100 }),
    [days],
  );

  const recommendationsParams = useMemo(
    () => ({
      page: recommendationPage,
      limit: 20,
      status: recommendationStatus,
      city: cityParam,
      serviceId: serviceParam,
    }),
    [cityParam, recommendationPage, recommendationStatus, serviceParam],
  );

  const alertsParams = useMemo(
    () => ({ page: alertPage, limit: 20, status: alertStatus, city: cityParam, serviceId: serviceParam }),
    [alertPage, alertStatus, cityParam, serviceParam],
  );

  const previewQuery = useQuery({
    queryKey: queryKeys.operationsIntelligence.preview(previewParams),
    queryFn: () => getOperationsPreview(previewParams),
    retry: 1,
    staleTime: 30_000,
  });

  const optionsQuery = useQuery({
    queryKey: queryKeys.operationsIntelligence.preview(optionsParams),
    queryFn: () => getOperationsPreview(optionsParams),
    retry: 1,
    staleTime: 300_000,
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

  // قائمة الخدمات الكاملة كمصدر لأسمائها العربية. اشتقاقها من مناطق الضغط
  // وحدها كان يترك خدمات بلا مقابل عربي: التوصيات المحفوظة قد تشير إلى خدمة
  // لا نشاط لها ضمن الفترة المعروضة، فتظهر باسمها الإنجليزي.
  const servicesQuery = useQuery({
    queryKey: ["services", "operations-name-map"],
    queryFn: () => getAllServices({}, 1, 100),
    staleTime: 600_000,
    retry: 1,
  });

  const scanMutation = useMutation({
    mutationFn: () => runOperationsScan(previewParams),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.all });
      toast.success(
        `اكتمل التحليل — ${formatNumber(Number(result.scan?.recommendationsSaved ?? 0))} توصية و ${formatNumber(Number(result.scan?.alertsSaved ?? 0))} تنبيه`,
      );
    },
    onError: () => toast.error("تعذّر تشغيل التحليل. تحقّق من الصلاحيات أو الاتصال."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      updateOperationalRecommendationStatus(id, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.all });
      toast.success("تم تحديث حالة التوصية");
    },
    onError: () => toast.error("تعذّر تحديث حالة التوصية"),
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => addOperationalRecommendationNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.recommendations(recommendationsParams) });
      toast.success("تمت إضافة الملاحظة");
      setNoteTarget(null);
      setNoteText("");
    },
    onError: () => toast.error("تعذّر إضافة الملاحظة"),
  });

  const readAlertMutation = useMutation({
    mutationFn: markOperationalAlertRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.alerts(alertsParams) });
    },
    onError: () => toast.error("تعذّر تعليم التنبيه كمقروء"),
  });

  const resolveAlertMutation = useMutation({
    mutationFn: resolveOperationalAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.alerts(alertsParams) });
      toast.success("تم حلّ التنبيه");
    },
    onError: () => toast.error("تعذّر حلّ التنبيه"),
  });

  const preview = previewQuery.data;
  // `?? []` يبني مصفوفة جديدة في كل رسم، فتتغيّر مراجع تبعيات useMemo دائماً
  // ويسقط أثر التذكير. تثبيتها هنا يجعل الحسابات أدناه تُعاد فعلاً عند تغيّر
  // البيانات وحدها.
  const EMPTY = useMemo(() => [] as never[], []);
  const pressureAreas = preview?.pressureAreas ?? (EMPTY as PressureArea[]);
  const providerWorkload = preview?.providerWorkload ?? EMPTY;
  const recommendations: OperationalRecommendation[] =
    recommendationsQuery.data?.recommendations ?? EMPTY;
  const alerts: OperationalAlert[] = alertsQuery.data?.alerts ?? EMPTY;
  const unreadAlerts = alertsQuery.data?.stats?.unread ?? 0;
  const alertPages = alertsQuery.data?.pagination?.pages ?? 1;
  const alertTotal = alertsQuery.data?.pagination?.total ?? alerts.length;
  const recommendationPages = recommendationsQuery.data?.pagination?.pages ?? 1;
  const recommendationTotal = recommendationsQuery.data?.pagination?.total ?? recommendations.length;

  // خرائط الترجمة والفلاتر مبنيّة من المجموعة غير المفلترة
  const optionAreas = optionsQuery.data?.pressureAreas ?? (EMPTY as PressureArea[]);

  // القيمة تبقى كما وردت لأن الخادم يفلتر عليها؛ المعروض هو الاسم الموحَّد.
  const cityOptions = useMemo(() => {
    const set = new Map<string, string>();
    optionAreas.forEach((area) => {
      const raw = (area.city || "").trim();
      if (!raw || raw.toLowerCase() === "unknown") return;
      set.set(raw, normalizeCity(raw) || raw);
    });
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1], "ar"));
  }, [optionAreas]);

  const serviceOptions = useMemo(() => {
    const set = new Map<string, string>();
    optionAreas.forEach((area) => {
      if (!area.serviceId) return;
      set.set(area.serviceId, area.serviceNameAr || area.serviceName || area.serviceId);
    });
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1], "ar"));
  }, [optionAreas]);

  /**
   * الاسم العربي للخدمة حسب المعرّف.
   *
   * المصدر الأول هو قائمة الخدمات (كلها تحمل nameAr)، والثاني مناطق الضغط.
   * التوصيات والتنبيهات المحفوظة تحمل الاسم الإنجليزي وحده، فبدون هذا الجسر
   * تظهر أسماء لاتينية وسط واجهة عربية.
   */
  /**
   * `getAllServices` تُرجع جسم الاستجابة كما هو دون تفكيك الغلاف
   * `{ success, data }` — بخلاف بقية خدمات هذه اللوحة. قراءة `.services`
   * مباشرة كانت تعطي undefined دائماً، فتبقى خريطة الأسماء فارغة بصمت.
   */
  const serviceCatalogue = useMemo(() => {
    const raw = servicesQuery.data as
      | { services?: Array<Record<string, unknown>>; data?: { services?: Array<Record<string, unknown>> } }
      | undefined;
    return raw?.services ?? raw?.data?.services;
  }, [servicesQuery.data]);

  const serviceArById: Readonly<Record<string, string>> = useMemo(() => {
    const map: Record<string, string> = {};
    (serviceCatalogue ?? []).forEach((service) => {
      const id = String(service._id || service.id || "");
      const nameAr = String(service.nameAr || "").trim();
      if (id && nameAr) map[id] = nameAr;
    });
    // مناطق الضغط احتياطاً لأي خدمة غابت عن القائمة
    [...optionAreas, ...pressureAreas].forEach((area) => {
      const id = String(area.serviceId || "");
      if (id && area.serviceNameAr && !map[id]) map[id] = area.serviceNameAr;
    });
    return map;
  }, [optionAreas, pressureAreas, serviceCatalogue]);

  /**
   * ملاذ أخير: المطابقة بالاسم الإنجليزي.
   *
   * السجلّات القديمة قد تشير إلى خدمة حُذفت أو لا تعيدها صفحة القائمة، فيفشل
   * البحث بالمعرّف. الاسم الإنجليزي نفسه متكرّر عبر عدّة معرّفات لنفس الخدمة،
   * فيكفي لإيجاد المقابل العربي.
   */
  const serviceArByName: Readonly<Record<string, string>> = useMemo(() => {
    const map: Record<string, string> = {};
    (serviceCatalogue ?? []).forEach((service) => {
      const name = String(service.name || "").trim().toLowerCase();
      const nameAr = String(service.nameAr || "").trim();
      if (name && nameAr && !map[name]) map[name] = nameAr;
    });
    [...optionAreas, ...pressureAreas].forEach((area) => {
      const name = String(area.serviceName || "").trim().toLowerCase();
      if (name && area.serviceNameAr && !map[name]) map[name] = area.serviceNameAr;
    });
    return map;
  }, [optionAreas, pressureAreas, serviceCatalogue]);

  const serviceLabel = (id: string) =>
    serviceArById[id] || serviceOptions.find(([key]) => key === id)?.[1];

  /**
   * التوصية المحفوظة تسمّي الحقل `service` (مرجع Mongo) بينما توصية المعاينة
   * تسمّيه `serviceId`. قراءة أحدهما فقط كانت تترك نصف السجلات بلا اسم عربي.
   */
  const serviceArOf = (item: { serviceId?: string; service?: unknown; serviceName?: string }) => {
    const id = String(item.serviceId || item.service || "");
    if (id && serviceArById[id]) return serviceArById[id];
    const name = String(item.serviceName || "").trim().toLowerCase();
    return (name && serviceArByName[name]) || undefined;
  };

  const openRecommendations = recommendations.filter(
    (item: OperationalRecommendation) => !["resolved", "dismissed"].includes(item.status || "new"),
  ).length;

  const overdueRecommendations = recommendations.filter(
    (item: OperationalRecommendation) =>
      !["resolved", "dismissed"].includes(item.status || "new") &&
      (item.slaStatus === "overdue" || item.slaStatus === "due_soon" || item.priority === "critical"),
  );

  const visibleRecommendations = overdueOnly ? overdueRecommendations : recommendations;

  const decisionRows: DecisionRowData[] = useMemo(
    () =>
      pressureAreas
        .map((area: PressureArea) => {
          const providersNeeded = Math.max(1, Math.ceil((area.ordersPerProvider || 0) / 3));
          const expectedRelief = Math.min(
            95,
            Math.round((providersNeeded / Math.max(area.activeProviders + providersNeeded, 1)) * 100),
          );
          const decisionPriority: DecisionRowData["decisionPriority"] =
            area.level === "critical" ? "critical" : area.level === "pressured" ? "high" : "medium";
          return { ...area, providersNeeded, expectedRelief, decisionPriority };
        })
        .sort((a, b) => (b.pressureScore || 0) - (a.pressureScore || 0)),
    [pressureAreas],
  );

  /**
   * «الإجراء التالي» يجب أن يكون قابلاً للتنفيذ.
   *
   * أعلى المناطق ضغطاً كثيراً ما تكون المنطقة المجهولة (طلبات بلا مزوّد مُسنَد
   * لا تُشتق منها مدينة)، و«تعاقد مع مزوّدين في منطقة غير محدّدة» ليس قراراً.
   * نختار إذاً أعلى منطقة **معروفة**، ونُبقي المجهولة في الجدول لأنها إشارة
   * جودة بيانات لا يصح إخفاؤها.
   */
  const topDecision =
    decisionRows.find((row) => !!normalizeCity(row.city) || !!normalizeCity(row.governorate)) ??
    decisionRows[0];

  const unknownAreaCount = decisionRows.filter(
    (row) => !normalizeCity(row.city) && !normalizeCity(row.governorate),
  ).length;
  const criticalAreas = decisionRows.filter((row) => row.level === "critical").length;
  const uncoveredAreas = decisionRows.filter(
    (row) => (row.activeProviders || 0) === 0 && (row.ordersCount || 0) > 0,
  ).length;

  const hasFilters = city !== ALL || serviceId !== ALL || days !== "14";
  const resetFilters = () => {
    setCity(ALL);
    setServiceId(ALL);
    setDays("14");
    setAlertPage(1);
    setRecommendationPage(1);
  };

  // تغيير أي فلتر يعيد الترقيم إلى الصفحة الأولى: البقاء على صفحة 7 بعد
  // تضييق النتيجة إلى صفحتين يعرض فراغاً يبدو كأن لا بيانات.
  const changeCity = (value: string | null) => {
    setCity(value || ALL);
    setAlertPage(1);
    setRecommendationPage(1);
  };
  const changeService = (value: string | null) => {
    setServiceId(value || ALL);
    setAlertPage(1);
    setRecommendationPage(1);
  };

  const nextActionHeadline = topDecision
    ? `التعاقد مع ${formatNumber(topDecision.providersNeeded)} مزوّد في ${areaLabel(topDecision.city, topDecision.governorate)}`
    : "لا يوجد إجراء عاجل ضمن الفلاتر الحالية";

  const nextActionDetail = topDecision
    ? `${serviceArOf(topDecision) || topDecision.serviceNameAr || topDecision.serviceName} — ${formatNumber(topDecision.ordersCount)} طلب مقابل ${formatNumber(topDecision.activeProviders)} مزوّد نشط`
    : "شغّل تحليلاً جديداً أو وسّع الفترة الزمنية لرصد مناطق الضغط.";

  return (
    <div className="space-y-5" dir="rtl">
      {/* ---------- الرأس + شريط الفلاتر ---------- */}
      <Card className="overflow-hidden border-border/40 bg-card/70 p-0">
        <div className="flex flex-col gap-4 border-b border-border/30 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">ذكاء العمليات</h1>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-6 text-muted-foreground">
                يقيس ضغط الطلب مقابل التغطية في كل منطقة وخدمة، ويحوّل النتيجة إلى قرار تعاقد واضح.
              </p>
            </div>
          </div>

          <Button
            onClick={() => scanMutation.mutate()}
            disabled={!canManage || scanMutation.isPending}
            className="h-11 shrink-0 gap-2 font-black"
            title={!canManage ? "تحتاج صلاحية operations.manage" : undefined}
          >
            {scanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {scanMutation.isPending ? "جارٍ التحليل…" : "تشغيل التحليل"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-background/25 px-5 py-3">
          <Select value={days} onValueChange={(value) => setDays(value || "14")}>
            <SelectTrigger className="h-10 w-44 bg-background/60 text-xs">
              <FilterSelectValue label="الفترة" value={periodLabels[days]} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="14">آخر 14 يوم</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
            </SelectContent>
          </Select>

          <Select value={city} onValueChange={changeCity}>
            <SelectTrigger className="h-10 w-48 bg-background/60 text-xs">
              <FilterSelectValue
                label="المنطقة"
                value={city === ALL ? "كل المناطق" : normalizeCity(city) || city}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل المناطق</SelectItem>
              {cityOptions.map(([raw, label]) => (
                <SelectItem key={raw} value={raw}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* كان حقل نص خام يطلب ObjectId — لا أحد يعرف قيمته، فكان الفلتر معطّلاً عملياً */}
          <Select value={serviceId} onValueChange={changeService}>
            <SelectTrigger className="h-10 w-56 bg-background/60 text-xs">
              <FilterSelectValue
                label="الخدمة"
                value={
                  serviceId === ALL ? "كل الخدمات" : serviceLabel(serviceId) || "خدمة"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>كل الخدمات</SelectItem>
              {serviceOptions.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {serviceArById[id] || name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10 gap-1.5 text-xs font-bold">
              <RotateCcw className="h-3.5 w-3.5" />
              إعادة الضبط
            </Button>
          )}

          <span className="ms-auto text-xs font-bold text-muted-foreground">
            {previewQuery.isFetching
              ? "جارٍ التحديث…"
              : `${formatNumber(decisionRows.length)} منطقة/خدمة ضمن التحليل`}
          </span>
        </div>
      </Card>

      {/* ---------- الإجراء التالي ---------- */}
      {!previewQuery.isLoading && (
        <NextActionBanner
          headline={nextActionHeadline}
          detail={nextActionDetail}
          score={topDecision?.pressureScore}
          level={topDecision?.level}
          relief={topDecision?.expectedRelief}
          onOpen={topDecision ? () => setDecisionTarget(topDecision) : undefined}
        />
      )}

      {/* ---------- مؤشرات ---------- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Activity}
          label="صحة الشبكة"
          value={`${preview?.summary?.networkHealthScore ?? 0}/100`}
          hint="كلما ارتفعت كانت التغطية أقرب للطلب"
          tone={(preview?.summary?.networkHealthScore ?? 0) >= 70 ? "emerald" : "amber"}
          isLoading={previewQuery.isLoading}
        />
        <KpiCard
          icon={ShieldAlert}
          label="مناطق حرجة"
          value={formatNumber(criticalAreas)}
          hint={`منها ${formatNumber(uncoveredAreas)} بلا أي مزوّد`}
          tone="rose"
          isLoading={previewQuery.isLoading}
        />
        <KpiCard
          icon={Lightbulb}
          label="توصيات مفتوحة"
          value={formatNumber(openRecommendations)}
          hint={`${formatNumber(overdueRecommendations.length)} تحتاج متابعة عاجلة`}
          tone="violet"
          isLoading={recommendationsQuery.isLoading}
        />
        <KpiCard
          icon={Bell}
          label="تنبيهات غير مقروءة"
          value={formatNumber(unreadAlerts)}
          hint="إشارات لم يطّلع عليها أحد بعد"
          tone="sky"
          isLoading={alertsQuery.isLoading}
        />
      </div>

      {/* ---------- التبويبات ---------- */}
      <Tabs value={tab} onValueChange={(value) => setTab(value || "areas")}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl border border-border/30 bg-card/70 p-1">
          <TabsTrigger value="areas" className="h-10 min-w-fit gap-2 px-4 text-xs font-black">
            مناطق الضغط
            <TabCount value={decisionRows.length} />
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="h-10 min-w-fit gap-2 px-4 text-xs font-black">
            التوصيات
            <TabCount value={openRecommendations} />
          </TabsTrigger>
          <TabsTrigger value="alerts" className="h-10 min-w-fit gap-2 px-4 text-xs font-black">
            التنبيهات
            <TabCount value={unreadAlerts} highlight={unreadAlerts > 0} />
          </TabsTrigger>
          <TabsTrigger value="providers" className="h-10 min-w-fit gap-2 px-4 text-xs font-black">
            المزوّدون
            <TabCount value={providerWorkload.length} />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ---------- مناطق الضغط ---------- */}
      {tab === "areas" && (
        <Card className="border-border/40 bg-card/70 p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <SectionTitle
              icon={MapPinned}
              title="مناطق الضغط حسب الخدمة"
              subtitle="مرتّبة من الأعلى ضغطاً. اضغط «لماذا؟» لترى من أين جاءت الدرجة."
            />
            <Button
              variant="outline"
              className="w-fit shrink-0 gap-2 font-bold"
              disabled={decisionRows.length === 0}
              onClick={() =>
                downloadCsv(
                  `operations-decisions-${new Date().toISOString().slice(0, 10)}.csv`,
                  decisionRows.map((row) => ({
                    المنطقة: areaLabel(row.city, row.governorate),
                    المحافظة: row.governorate || "",
                    الخدمة: serviceArOf(row) || row.serviceNameAr || row.serviceName,
                    المستوى: levelLabels[row.level] || row.level,
                    درجة_الضغط: row.pressureScore,
                    الطلبات: row.ordersCount,
                    المزودون_النشطون: row.activeProviders,
                    المقترح: row.providersNeeded,
                    الأثر_المتوقع: `${row.expectedRelief}%`,
                    نسبة_الإلغاء: `${row.cancelRate}%`,
                    بلا_إسناد: `${row.unassignedRate}%`,
                    زمن_الاستجابة_دقيقة: row.avgResponseMinutes,
                  })),
                )
              }
            >
              <Download className="h-4 w-4" />
              تصدير CSV
            </Button>
          </div>

          <div className="mb-4 space-y-2 rounded-xl border border-border/25 bg-background/30 px-4 py-3">
            <PressureLegend />
            {unknownAreaCount > 0 && (
              <p className="text-xs font-semibold text-warning">
                {formatNumber(unknownAreaCount)} صف بلا منطقة محدّدة — المنطقة تُشتق من مدينة المزوّد،
                والطلبات التي لم تُسنَد لأحد لا مدينة لها.
              </p>
            )}
          </div>

          {previewQuery.isLoading ? (
            <SkeletonList count={5} />
          ) : decisionRows.length === 0 ? (
            <EmptyMessage
              title="لا توجد مناطق ضغط ضمن الفلاتر الحالية"
              description="جرّب توسيع الفترة الزمنية أو إعادة ضبط الفلاتر."
              action={hasFilters ? { label: "إعادة ضبط الفلاتر", onClick: resetFilters } : undefined}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/30">
              {decisionRows.map((row) => (
                <AreaRow
                  key={row.key}
                  row={row}
                  serviceAr={serviceArOf(row)}
                  expanded={expandedArea === row.key}
                  onToggle={() => setExpandedArea(expandedArea === row.key ? null : row.key)}
                  onOpen={() => setDecisionTarget(row)}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ---------- التوصيات ---------- */}
      {tab === "recommendations" && (
        <Card className="border-border/40 bg-card/70 p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <SectionTitle
              icon={Lightbulb}
              title="التوصيات"
              subtitle="من توصية جديدة إلى معالجة ثم حل — مع موعد متابعة لكل واحدة."
            />
            <div className="flex flex-wrap items-center gap-2">
              {/* استوعب تبويب «مهام المتابعة» الذي كان يعرض القائمة نفسها مفلترة */}
              <Button
                variant={overdueOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setOverdueOnly(!overdueOnly)}
                className="h-10 gap-1.5 text-xs font-bold"
              >
                المتابعة العاجلة
                <TabCount value={overdueRecommendations.length} highlight={overdueOnly} />
              </Button>
              <Select
                value={recommendationStatus}
                onValueChange={(value) => {
                  setRecommendationStatus(value || "all");
                  setRecommendationPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-44 bg-background/60 text-xs">
                  <FilterSelectValue
                    label="الحالة"
                    value={recommendationStatus === "all" ? "كل الحالات" : statusLabels[recommendationStatus]}
                  />
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
          </div>

          {recommendationsQuery.isLoading ? (
            <SkeletonList count={5} />
          ) : visibleRecommendations.length === 0 ? (
            <EmptyMessage
              icon={Lightbulb}
              title={overdueOnly ? "لا توجد متابعات عاجلة" : "لا توجد توصيات محفوظة"}
              description={
                overdueOnly
                  ? "كل التوصيات المفتوحة ضمن مواعيدها."
                  : "شغّل تحليلاً جديداً لحفظ توصيات من بيانات التشغيل الحالية."
              }
              action={overdueOnly ? { label: "عرض كل التوصيات", onClick: () => setOverdueOnly(false) } : undefined}
            />
          ) : (
            <div className="space-y-3">
              {visibleRecommendations.map((item: OperationalRecommendation) => (
                <RecommendationCard
                  key={idOf(item)}
                  item={item}
                  serviceAr={serviceArOf(item)}
                  canManage={canManage}
                  isPending={statusMutation.isPending}
                  onStatus={(status: string) => statusMutation.mutate({ id: idOf(item), status })}
                  onNote={() => setNoteTarget(item)}
                />
              ))}
              {!overdueOnly && recommendationPages > 1 && (
                <TablePagination
                  page={recommendationPage}
                  totalPages={recommendationPages}
                  total={recommendationTotal}
                  shown={recommendations.length}
                  unit="توصية"
                  busy={recommendationsQuery.isFetching}
                  onPageChange={setRecommendationPage}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* ---------- التنبيهات ---------- */}
      {tab === "alerts" && (
        <Card className="border-border/40 bg-card/70 p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <SectionTitle
              icon={Bell}
              title="التنبيهات"
              subtitle="إشارات الضغط والمتابعات المتأخرة — اقرأها أو أغلقها حتى لا تتراكم."
            />
            <Select
              value={alertStatus}
              onValueChange={(value) => {
                setAlertStatus(value || "all");
                setAlertPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-44 bg-background/60 text-xs">
                <FilterSelectValue
                  label="الحالة"
                  value={alertStatus === "all" ? "كل التنبيهات" : statusLabels[alertStatus]}
                />
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
            <SkeletonList count={5} />
          ) : alerts.length === 0 ? (
            <EmptyMessage icon={Bell} title="لا توجد تنبيهات" description="لا شيء يحتاج انتباهك ضمن هذه الفلاتر." />
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: OperationalAlert) => (
                <AlertCard
                  key={idOf(alert)}
                  alert={alert}
                  serviceAr={serviceArOf({
                    service: (alert as { service?: unknown }).service,
                    serviceName: String(alert.evidence?.serviceName || ""),
                  })}
                  canManage={canManage}
                  onRead={() => readAlertMutation.mutate(idOf(alert))}
                  onResolve={() => resolveAlertMutation.mutate(idOf(alert))}
                />
              ))}
              {alertPages > 1 && (
                <TablePagination
                  page={alertPage}
                  totalPages={alertPages}
                  total={alertTotal}
                  shown={alerts.length}
                  unit="تنبيه"
                  busy={alertsQuery.isFetching}
                  onPageChange={setAlertPage}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* ---------- المزوّدون ---------- */}
      {tab === "providers" && (
        <Card className="border-border/40 bg-card/70 p-5">
          <div className="mb-5">
            <SectionTitle
              icon={UsersRound}
              title="ضغط المزوّدين"
              subtitle="تصنيف المزوّدين حسب عبء العمل والمخاطرة والاستفادة."
            />
          </div>
          {previewQuery.isLoading ? (
            <SkeletonList count={4} />
          ) : providerWorkload.length === 0 ? (
            <EmptyMessage
              icon={UsersRound}
              title="لا توجد بيانات مزوّدين"
              description="لا نشاط كافٍ ضمن الفترة المحدّدة."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {providerWorkload.map((provider) => (
                <ProviderWorkloadCard key={provider.providerId} provider={provider} />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ---------- نافذة الملاحظة ---------- */}
      <Dialog open={!!noteTarget} onOpenChange={(open) => !open && setNoteTarget(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة</DialogTitle>
            <DialogDescription>
              {noteTarget ? recommendationHeadline(noteTarget, serviceArOf(noteTarget)) : ""}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="ماذا تم، أو ما الخطوة التالية؟"
            className="min-h-28"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteTarget(null)}>
              إلغاء
            </Button>
            <Button
              onClick={() => noteTarget && noteMutation.mutate({ id: idOf(noteTarget), note: noteText })}
              disabled={!noteText.trim() || noteMutation.isPending}
              className="gap-1.5"
            >
              {noteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquarePlus className="h-4 w-4" />
              )}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- تقرير المنطقة ---------- */}
      <Dialog open={!!decisionTarget} onOpenChange={(open) => !open && setDecisionTarget(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {decisionTarget ? areaLabel(decisionTarget.city, decisionTarget.governorate) : ""}
            </DialogTitle>
            <DialogDescription>
              {(decisionTarget && serviceArOf(decisionTarget)) ||
                decisionTarget?.serviceNameAr ||
                decisionTarget?.serviceName ||
                ""}
            </DialogDescription>
          </DialogHeader>

          {decisionTarget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <DecisionDetail label="درجة الضغط" value={decisionTarget.pressureScore} />
                <DecisionDetail label="الطلبات" value={formatNumber(decisionTarget.ordersCount)} />
                <DecisionDetail label="المزوّدون" value={formatNumber(decisionTarget.activeProviders)} />
                <DecisionDetail
                  label="المقترح"
                  value={`${formatNumber(decisionTarget.providersNeeded)} مزوّد`}
                />
              </div>

              <div className="rounded-xl border border-border/35 bg-secondary/15 p-4">
                <h3 className="mb-3 text-sm font-black text-foreground">تفصيل درجة الضغط</h3>
                <ScoreBreakdown scores={decisionTarget.componentScores} />
                {!decisionTarget.componentScores && (
                  <p className="text-xs font-semibold text-muted-foreground">التفصيل غير متوفّر.</p>
                )}
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary/10 p-4">
                <h3 className="text-sm font-black text-primary">الخطوة المقترحة</h3>
                <p className="mt-2 text-xs font-bold leading-6 text-foreground">
                  التعاقد مع {formatNumber(decisionTarget.providersNeeded)} مزوّد لخدمة{" "}
                  {serviceArOf(decisionTarget) || decisionTarget.serviceNameAr || decisionTarget.serviceName} في{" "}
                  {areaLabel(decisionTarget.city, decisionTarget.governorate)} — أولوية{" "}
                  {priorityLabels[decisionTarget.decisionPriority]}. الأثر التقديري: تخفيف الضغط بنحو{" "}
                  {decisionTarget.expectedRelief}%. بعد الإضافة أعد تشغيل التحليل لمقارنة الدرجة.
                </p>
              </div>

              {decisionTarget.recommendation && (
                <div className="rounded-xl border border-border/35 bg-background/35 p-4">
                  <h3 className="mb-2 text-sm font-black text-foreground">أسباب التوصية</h3>
                  <ul className="space-y-1">
                    {translateReasons(decisionTarget.recommendation.reasons).map((reason, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-xs font-semibold leading-6 text-muted-foreground"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionTarget(null)}>
              إغلاق
            </Button>
            <Button
              onClick={() => {
                setDecisionTarget(null);
                setTab("recommendations");
              }}
              className="gap-1.5"
            >
              <Lightbulb className="h-4 w-4" />
              فتح التوصيات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabCount({ value, highlight }: { value: number; highlight?: boolean }) {
  if (!value) return null;
  return (
    <Badge
      className={cn(
        "h-5 min-w-5 justify-center border px-1.5 text-xs font-black tabular-nums",
        highlight
          ? "border-primary/30 bg-primary/15 text-primary"
          : "border-border/40 bg-secondary/50 text-muted-foreground",
      )}
    >
      {formatNumber(value)}
    </Badge>
  );
}
