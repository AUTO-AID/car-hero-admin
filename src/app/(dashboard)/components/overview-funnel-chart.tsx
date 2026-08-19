"use client";

import { useState, useEffect, useMemo } from "react";
import { Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ChartHeader } from "@/components/ui/chart-header";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function OverviewFunnelChart() {
  const chartTheme = useChartTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Mock data for the funnel since it's not provided by stats.service yet
  const funnelData = useMemo(() => [
    { value: 100, name: 'طلبات معلقة', itemStyle: { color: chartTheme.colors.series[2] } },
    { value: 80, name: 'مقبولة', itemStyle: { color: chartTheme.colors.series[3] } },
    { value: 60, name: 'قيد التنفيذ', itemStyle: { color: chartTheme.colors.series[0] } },
    { value: 45, name: 'مكتملة', itemStyle: { color: chartTheme.colors.series[1] } },
  ], [chartTheme]);

  const funnelOption = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      ...chartTheme.tooltip,
      trigger: "item",
      formatter: "{b}: <b>{c}</b>",
    },
    series: [
      {
        name: 'مسار الطلب',
        type: 'funnel',
        left: '10%',
        width: '80%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}',
          fontFamily: "inherit",
          fontSize: 12,
          color: chartTheme.colors.tooltipTitle,
        },
        itemStyle: {
          borderColor: chartTheme.colors.cardBorder,
          borderWidth: 2,
        },
        data: funnelData
      }
    ]
  }), [funnelData, chartTheme]);

  return (
    <Card variant="chart" className="p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <ChartHeader
        title="مسار الطلبات (Funnel)"
        subtitle="أرقام تجريبية — لم يوفّر stats.service مسار الطلبات بعد"
        icon={Filter}
        sampleData
      />
      
      <div className="relative w-full h-[250px] mt-2">
        {isMounted ? (
          <ReactECharts key={chartTheme.key} option={funnelOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
        ) : (
          <ChartSkeleton type="funnel" />
        )}
      </div>
    </Card>
  );
}
