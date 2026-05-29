"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, MessageSquareWarning, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const buildRatingChartOption = (ratingDistribution: Array<{ range: string; count: number }>) => ({
  backgroundColor: "transparent",
  tooltip: {
    backgroundColor: "rgba(13, 9, 22, 0.97)",
    borderColor: "rgba(143,92,177,0.35)",
    borderWidth: 1,
    padding: [12, 16] as [number, number],
    textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
    extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px;",
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: any[]) => {
      const p = params[0];
      return `<div style="display:flex; flex-direction:column; gap:6px;">
        <div style="font-weight:700; color:#f5f5f7; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;">نطاق التقييم: ${p.axisValue}</div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:20px;">
          <span style="display:flex; align-items:center; gap:6px; color:#94a3b8">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b; box-shadow:0 0 8px #f59e0b"></span>عدد المزودين
          </span>
          <b style="color:#fcd34d; font-variant-numeric:tabular-nums">${p.value.toLocaleString("ar-EG")} مزود</b>
        </div>
      </div>`;
    },
  },
  grid: { top: 30, right: 10, bottom: 30, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: ratingDistribution.map(d => d.range),
    axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: { type: "value", axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" }, splitLine: { lineStyle: { color: "rgba(143,92,177,0.07)", type: "dashed" } }, axisLine: { show: false }, axisTick: { show: false } },
  series: [{
    type: "bar",
    data: ratingDistribution.map((d, i) => ({
      value: d.count,
      itemStyle: {
        color: {
          type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: ["#ef4444","#ef4444","#f97316","#f97316","#eab308","#eab308","#22c55e","#22c55e","#15803d","#15803d"][i] },
            { offset: 1, color: ["#ef4444","#ef4444","#f97316","#f97316","#eab308","#eab308","#22c55e","#22c55e","#15803d","#15803d"][i] + "50" }
          ],
        },
        borderRadius: [6, 6, 0, 0],
      },
    })),
    barWidth: "50%",
    barMaxWidth: 45,
    label: { show: true, position: "top", color: "#94a3b8", fontSize: 9, fontWeight: "bold" },
    emphasis: { itemStyle: { shadowBlur: 14, shadowColor: "rgba(0,0,0,0.4)" } },
  }],
});

interface ReviewsStatsProps {
  total: number;
  reportedCount: number;
  avgRating: number;
  ratingDistribution?: Array<{ range: string; count: number }>;
  isLoading?: boolean;
}

export default function ReviewsStats({ total, reportedCount, avgRating, ratingDistribution = [], isLoading = false }: ReviewsStatsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ratingChartOption = buildRatingChartOption(ratingDistribution);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Overview metric cards */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="p-5 bg-card border-border/40 flex items-center gap-4 card-hover relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-white tabular-nums">{total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">إجمالي التقييمات</p>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border/40 flex items-center gap-4 card-hover relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-white tabular-nums">{reportedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">تقييمات مُبلَّغ عنها</p>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border/40 flex items-center gap-4 card-hover relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 animate-pulse-glow">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-white tabular-nums">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">متوسط التقييم العام</p>
          </div>
        </Card>
      </div>

      {/* Right column: ECharts Rating distribution */}
      <Card className="lg:col-span-2 p-5 bg-card border-border/40 flex flex-col justify-between group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-2 relative z-10">
          <h3 className="font-semibold text-white text-sm tracking-tight">توزيع تقييمات المزودين</h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Histogram — تدرج ألوان من الأحمر للأخضر</p>
        </div>
        <div className="relative z-10 h-[190px] w-full">
          {isMounted && !isLoading && (
            <ReactECharts 
              option={ratingChartOption} 
              style={{ height: "100%", width: "100%" }} 
              opts={{ renderer: "canvas" }} 
              notMerge 
              lazyUpdate 
            />
          )}
        </div>
      </Card>
    </div>
  );
}
