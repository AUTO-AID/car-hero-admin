"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Award, BarChart3, Crown, Medal, PackageCheck, Star, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type TopProvider = {
  _id: string;
  rank: number;
  businessName?: string;
  ownerName?: string;
  phone?: string;
  city?: string;
  governorate?: string;
  status?: string;
  accountStatus?: string;
  registrationStatus?: string;
  isActive?: boolean;
  isApproved?: boolean;
  averageRating?: number;
  totalReviews?: number;
  totalOrders?: number;
  completedOrders?: number;
  activeOrders?: number;
  cancelledOrders?: number;
  completedRevenue?: number;
  completionRate?: number;
  demandShare?: number;
  lastOrderAt?: string;
};

type TopRequestedProvidersProps = {
  data?: {
    top3?: TopProvider[];
    providers?: TopProvider[];
    summary?: {
      totalProviders?: number;
      totalRequestedOrders?: number;
      topProviderOrders?: number;
      top3Orders?: number;
    };
  };
  isLoading?: boolean;
};

const medalStyles = [
  {
    icon: Crown,
    label: "الأول",
    className: "from-amber-400/25 via-amber-500/10 to-transparent border-amber-400/35 text-warning",
  },
  {
    icon: Trophy,
    label: "الثاني",
    className: "from-slate-300/20 via-slate-400/10 to-transparent border-slate-300/30 text-slate-200",
  },
  {
    icon: Medal,
    label: "الثالث",
    className: "from-orange-400/20 via-orange-500/10 to-transparent border-orange-400/30 text-warning",
  },
];

const formatNumber = (value?: number) => Number(value ?? 0).toLocaleString("ar-EG");

export function TopRequestedProviders({ data, isLoading = false }: TopRequestedProvidersProps) {
  const chartTheme = useChartTheme();
  const providers = data?.providers ?? [];
  const top3 = data?.top3 ?? providers.slice(0, 3);
  const maxOrders = Math.max(...providers.map((provider) => provider.totalOrders ?? 0), 1);
  const chartProviders = providers.slice(0, 12);

  const chartOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: chartTheme.colors.grid } },
        ...chartTheme.tooltip,
        formatter: (params: any[]) => {
          const point = params[0];
          const item = chartProviders[point.dataIndex];
          return `<div style="min-width:180px">
            <b style="display:block;color:${chartTheme.colors.text};margin-bottom:8px">${item?.businessName ?? "مزود"}</b>
            <div style="display:flex;justify-content:space-between;gap:18px;color:${chartTheme.colors.muted}">
              <span>إجمالي الطلبات</span><b style="color:${chartTheme.colors.primary}">${formatNumber(item?.totalOrders)}</b>
            </div>
            <div style="display:flex;justify-content:space-between;gap:18px;color:${chartTheme.colors.muted};margin-top:4px">
              <span>المكتملة</span><b style="color:${chartTheme.colors.success}">${formatNumber(item?.completedOrders)}</b>
            </div>
            <div style="display:flex;justify-content:space-between;gap:18px;color:${chartTheme.colors.muted};margin-top:4px">
              <span>الحصة</span><b style="color:${chartTheme.colors.warning}">${item?.demandShare ?? 0}%</b>
            </div>
          </div>`;
        },
      },
      grid: { top: 8, right: 12, left: 12, bottom: 28, containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { ...chartTheme.axisLabel, fontSize: 10 },
        splitLine: chartTheme.splitLine,
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: chartProviders.map((provider) => provider.businessName || "مزود").reverse(),
        axisLabel: { ...chartTheme.axisLabel, fontSize: 10, width: 90, overflow: "truncate" },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: chartProviders.map((provider, index) => ({
            value: provider.totalOrders ?? 0,
            itemStyle: {
              borderRadius: [0, 8, 8, 0],
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: chartTheme.colors.grid },
                  { offset: 1, color: index < 3 ? chartTheme.colors.warning : chartTheme.colors.primary },
                ],
              },
            },
          })).reverse(),
          barWidth: "52%",
          barMaxWidth: 26,
          label: { show: true, position: "right", color: chartTheme.colors.text, fontSize: 10, fontWeight: 700 },
        },
      ],
    }),
    [chartProviders, chartTheme],
  );

  if (isLoading) {
    return (
      <Card className="p-6 bg-card/70 border-border/40">
        <div className="h-48 animate-pulse rounded-xl bg-secondary/40" />
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card className="p-6 bg-card/70 border-border/40 text-sm text-muted-foreground">
        لا توجد طلبات مرتبطة بمزودين بعد.
      </Card>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black text-primary">
            <BarChart3 className="h-3.5 w-3.5" />
            ترتيب حسب الطلبات الفعلية
          </div>
          <h2 className="mt-3 text-base font-black tracking-tight text-foreground">المزودون الأكثر طلباً</h2>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Top 3 للقراءة السريعة وقائمة Top 100 لمقارنة الطلبات المكتملة والنشطة وحصة كل مزود.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="مزود" value={data?.summary?.totalProviders} />
          <Metric label="طلب" value={data?.summary?.totalRequestedOrders} />
          <Metric label="Top 3" value={data?.summary?.top3Orders} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {top3.map((provider, index) => {
          const style = medalStyles[index] ?? medalStyles[2];
          const Icon = style.icon;
          return (
            <Card
              key={provider._id}
              className={cn(
                "relative overflow-hidden border bg-gradient-to-br p-5 shadow-sm",
                style.className,
              )}
            >
              <div className="absolute -end-8 -top-8 h-28 w-28 rounded-full bg-current/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/55 px-2.5 py-1 text-xs font-black">
                    <Icon className="h-3.5 w-3.5" />
                    {style.label}
                  </div>
                  <h3 className="truncate text-base font-black text-foreground">{provider.businessName || "مزود بدون اسم"}</h3>
                  <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">{provider.city || provider.governorate || "غير محدد"}</p>
                </div>
                <div className="text-end">
                  <p className="text-3xl font-black tabular-nums text-foreground">{formatNumber(provider.totalOrders)}</p>
                  <p className="text-xs font-bold text-muted-foreground">طلب</p>
                </div>
              </div>
              <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
                <MiniStat label="مكتملة" value={provider.completedOrders} tone="emerald" />
                <MiniStat label="نشطة" value={provider.activeOrders} tone="blue" />
                <MiniStat label="الحصة" value={`${provider.demandShare ?? 0}%`} tone="amber" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <Card className="p-5 bg-card/70 backdrop-blur-xl border border-border/40">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-foreground">أعلى 12 مزود حسب الطلبات</h3>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">مخطط أفقي للقراءة السريعة داخل قائمة Top 100.</p>
            </div>
            <Award className="h-5 w-5 text-primary" />
          </div>
          <ReactECharts key={chartTheme.key} option={chartOption} style={{ height: 390 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
        </Card>

        <Card className="overflow-hidden bg-card/70 backdrop-blur-xl border border-border/40">
          <div className="border-b border-border/40 px-5 py-4">
            <h3 className="text-sm font-black text-foreground">Top 100</h3>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">مرتبة تنازلياً حسب عدد الطلبات.</p>
          </div>
          <div className="max-h-[445px] overflow-y-auto p-3">
            <div className="space-y-2">
              {providers.map((provider) => (
                <div key={provider._id} className="rounded-xl border border-border/35 bg-background/40 p-3 transition-colors hover:bg-secondary/35">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                        #{provider.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-foreground">{provider.businessName || "مزود بدون اسم"}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">{provider.city || provider.phone || "غير محدد"}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-black tabular-nums text-foreground">{formatNumber(provider.totalOrders)}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-xs font-bold text-warning">
                        <Star className="h-3 w-3 fill-current" />
                        {(provider.averageRating ?? 0).toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400"
                      style={{ width: `${Math.max(((provider.totalOrders ?? 0) / maxOrders) * 100, 3)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <PackageCheck className="h-3 w-3 text-success" />
                      {formatNumber(provider.completedOrders)} مكتملة
                    </span>
                    <span>{provider.completionRate ?? 0}% إكمال</span>
                    <span>{provider.demandShare ?? 0}% حصة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="min-w-20 rounded-xl border border-border/40 bg-card/70 px-3 py-2">
      <p className="text-sm font-black tabular-nums text-foreground">{formatNumber(value)}</p>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value?: number | string; tone: "emerald" | "blue" | "amber" }) {
  const toneClass = {
    emerald: "text-success bg-emerald-500/10 border-emerald-500/20",
    blue: "text-info bg-blue-500/10 border-blue-500/20",
    amber: "text-warning bg-amber-500/10 border-amber-500/20",
  }[tone];

  return (
    <div className={cn("rounded-xl border px-2 py-2", toneClass)}>
      <p className="text-sm font-black tabular-nums">{typeof value === "number" ? formatNumber(value) : value}</p>
      <p className="mt-0.5 text-xs font-bold opacity-80">{label}</p>
    </div>
  );
}
