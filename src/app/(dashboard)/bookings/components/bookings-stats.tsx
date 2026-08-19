"use client";

import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle, CalendarCheck, CalendarX } from "lucide-react";
import dynamic from "next/dynamic";
import { useChartTheme } from "@/application/hooks/use-chart-theme";

type ChartTheme = ReturnType<typeof useChartTheme>;

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


const statusMeta: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  pending: { color: "text-warning bg-amber-400/10 border-amber-400/20", label: "قيد الانتظار", icon: Clock },
  accepted: { color: "text-info bg-blue-400/10 border-blue-400/20", label: "مؤكّد", icon: CheckCircle2 },
  provider_assigned: { color: "text-info bg-blue-400/10 border-blue-400/20", label: "مُسند", icon: CheckCircle2 },
  provider_en_route: { color: "text-primary bg-primary/10 border-primary/20", label: "في الطريق", icon: AlertCircle },
  provider_arrived: { color: "text-primary bg-primary/10 border-primary/20", label: "وصل", icon: AlertCircle },
  in_progress: { color: "text-primary bg-primary/10 border-primary/20", label: "جاري", icon: AlertCircle },
  completed: { color: "text-success bg-emerald-400/10 border-emerald-400/20", label: "مكتمل", icon: CalendarCheck },
  cancelled: { color: "text-danger bg-rose-400/10 border-rose-400/20", label: "ملغي", icon: CalendarX },
  rejected: { color: "text-danger bg-rose-400/10 border-rose-400/20", label: "مرفوض", icon: CalendarX },
};

const dayLabels = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

function toStatusCounts(bookings: any[], analytics?: any) {
  const counts = { ...(analytics?.statusCounts ?? {}) };
  if (Object.keys(counts).length) return counts;

  return bookings.reduce((acc, booking) => {
    const status = booking?.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function buildTrend(bookings: any[], analytics?: any) {
  const rows = Array.from({ length: 7 }, (_, index) => ({
    day: dayLabels[index],
    completed: 0,
    pending: 0,
    cancelled: 0,
  }));

  const trend = analytics?.weeklyTrend ?? [];
  if (trend.length) {
    trend.forEach((item: any) => {
      const index = Number(item?._id?.isoDayOfWeek ?? 1) - 1;
      const status = item?._id?.status;
      const target = rows[index];
      if (!target) return;
      if (status === "completed") target.completed += item.count || 0;
      else if (status === "cancelled" || status === "rejected") target.cancelled += item.count || 0;
      else target.pending += item.count || 0;
    });
    return rows;
  }

  bookings.forEach((booking) => {
    const date = new Date(booking?.createdAt ?? booking?.scheduledAt ?? booking?.scheduleTime ?? Date.now());
    const index = Number.isNaN(date.getTime()) ? 0 : (date.getDay() + 6) % 7;
    const status = booking?.status;
    if (status === "completed") rows[index].completed += 1;
    else if (status === "cancelled" || status === "rejected") rows[index].cancelled += 1;
    else rows[index].pending += 1;
  });

  return rows;
}

function buildServiceBreakdown(bookings: any[], analytics: any, t: ChartTheme) {
  const apiData = analytics?.serviceBreakdown ?? [];
  if (apiData.length) {
    return apiData.map((item: any, index: number) => ({
      name: item?._id || "خدمة غير معروفة",
      value: item?.count || 0,
      itemStyle: { color: t.colors.series[index % t.colors.series.length], borderColor: t.colors.cardBorder, borderWidth: 3 },
    }));
  }

  const grouped = bookings.reduce((acc, booking) => {
    const name = booking?.service?.nameAr || booking?.service?.name || booking?.serviceName || booking?.metadata?.serviceName || "خدمة غير معروفة";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (Object.entries(grouped) as Array<[string, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], index) => ({
      name,
      value,
      itemStyle: { color: t.colors.series[index % t.colors.series.length], borderColor: t.colors.cardBorder, borderWidth: 3 },
    }));
}

function buildTrendOption(rows: ReturnType<typeof buildTrend>, t: ChartTheme) {
  return {
    backgroundColor: "transparent",
    tooltip: { ...t.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: t.colors.grid } } },
    legend: {
      data: ["مكتمل", "قيد الانتظار", "ملغي"],
      textStyle: { color: t.colors.muted, fontSize: 10 },
      top: 0,
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 6,
    },
    grid: { top: 35, right: 10, bottom: 20, left: 10, containLabel: true },
    xAxis: { type: "category", data: rows.map((d) => d.day), axisLabel: { ...t.axisLabel, fontSize: 10 }, axisLine: { lineStyle: { color: t.colors.grid } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { ...t.axisLabel, fontSize: 10 }, splitLine: t.splitLine, axisLine: { show: false }, axisTick: { show: false } },
    series: [
      { name: "مكتمل", type: "bar", data: rows.map((d) => d.completed), itemStyle: { color: t.colors.success, borderRadius: [4, 4, 0, 0] }, barWidth: "20%" },
      { name: "قيد الانتظار", type: "bar", data: rows.map((d) => d.pending), itemStyle: { color: t.colors.warning, borderRadius: [4, 4, 0, 0] }, barWidth: "20%" },
      { name: "ملغي", type: "line", data: rows.map((d) => d.cancelled), smooth: true, showSymbol: true, lineStyle: { color: t.colors.danger, width: 2 }, itemStyle: { color: t.colors.danger } },
    ],
  };
}

function buildCategoriesOption(data: ReturnType<typeof buildServiceBreakdown>, t: ChartTheme) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      ...t.tooltip,
      trigger: "item",
      formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span><span style="color:${t.colors.text}">${p.name}</span><b style="color:${t.colors.text};margin-right:6px">${Number(p.value || 0).toLocaleString("ar-EG")}</b><span style="color:${t.colors.muted};font-size:11px">(${p.percent}%)</span></div>`,
    },
    legend: { show: false },
    series: [{ type: "pie", radius: ["55%", "78%"], center: ["50%", "50%"], data: data.length ? data : [{ name: "لا توجد بيانات", value: 0, itemStyle: { color: t.colors.grid, borderColor: t.colors.cardBorder, borderWidth: 3 } }], label: { show: false }, emphasis: { itemStyle: { shadowBlur: 16, shadowColor: t.colors.grid }, scale: true, scaleSize: 6 } }],
  };
}

interface BookingsStatsProps {
  bookings: any[];
  analytics?: any;
  statusFilter: string;
  onFilterSelect: (key: string) => void;
}

export function BookingsStats({ bookings, analytics, statusFilter, onFilterSelect }: BookingsStatsProps) {
  const chartTheme = useChartTheme();
  const statusCounts = toStatusCounts(bookings, analytics);
  const trendRows = buildTrend(bookings, analytics);
  const categoryData = buildServiceBreakdown(bookings, analytics, chartTheme);

  const stats = Object.entries(statusMeta).map(([key, meta]) => ({
    key,
    ...meta,
    count: statusCounts[key] || 0,
  })).filter((item) => item.count > 0 || ["pending", "accepted", "in_progress", "completed", "cancelled"].includes(item.key));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
        {stats.slice(0, 5).map(({ key, color, label, icon: Icon, count }) => (
          <Card
            key={key}
            className={`p-4 bg-card border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              statusFilter === key ? `${color}` : "border-border/40 hover:border-border/80"
            }`}
            onClick={() => onFilterSelect(statusFilter === key ? "all" : key)}
          >
            <div className="flex flex-col items-center gap-1.5">
              <Icon className={`w-4 h-4 ${statusFilter === key ? "" : color.split(" ")[0]}`} />
              <p className={`text-2xl font-bold tabular-nums ${statusFilter === key ? "" : color.split(" ")[0]}`}>{count}</p>
              <p className={`text-xs font-semibold text-center leading-tight ${statusFilter === key ? "" : "text-muted-foreground"}`}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">معدل حجم الحجوزات الأسبوعي</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">تجميع مباشر من orders المحجوزة حسب يوم الإنشاء والحالة</p>
          </div>
          <div className="h-56 relative z-10">
            <ReactECharts key={chartTheme.key} option={buildTrendOption(trendRows, chartTheme)} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
          </div>
        </Card>

        <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white text-sm tracking-tight">توزيع الحجوزات حسب الخدمة</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">الخدمات الأكثر طلباً في الحجوزات المجدولة</p>
          </div>
          <div className="h-32 relative z-10 flex items-center justify-center">
            <ReactECharts key={chartTheme.key} option={buildCategoriesOption(categoryData, chartTheme)} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
            {categoryData.slice(0, 4).map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors">
                <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: item.itemStyle.color, boxShadow: `0 0 6px ${item.itemStyle.color}50` }} />
                <span className="text-xs text-muted-foreground/80 flex-1 truncate">{item.name}</span>
                <span className="text-xs font-bold text-white tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
