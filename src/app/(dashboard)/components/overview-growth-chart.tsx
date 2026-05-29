"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const AR_MONTHS = [
  "", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

interface OverviewGrowthChartProps {
  growthData: any[] | undefined;
  totalProviders: number;
}

export function OverviewGrowthChart({ growthData, totalProviders }: OverviewGrowthChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const rawGrowth = (growthData ?? []) as any[];
  const growthMonths = rawGrowth.map((d: any) => `${AR_MONTHS[d._id?.month] || d._id?.month} ${d._id?.year}`);
  const growthValues = rawGrowth.map((d: any) => d.count);

  const cumulativeValues: number[] = [];
  growthValues.reduce((acc: number, val: number) => {
    cumulativeValues.push(acc + val);
    return acc + val;
  }, 0);

  const growthChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(13, 9, 22, 0.96)",
      borderColor: "rgba(143, 92, 177, 0.35)",
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
      extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.6); border-radius: 12px;",
      formatter: (params: any[]) => {
        const [cum, monthly] = params;
        return `<div style="display:flex; flex-direction:column; gap:8px;">
          <div style="font-weight:700; color:#f5f5f7; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;">${cum.axisValue}</div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:24px;">
            <span style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#a57ed8; box-shadow:0 0 8px #a57ed8"></span>
              <span style="color:#94a3b8">الإجمالي التراكمي</span>
            </span>
            <b style="color:#c9a7e3; font-variant-numeric:tabular-nums">${cum.value.toLocaleString("ar-EG")} مزود</b>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:24px;">
            <span style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#34d399; box-shadow:0 0 8px #34d399"></span>
              <span style="color:#94a3b8">جديد هذا الشهر</span>
            </span>
            <b style="color:#6ee7b7; font-variant-numeric:tabular-nums">${(monthly?.value ?? 0).toLocaleString("ar-EG")} مزود</b>
          </div>
        </div>`;
      },
    },
    grid: { top: 30, right: 10, bottom: 50, left: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: growthMonths,
      axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic", margin: 12, rotate: growthMonths.length > 8 ? 25 : 0 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          color: "#64748b", fontSize: 10, fontFamily: "Inter",
        },
        splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } },
        axisLine: { show: false },
      },
      {
        type: "value",
        show: false,
      }
    ],
    dataZoom: [
      {
        type: "slider",
        show: growthMonths.length > 6,
        start: Math.max(0, 100 - (100 * 8 / Math.max(1, growthMonths.length))),
        end: 100,
        height: 18,
        bottom: 5,
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
        name: "الإجمالي التراكمي",
        type: "line",
        data: cumulativeValues,
        smooth: 0.45,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: "#a57ed8", width: 3, shadowColor: "rgba(165,126,216,0.35)", shadowBlur: 12, shadowOffsetY: 6 },
        itemStyle: { color: "#a57ed8", borderColor: "#170f24", borderWidth: 2 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(165,126,216,0.25)" },
              { offset: 0.8, color: "rgba(165,126,216,0.02)" },
              { offset: 1, color: "rgba(165,126,216,0)" },
            ],
          },
        },
      },
      {
        name: "جديد هذا الشهر",
        type: "bar",
        data: growthValues,
        barWidth: "22%",
        itemStyle: {
          color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(52,211,153,0.45)" },
              { offset: 1, color: "rgba(52,211,153,0.05)" },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        yAxisIndex: 1,
      },
    ],
  };

  return (
    <Card className="xl:col-span-2 p-6 bg-card/60 backdrop-blur-xl border-border/40 shadow-xl shadow-black/20 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
            نمو مزودي الخدمة
          </h3>
          <p className="text-[12px] text-muted-foreground mt-1">عدد المزودين المسجلين شهرياً — بيانات حقيقية</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 border border-border/50 rounded-lg p-1.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{totalProviders} مزود إجمالي</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 -mx-2">
        {isMounted && growthMonths.length > 0 ? (
          <ReactECharts option={growthChartOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
        ) : isMounted ? (
          <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">جارٍ تحميل البيانات...</div>
        ) : null}
      </div>
    </Card>
  );
}
