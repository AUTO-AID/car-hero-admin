"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* ─── Shared ECharts Theme ─── */
const TOOLTIP_STYLE = {
  backgroundColor: "rgba(13, 9, 22, 0.97)",
  borderColor: "rgba(143,92,177,0.35)",
  borderWidth: 1,
  padding: [12, 16] as [number, number],
  textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
  extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px;",
};

const axLabel = { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" };
const splitLn = { lineStyle: { color: "rgba(143,92,177,0.07)", type: "dashed" as const } };

const CHART_COLORS = [
  "#a57ed8","#3b82f6","#10b981","#f59e0b","#ef4444",
  "#06b6d4","#ec4899","#84cc16","#6366f1","#f97316",
  "#14b8a6","#8b5cf6",
];

const makeGradientBar = (color1: string, color2 = color1 + "80") => ({
  type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [{ offset: 0, color: color1 }, { offset: 1, color: color2 }],
});

interface ServicesStatsProps {
  categoryData?: Array<{ name: string; count: number; pct?: number }>;
  emergencyByCategory?: Array<{ name: string; emergency: number; nonEmergency: number }>;
  isLoading?: boolean;
}

export function ServicesStats({ categoryData = [], emergencyByCategory = [], isLoading = false }: ServicesStatsProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (isLoading) {
    return <Card className="p-5 bg-card border-border/40 text-sm text-muted-foreground">جاري تحميل إحصائيات الخدمات من الخادم...</Card>;
  }

  const categoryChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: "axis",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(143,92,177,0.04)" } },
      formatter: (params: any[]) => {
        const p = params[0];
        return `<div style="display:flex; flex-direction:column; gap:6px;">
          <div style="font-weight:700; color:#f5f5f7; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;">${p.axisValue}</div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:20px;">
            <span style="display:flex; align-items:center; gap:6px; color:#94a3b8">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#a57ed8; box-shadow:0 0 8px #a57ed8"></span>عدد المزودين
            </span>
            <b style="color:#c9a7e3; font-variant-numeric:tabular-nums">${p.value.toLocaleString("ar-EG")} مزود</b>
          </div>
        </div>`;
      },
    },
    grid: { top: 20, right: 10, bottom: 85, left: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: categoryData.map(d => d.name),
      axisLabel: { ...axLabel, rotate: 35, margin: 14, align: "right" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      axisTick: { show: false },
    },
    yAxis: { type: "value", axisLabel: axLabel, splitLine: splitLn, axisLine: { show: false }, axisTick: { show: false } },
    dataZoom: [
      {
        type: "slider",
        show: categoryData.length > 5,
        start: 0,
        end: 100,
        height: 18,
        bottom: 10,
        borderColor: "rgba(143,92,177,0.06)",
        backgroundColor: "rgba(255,255,255,0.01)",
        fillerColor: "rgba(143,92,177,0.1)",
        textStyle: { color: "#64748b", fontSize: 9, fontFamily: "IBM Plex Sans Arabic" },
        handleSize: "75%",
        handleStyle: { color: "#a57ed8", borderWidth: 0, shadowBlur: 4, shadowColor: "rgba(0,0,0,0.5)" },
      }
    ],
    series: [{
      type: "bar",
      data: categoryData.map((d, i) => ({
        value: d.count,
        itemStyle: {
          color: makeGradientBar(CHART_COLORS[i % CHART_COLORS.length]),
          borderRadius: [6, 6, 0, 0],
        },
      })),
      barWidth: "48%",
      barMaxWidth: 35,
      label: { show: true, position: "top", color: "#94a3b8", fontSize: 10, fontWeight: "bold" },
      emphasis: { itemStyle: { shadowBlur: 16, shadowColor: "rgba(143,92,177,0.4)" } },
    }],
  };

  const emgCatChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        const [emg, normal] = params;
        const total = (emg?.value || 0) + (normal?.value || 0);
        return `<div style="min-width:145px">
          <b style="color:#f5f5f7;display:block;margin-bottom:8px">${emg?.axisValue}</b>
          <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px;color:#94a3b8">
            <span><span style="width:8px;height:8px;border-radius:2px;background:#ef4444;display:inline-block;margin-left:5px"></span>طوارئ</span>
            <b style="color:#fca5a5">${(emg?.value || 0).toLocaleString("ar-EG")}</b>
          </div>
          <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px;color:#94a3b8">
            <span><span style="width:8px;height:8px;border-radius:2px;background:#3b82f6;display:inline-block;margin-left:5px"></span>عادي</span>
            <b style="color:#93c5fd">${(normal?.value || 0).toLocaleString("ar-EG")}</b>
          </div>
          <div style="display:flex;justify-content:space-between;gap:16px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;margin-top:6px;color:#64748b">
            <span>المجموع</span>
            <b style="color:#f5f5f7">${total.toLocaleString("ar-EG")}</b>
          </div>
        </div>`;
      },
    },
    legend: {
      data: ["طوارئ", "عادي"],
      textStyle: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
      top: 0, icon: "roundRect", itemWidth: 10, itemHeight: 6,
    },
    grid: { top: 30, right: 10, bottom: 65, left: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: emergencyByCategory.map(d => d.name),
      axisLabel: { ...axLabel, rotate: 30, margin: 14, align: "right" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      axisTick: { show: false },
    },
    yAxis: { type: "value", axisLabel: axLabel, splitLine: splitLn, axisLine: { show: false }, axisTick: { show: false } },
    dataZoom: [
      {
        type: "slider",
        show: emergencyByCategory.length > 5,
        start: 0,
        end: 100,
        height: 18,
        bottom: 10,
        borderColor: "rgba(143,92,177,0.06)",
        backgroundColor: "rgba(255,255,255,0.01)",
        fillerColor: "rgba(143,92,177,0.1)",
        textStyle: { color: "#64748b", fontSize: 9, fontFamily: "IBM Plex Sans Arabic" },
        handleSize: "75%",
        handleStyle: { color: "#a57ed8", borderWidth: 0, shadowBlur: 4, shadowColor: "rgba(0,0,0,0.5)" },
      }
    ],
    series: [
      {
        name: "طوارئ",
        type: "bar",
        stack: "s",
        data: emergencyByCategory.map(d => d.emergency),
        itemStyle: { color: makeGradientBar("#ef4444", "rgba(239,68,68,0.5)") },
        barWidth: "48%", barMaxWidth: 35,
      },
      {
        name: "عادي",
        type: "bar",
        stack: "s",
        data: emergencyByCategory.map(d => d.nonEmergency),
        itemStyle: { color: makeGradientBar("#3b82f6", "rgba(59,130,246,0.5)"), borderRadius: [4, 4, 0, 0] },
        barWidth: "48%", barMaxWidth: 35,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-5 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-4 relative z-10">
          <h3 className="font-semibold text-white text-sm tracking-tight">المزودين حسب التصنيف الخدمي</h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">12 تصنيف نشط — Gradient Bar</p>
        </div>
        <div className="relative z-10">
          {isMounted && <ReactECharts option={categoryChartOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
        </div>
      </Card>

      <Card className="p-5 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-4 relative z-10">
          <h3 className="font-semibold text-white text-sm tracking-tight">الطوارئ مقابل العادي حسب التصنيف</h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Stacked Bar — محسّن</p>
        </div>
        <div className="relative z-10">
          {isMounted && <ReactECharts option={emgCatChartOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
        </div>
      </Card>
    </div>
  );
}
