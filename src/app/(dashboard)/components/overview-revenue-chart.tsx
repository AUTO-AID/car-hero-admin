"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ChartHeader } from "@/components/ui/chart-header";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function OverviewRevenueChart() {
  const [isMounted, setIsMounted] = useState(false);
  const chartTheme = useChartTheme();
  useEffect(() => { setIsMounted(true); }, []);

  // Mock data for the revenue trend since it's not provided by stats.service yet
  const revenueData = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    const data = [1500000, 2200000, 1800000, 3100000, 2800000, 4200000];
    return { months, data };
  }, []);

  const revenueOption = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      ...chartTheme.tooltip,
      trigger: "axis",
      formatter: (params: any[]) => {
        const p = params[0];
        return `<div style="display:flex; flex-direction:column; gap:4px;">
          <div style="font-weight:700; color:${chartTheme.colors.tooltipTitle}; border-bottom:1px solid ${chartTheme.colors.grid}; padding-bottom:4px; margin-bottom:2px;">${p.axisValue}</div>
          <div><span style="color:${chartTheme.colors.muted}">الإيرادات:</span> <b style="color:${chartTheme.colors.success}">${p.value.toLocaleString("ar-EG")} ل.س</b></div>
        </div>`;
      },
    },
    grid: { top: 30, right: 10, bottom: 30, left: 60, containLabel: false },
    xAxis: {
      type: "category",
      data: revenueData.months,
      axisLabel: { ...chartTheme.axisLabel, margin: 12 },
      axisLine: { lineStyle: { color: chartTheme.colors.grid } },
      axisTick: { show: false },
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: chartTheme.colors.axis, fontSize: 11, fontFamily: "Inter",
        formatter: (val: number) => val >= 1000000 ? (val / 1000000) + 'M' : val >= 1000 ? (val / 1000) + 'k' : val
      },
      splitLine: chartTheme.splitLine,
      axisLine: { show: false },
    },
    series: [
      {
        name: "الإيرادات",
        type: "line",
        data: revenueData.data,
        smooth: 0.4,
        symbol: "circle",
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: chartTheme.colors.success, width: 3, shadowColor: "rgba(16, 185, 129, 0.28)", shadowBlur: 10, shadowOffsetY: 4 },
        itemStyle: { color: chartTheme.colors.success, borderColor: chartTheme.colors.cardBorder, borderWidth: 2 },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: chartTheme.isLight ? "rgba(4, 120, 87, 0.2)" : "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.01)" },
            ],
          },
        },
      }
    ],
  }), [chartTheme, revenueData]);

  return (
    <Card variant="chart" className="p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <ChartHeader
        title="اتجاه الإيرادات"
        subtitle="أرقام تجريبية — لم يوفّر stats.service اتجاه الإيرادات بعد"
        icon={LineChart}
        sampleData
      />
      
      <div className="relative w-full h-[250px] mt-2 -mx-2">
        {isMounted ? (
          <ReactECharts key={chartTheme.key} option={revenueOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
        ) : (
          <ChartSkeleton type="line" />
        )}
      </div>
    </Card>
  );
}
