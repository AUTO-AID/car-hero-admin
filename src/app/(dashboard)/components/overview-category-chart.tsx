"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface OverviewCategoryChartProps {
  serviceData: any[] | undefined;
}

export function OverviewCategoryChart({ serviceData }: OverviewCategoryChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const rawServices = (serviceData ?? []) as any[];
  const topSvcs = rawServices.slice(0, 8);

  const topServicesOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(13, 9, 22, 0.96)",
      borderColor: "rgba(143, 92, 177, 0.35)",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
      extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.6); border-radius: 12px;",
      axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.02)" } }
    },
    grid: { top: 10, right: 45, bottom: 10, left: 10, containLabel: true },
    xAxis: { type: "value", show: false },
    yAxis: { 
      type: "category", 
      data: topSvcs.map((s: any) => s._id || "غير محدد").reverse(), 
      axisLabel: { color: "#cbd5e1", fontSize: 11, fontFamily: "IBM Plex Sans Arabic", margin: 16 }, 
      axisLine: { show: false }, 
      axisTick: { show: false } 
    },
    series: [{
      type: "bar",
      data: topSvcs.map((s: any) => s.count).reverse(),
      barWidth: 10,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: (params: any) => {
          const colors = [
            ["#8f5cb1", "#a57ed8"],
            ["#6a1b9a", "#8e24aa"],
            ["#7b1fa2", "#ab47bc"],
            ["#512da8", "#7e57c2"],
            ["#4527a0", "#673ab7"]
          ];
          const colorPair = colors[params.dataIndex % colors.length];
          return {
            type: "linear", x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [{ offset: 0, color: colorPair[0] }, { offset: 1, color: colorPair[1] }]
          };
        },
      },
      label: { 
        show: true, 
        position: "right", 
        color: "#94a3b8", 
        fontSize: 10,
        fontFamily: "Inter",
        fontWeight: "bold",
        offset: [6, 0]
      },
    }],
  };

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/40 shadow-xl shadow-black/20 flex flex-col">
      <div className="mb-6">
        <h3 className="font-bold text-white text-base tracking-tight">فئات الخدمة الأكثر طلباً</h3>
        <p className="text-[12px] text-muted-foreground mt-1">توزيع المزودين والخدمات — بيانات حقيقية</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {topSvcs.length > 0 ? (
          <ReactECharts option={topServicesOption} style={{ height: 260, width: "100%" }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
        ) : isMounted ? (
          <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">جارٍ تحميل البيانات...</div>
        ) : null}
      </div>
    </Card>
  );
}
