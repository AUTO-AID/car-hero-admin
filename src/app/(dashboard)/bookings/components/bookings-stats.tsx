"use client";

import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle, CalendarCheck, CalendarX } from "lucide-react";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(13, 9, 22, 0.97)",
  borderColor: "rgba(143,92,177,0.35)",
  borderWidth: 1,
  padding: [12, 16] as [number, number],
  textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
  extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px;",
};

const statusMeta: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  pending: { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "قيد الانتظار", icon: Clock },
  accepted: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "مؤكّد", icon: CheckCircle2 },
  provider_assigned: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "مُسند", icon: CheckCircle2 },
  provider_en_route: { color: "text-primary bg-primary/10 border-primary/20", label: "في الطريق", icon: AlertCircle },
  provider_arrived: { color: "text-primary bg-primary/10 border-primary/20", label: "وصل", icon: AlertCircle },
  in_progress: { color: "text-primary bg-primary/10 border-primary/20", label: "جاري", icon: AlertCircle },
  completed: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "مكتمل", icon: CalendarCheck },
  cancelled: { color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "ملغي", icon: CalendarX },
  rejected: { color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "مرفوض", icon: CalendarX },
};

const dayLabels = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
const categoryColors = ["#a57ed8", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];

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

function buildServiceBreakdown(bookings: any[], analytics?: any) {
  const apiData = analytics?.serviceBreakdown ?? [];
  if (apiData.length) {
    return apiData.map((item: any, index: number) => ({
      name: item?._id || "خدمة غير معروفة",
      value: item?.count || 0,
      itemStyle: { color: categoryColors[index % categoryColors.length], borderColor: "#0d0916", borderWidth: 3 },
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
      itemStyle: { color: categoryColors[index % categoryColors.length], borderColor: "#0d0916", borderWidth: 3 },
    }));
}

function buildTrendOption(rows: ReturnType<typeof buildTrend>) {
  return {
    backgroundColor: "transparent",
    tooltip: { ...TOOLTIP_STYLE, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(143,92,177,0.03)" } } },
    legend: {
      data: ["مكتمل", "قيد الانتظار", "ملغي"],
      textStyle: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
      top: 0,
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 6,
    },
    grid: { top: 35, right: 10, bottom: 20, left: 10, containLabel: true },
    xAxis: { type: "category", data: rows.map((d) => d.day), axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { color: "#64748b", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } }, axisLine: { show: false }, axisTick: { show: false } },
    series: [
      { name: "مكتمل", type: "bar", data: rows.map((d) => d.completed), itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] }, barWidth: "20%" },
      { name: "قيد الانتظار", type: "bar", data: rows.map((d) => d.pending), itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] }, barWidth: "20%" },
      { name: "ملغي", type: "line", data: rows.map((d) => d.cancelled), smooth: true, showSymbol: true, lineStyle: { color: "#ef4444", width: 2 }, itemStyle: { color: "#ef4444" } },
    ],
  };
}

function buildCategoriesOption(data: ReturnType<typeof buildServiceBreakdown>) {
  return {
    backgroundColor: "transparent",
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: "item",
      formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span><span style="color:#cbd5e1">${p.name}</span><b style="color:#fff;margin-right:6px">${Number(p.value || 0).toLocaleString("ar-EG")}</b><span style="color:#64748b;font-size:11px">(${p.percent}%)</span></div>`,
    },
    legend: { show: false },
    series: [{ type: "pie", radius: ["55%", "78%"], center: ["50%", "50%"], data: data.length ? data : [{ name: "لا توجد بيانات", value: 0, itemStyle: { color: "#334155", borderColor: "#0d0916", borderWidth: 3 } }], label: { show: false }, emphasis: { itemStyle: { shadowBlur: 16, shadowColor: "rgba(143,92,177,0.3)" }, scale: true, scaleSize: 6 } }],
  };
}

interface BookingsStatsProps {
  bookings: any[];
  analytics?: any;
  statusFilter: string;
  onFilterSelect: (key: string) => void;
}

export function BookingsStats({ bookings, analytics, statusFilter, onFilterSelect }: BookingsStatsProps) {
  const statusCounts = toStatusCounts(bookings, analytics);
  const trendRows = buildTrend(bookings, analytics);
  const categoryData = buildServiceBreakdown(bookings, analytics);

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
              <p className={`text-[10px] font-medium text-center leading-tight ${statusFilter === key ? "" : "text-muted-foreground"}`}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">معدل حجم الحجوزات الأسبوعي</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">تجميع مباشر من orders المحجوزة حسب يوم الإنشاء والحالة</p>
          </div>
          <div className="h-56 relative z-10">
            <ReactECharts option={buildTrendOption(trendRows)} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
          </div>
        </Card>

        <Card className="p-5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white text-sm tracking-tight">توزيع الحجوزات حسب الخدمة</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">الخدمات الأكثر طلباً في الحجوزات المجدولة</p>
          </div>
          <div className="h-32 relative z-10 flex items-center justify-center">
            <ReactECharts option={buildCategoriesOption(categoryData)} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
            {categoryData.slice(0, 4).map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors">
                <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: item.itemStyle.color, boxShadow: `0 0 6px ${item.itemStyle.color}50` }} />
                <span className="text-[9px] text-muted-foreground/80 flex-1 truncate">{item.name}</span>
                <span className="text-[10px] font-bold text-white tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
