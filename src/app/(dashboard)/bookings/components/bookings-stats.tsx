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
  pending:     { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "قيد الانتظار", icon: Clock },
  confirmed:   { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "مؤكّد", icon: CheckCircle2 },
  in_progress: { color: "text-primary bg-primary/10 border-primary/20", label: "جاري", icon: AlertCircle },
  completed:   { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "مكتمل", icon: CalendarCheck },
  cancelled:   { color: "text-rose-400 bg-rose-400/10 border-rose-400/20", label: "ملغي", icon: CalendarX },
};

const bookingTrendOption = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE,
    trigger: "axis",
    axisPointer: { type: "shadow", shadowStyle: { color: "rgba(143,92,177,0.03)" } },
    formatter: (params: any[]) => {
      const [completed, pending, cancelled] = params;
      return `<div style="min-width:145px">
        <b style="color:#f5f5f7;display:block;margin-bottom:8px">${completed?.axisValue}</b>
        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px;color:#94a3b8">
          <span><span style="width:8px;height:8px;border-radius:2px;background:#10b981;display:inline-block;margin-left:5px"></span>مكتمل</span>
          <b style="color:#6ee7b7">${(completed?.value || 0).toLocaleString("ar-EG")} حجز</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px;color:#94a3b8">
          <span><span style="width:8px;height:8px;border-radius:2px;background:#f59e0b;display:inline-block;margin-left:5px"></span>معلق</span>
          <b style="color:#fcd34d">${(pending?.value || 0).toLocaleString("ar-EG")} حجز</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px;color:#94a3b8">
          <span><span style="width:8px;height:8px;border-radius:2px;background:#ef4444;display:inline-block;margin-left:5px"></span>ملغي</span>
          <b style="color:#fca5a5">${(cancelled?.value || 0).toLocaleString("ar-EG")} حجز</b>
        </div>
      </div>`;
    },
  },
  legend: {
    data: ["مكتمل", "قيد الانتظار", "ملغي"],
    textStyle: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    top: 0,
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 6,
  },
  grid: { top: 35, right: 10, bottom: 20, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"],
    axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: "#64748b", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      name: "مكتمل",
      type: "bar",
      data: [12, 19, 15, 8, 22, 14, 30],
      itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#10b981" }, { offset: 1, color: "rgba(16,185,129,0.2)" }] }, borderRadius: [4, 4, 0, 0] },
      barWidth: "20%",
    },
    {
      name: "قيد الانتظار",
      type: "bar",
      data: [5, 8, 3, 10, 6, 12, 4],
      itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#f59e0b" }, { offset: 1, color: "rgba(245,158,11,0.2)" }] }, borderRadius: [4, 4, 0, 0] },
      barWidth: "20%",
    },
    {
      name: "ملغي",
      type: "line",
      data: [2, 4, 1, 3, 2, 5, 1],
      smooth: true,
      showSymbol: false,
      lineStyle: { color: "#ef4444", width: 2 },
      itemStyle: { color: "#ef4444" },
    },
  ],
};

const bookingCategoriesOption = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE,
    trigger: "item",
    formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 8px ${p.color}60"></span>
      <span style="color:#cbd5e1">${p.name}</span>
      <b style="color:#fff;margin-right:6px">${p.value.toLocaleString("ar-EG")}</b>
      <span style="color:#64748b;font-size:11px">(${p.percent}%)</span>
    </div>`,
  },
  legend: { show: false },
  series: [
    {
      type: "pie",
      radius: ["55%", "78%"],
      center: ["50%", "50%"],
      data: [
        { name: "غسيل سيارة", value: 35, itemStyle: { color: "#a57ed8", borderColor: "#0d0916", borderWidth: 3 } },
        { name: "تغيير زيت", value: 24, itemStyle: { color: "#3b82f6", borderColor: "#0d0916", borderWidth: 3 } },
        { name: "فحص شامل", value: 18, itemStyle: { color: "#10b981", borderColor: "#0d0916", borderWidth: 3 } },
        { name: "إطارات", value: 15, itemStyle: { color: "#f59e0b", borderColor: "#0d0916", borderWidth: 3 } },
        { name: "بطارية", value: 8, itemStyle: { color: "#ef4444", borderColor: "#0d0916", borderWidth: 3 } },
      ],
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 16, shadowColor: "rgba(143,92,177,0.3)" }, scale: true, scaleSize: 6 },
    },
  ],
};

interface BookingsStatsProps {
  bookings: any[];
  statusFilter: string;
  onFilterSelect: (key: string) => void;
}

export function BookingsStats({ bookings, statusFilter, onFilterSelect }: BookingsStatsProps) {
  const stats = Object.entries(statusMeta).map(([key, meta]) => ({
    key, ...meta,
    count: bookings.filter((b: any) => b.status === key).length,
  }));

  return (
    <div className="space-y-5">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
        {stats.map(({ key, color, label, icon: Icon, count }) => (
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">معدل حجم الحجوزات الأسبوعي</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">الحجوزات المكتملة والمعلقة والملغاة خلال أيام الأسبوع</p>
          </div>
          <div className="h-56 relative z-10">
            <ReactECharts option={bookingTrendOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
          </div>
        </Card>
        
        <Card className="p-5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-bold text-white text-sm tracking-tight">توزيع الحجوزات حسب الخدمة</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">الفئات الأكثر طلباً في المنصة</p>
          </div>
          <div className="h-32 relative z-10 flex items-center justify-center">
            <ReactECharts option={bookingCategoriesOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
            {[
              { label: "غسيل سيارة", color: "#a57ed8", val: 35 },
              { label: "تغيير زيت", color: "#3b82f6", val: 24 },
              { label: "فحص شامل", color: "#10b981", val: 18 },
              { label: "إطارات", color: "#f59e0b", val: 15 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors">
                <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}50` }} />
                <span className="text-[9px] text-muted-foreground/80 flex-1 truncate">{item.label}</span>
                <span className="text-[10px] font-bold text-white tabular-nums">{item.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
