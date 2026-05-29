"use client";

import { Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ServicePerfItem {
  serviceCategory: string;
  successRequests: number;
  failedRequests: number;
}

interface AiServicePerformanceProps {
  isLoading: boolean;
  servicePerformance: ServicePerfItem[];
}

export function AiServicePerformance({ isLoading, servicePerformance }: AiServicePerformanceProps) {
  const servicePerformanceOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
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
    grid: { top: 40, right: 15, bottom: 30, left: 15, containLabel: true },
    xAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8", fontSize: 11 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } }
    },
    yAxis: {
      type: "category",
      data: servicePerformance.map((s) => {
        const arabicMap: Record<string, string> = {
          towing: "سطحة / سحب",
          tire: "تبديل إطارات",
          battery: "شحن/تبديل بطارية",
          fuel: "توصيل وقود",
          locksmith: "فتح أقفال سيارات",
          mechanical: "صيانة ميكانيكية سريع",
          electrical: "صيانة كهربائية سريع"
        };
        return arabicMap[s.serviceCategory] || s.serviceCategory;
      }),
      axisLabel: { color: "#94a3b8", fontSize: 11 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisTick: { show: false }
    },
    series: [
      {
        name: "الطلبات الناجحة",
        type: "bar",
        stack: "total",
        data: servicePerformance.map((s) => s.successRequests),
        itemStyle: { color: "#8b5cf6", borderRadius: [0, 4, 4, 0] }
      },
      {
        name: "الطلبات الفاشلة",
        type: "bar",
        stack: "total",
        data: servicePerformance.map((s) => s.failedRequests),
        itemStyle: { color: "rgba(239, 68, 68, 0.7)", borderRadius: [0, 4, 4, 0] }
      }
    ]
  };

  return (
    <Card className="p-6 bg-card border-border/40">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-violet-400" />
        التوصيات والنجاح حسب نوع الخدمة
      </h3>
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="h-full w-full bg-muted/10 animate-pulse rounded-xl flex items-center justify-center text-muted-foreground text-xs">
            جاري تحميل المخطط...
          </div>
        ) : servicePerformance.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            لا توجد بيانات خدمات متوفرة
          </div>
        ) : (
          <ReactECharts option={servicePerformanceOption} style={{ height: "100%", width: "100%" }} />
        )}
      </div>
    </Card>
  );
}
