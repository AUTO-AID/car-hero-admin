"use client";

import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface CityPerfItem {
  city: string;
  totalRequests: number;
}

interface AiCityPerformanceProps {
  isLoading: boolean;
  cityPerformance: CityPerfItem[];
}

export function AiCityPerformance({ isLoading, cityPerformance }: AiCityPerformanceProps) {
  const cityPerformanceOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 11, 28, 0.95)",
      borderColor: "rgba(143, 92, 177, 0.35)",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "inherit" },
      extraCssText: "box-shadow: 0 4px 20px rgba(0,0,0,0.5); border-radius: 8px;",
      formatter: "{b}: <b>{c} طلب</b> ({d}%)"
    },
    series: [
      {
        name: "المدن",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#0f0b1c",
          borderWidth: 2
        },
        label: {
          show: true,
          color: "#94a3b8",
          fontSize: 11
        },
        data: cityPerformance.map((c) => ({
          value: c.totalRequests,
          name: c.city === "Damascus" ? "دمشق" : c.city === "Aleppo" ? "حلب" : c.city === "Homs" ? "حمص" : c.city === "Lattakia" ? "اللاذقية" : c.city === "Tartous" ? "طرطوس" : c.city
        })),
        color: ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"]
      }
    ]
  };

  return (
    <Card className="p-6 bg-card border-border/40">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-pink-400" />
        توزيع طلبات التوصية حسب المدن والمحافظات
      </h3>
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="h-full w-full bg-muted/10 animate-pulse rounded-xl flex items-center justify-center text-muted-foreground text-xs">
            جاري تحميل المخطط...
          </div>
        ) : cityPerformance.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
            لا توجد بيانات مدن متوفرة
          </div>
        ) : (
          <ReactECharts option={cityPerformanceOption} style={{ height: "100%", width: "100%" }} />
        )}
      </div>
    </Card>
  );
}
