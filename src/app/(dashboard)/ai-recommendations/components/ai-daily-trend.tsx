"use client";

import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface DailyTrendItem {
  date: string;
  success: number;
  failed: number;
}

interface AiDailyTrendProps {
  isLoading: boolean;
  dailyTrend: DailyTrendItem[];
}

export function AiDailyTrend({ isLoading, dailyTrend }: AiDailyTrendProps) {
  const dailyTrendOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 11, 28, 0.95)",
      borderColor: "rgba(143, 92, 177, 0.35)",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "inherit" },
      extraCssText: "box-shadow: 0 4px 20px rgba(0,0,0,0.5); border-radius: 8px;"
    },
    legend: {
      data: ["الطلبات الناجحة", "الطلبات الفاشلة"],
      textStyle: { color: "#94a3b8" },
      top: 0
    },
    grid: { top: 40, right: 15, bottom: 40, left: 15, containLabel: true },
    xAxis: {
      type: "category",
      data: dailyTrend.map((d) => d.date),
      axisLabel: { color: "#94a3b8", fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisTick: { show: false }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8", fontSize: 11 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } }
    },
    series: [
      {
        name: "الطلبات الناجحة",
        type: "line",
        smooth: true,
        data: dailyTrend.map((d) => d.success),
        lineStyle: { width: 3, color: "#10b981" },
        itemStyle: { color: "#10b981" }
      },
      {
        name: "الطلبات الفاشلة",
        type: "line",
        smooth: true,
        data: dailyTrend.map((d) => d.failed),
        lineStyle: { width: 3, color: "#ef4444" },
        itemStyle: { color: "#ef4444" }
      }
    ]
  };

  return (
    <Card className="p-6 bg-card border-border/40">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        معدل الطلبات وحالات النجاح والفشل اليومية (آخر 30 يوم)
      </h3>
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="h-full w-full bg-muted/10 animate-pulse rounded-xl flex items-center justify-center text-muted-foreground text-xs">
            جاري تحميل المخطط...
          </div>
        ) : dailyTrend.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            لا توجد بيانات طلبات يومية كافية
          </div>
        ) : (
          <ReactECharts option={dailyTrendOption} style={{ height: "100%", width: "100%" }} />
        )}
      </div>
    </Card>
  );
}
