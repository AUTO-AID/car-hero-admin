"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ChartHeader } from "@/components/ui/chart-header";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { Button } from "@/components/ui/button";
import { LayoutList, AlertCircle, RefreshCw } from "lucide-react";

import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface OverviewCategoryChartProps {
  serviceData: any[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function OverviewCategoryChart({ serviceData, isLoading, isError, onRetry }: OverviewCategoryChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const chartTheme = useChartTheme();
  useEffect(() => { setIsMounted(true); }, []);

  const topSvcs = useMemo(() => ((serviceData ?? []) as any[]).slice(0, 8), [serviceData]);

  const topServicesOption = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: chartTheme.colors.tooltipBg,
      borderColor: chartTheme.colors.tooltipBorder,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: chartTheme.colors.text, fontSize: 11, fontFamily: "IBM Plex Sans Arabic" },
      axisPointer: { type: "shadow", shadowStyle: { color: chartTheme.colors.grid } },
      formatter: (params: any[]) => {
        const p = params[0];
        return `<div style="display:flex;align-items:center;gap:6px">
          <span style="width:6px;height:6px;border-radius:50%;background:${p.color.colorStops ? p.color.colorStops[0].color : p.color}"></span>
          <span>${p.name}: <b style="color:${chartTheme.colors.tooltipTitle}">${p.value}</b></span>
        </div>`;
      }
    },
    grid: { top: 10, right: 45, bottom: 10, left: 10, containLabel: true },
    xAxis: { type: "value", show: false },
    yAxis: { 
      type: "category", 
      data: topSvcs.map((s: any) => s._id || "غير محدد").reverse(), 
      axisLabel: { color: chartTheme.colors.text, fontSize: 11, fontFamily: "IBM Plex Sans Arabic", margin: 16 }, 
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
          // the shared categorical ramp: one token per slice, used in order
          const colors = chartTheme.colors.series.map((c) => [c, c]);
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
        color: chartTheme.colors.muted, 
        fontSize: 11,
        fontFamily: "Inter",
        fontWeight: "bold",
        offset: [6, 0]
      },
    }],
  }), [topSvcs, chartTheme]);

  return (
    <Card variant="chart" className="p-6 flex flex-col">
      <ChartHeader
        title="التصنيف حسب الخدمة"
        subtitle="توزيع المزودين والخدمات — آخر تحديث قبل 5 دقائق"
        icon={LayoutList}
      />
      <div className="flex-1 flex items-center justify-center min-h-[260px] w-full mt-2">
        {isLoading || (!isMounted && !isError) ? (
          <ChartSkeleton type="horizontal-bar" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="flex items-center gap-2 text-danger">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">تعذر تحميل بيانات الخدمات</p>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 h-8">
                <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
              </Button>
            )}
          </div>
        ) : topSvcs.length > 0 ? (
          <ReactECharts key={chartTheme.key} option={topServicesOption} style={{ height: 260, width: "100%" }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
        ) : (
          <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">لا تتوفر بيانات لعرضها</div>
        )}
      </div>
    </Card>
  );
}
