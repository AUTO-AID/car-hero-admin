"use client";

import { LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ConfidenceTrendItem {
  date: string;
  avgConfidence: number;
}

interface AiConfidenceTrendProps {
  isLoading: boolean;
  confidenceTrend: ConfidenceTrendItem[];
}

export function AiConfidenceTrend({ isLoading, confidenceTrend }: AiConfidenceTrendProps) {
  const confidenceTrendOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 11, 28, 0.95)",
      borderColor: "rgba(143, 92, 177, 0.35)",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "inherit" },
      extraCssText: "box-shadow: 0 4px 20px rgba(0,0,0,0.5); border-radius: 8px;",
      formatter: (params: any[]) => {
        const [p] = params;
        return `<div class="space-y-1">
          <div class="font-bold text-slate-200">${p.axisValue}</div>
          <div class="flex items-center gap-2">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f43f5e"></span>
            <span class="text-slate-400">متوسط الثقة:</span>
            <span class="font-bold text-rose-400">${(p.value * 100).toFixed(1)}%</span>
          </div>
        </div>`;
      }
    },
    grid: { top: 20, right: 15, bottom: 40, left: 15, containLabel: true },
    xAxis: {
      type: "category",
      data: confidenceTrend.map((d) => d.date),
      axisLabel: { color: "#94a3b8", fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisTick: { show: false }
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 1,
      axisLabel: { 
        color: "#94a3b8", 
        fontSize: 11,
        formatter: (v: number) => `${(v * 100).toFixed(0)}%`
      },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } }
    },
    series: [
      {
        name: "Confidence",
        type: "line",
        data: confidenceTrend.map((d) => d.avgConfidence),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: "#f43f5e" },
        itemStyle: { color: "#f43f5e" },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 63, 94, 0.25)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <Card className="p-6 bg-card border-border/40 lg:col-span-2">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <LineChart className="w-5 h-5 text-rose-400" />
        مستوى ثقة الذكاء الاصطناعي (Confidence) مع الزمن
      </h3>
      <div className="h-[260px] w-full">
        {isLoading ? (
          <div className="h-full w-full bg-muted/10 animate-pulse rounded-xl flex items-center justify-center text-muted-foreground text-xs">
            جاري تحميل المخطط...
          </div>
        ) : confidenceTrend.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            لا توجد بيانات تاريخية كافية لعرض تغير الثقة
          </div>
        ) : (
          <ReactECharts option={confidenceTrendOption} style={{ height: "100%", width: "100%" }} />
        )}
      </div>
    </Card>
  );
}
