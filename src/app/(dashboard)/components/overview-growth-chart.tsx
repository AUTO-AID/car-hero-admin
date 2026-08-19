"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { ChartHeader } from "@/components/ui/chart-header";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const AR_MONTHS = [
  "", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

interface OverviewGrowthChartProps {
  growthData: any[] | undefined;
  totalProviders: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function OverviewGrowthChart({ growthData, totalProviders, isLoading, isError, onRetry }: OverviewGrowthChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const chartTheme = useChartTheme();
  useEffect(() => { setIsMounted(true); }, []);

  const { growthMonths, growthValues, cumulativeValues } = useMemo(() => {
    const rawGrowth = (growthData ?? []) as any[];
    const months = rawGrowth.map((d: any) => `${AR_MONTHS[d._id?.month] || d._id?.month} ${d._id?.year}`);
    const values = rawGrowth.map((d: any) => d.count);
    const cumulative: number[] = [];
    values.reduce((acc: number, val: number) => {
      cumulative.push(acc + val);
      return acc + val;
    }, 0);
    return { growthMonths: months, growthValues: values, cumulativeValues: cumulative };
  }, [growthData]);

  const growthChartOption = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: chartTheme.colors.tooltipBg,
      borderColor: chartTheme.colors.tooltipBorder,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: chartTheme.colors.text, fontSize: 11, fontFamily: "IBM Plex Sans Arabic" },
      formatter: (params: any[]) => {
        const [cum, monthly] = params;
        return `<div style="display:flex; flex-direction:column; gap:4px;">
          <div style="font-weight:700; color:${chartTheme.colors.tooltipTitle}; border-bottom:1px solid ${chartTheme.colors.grid}; padding-bottom:4px; margin-bottom:2px;">${cum.axisValue}</div>
          <div><span style="color:${chartTheme.colors.muted}">الإجمالي:</span> <b style="color:${chartTheme.colors.primary}">${cum.value.toLocaleString("ar-EG")}</b></div>
          <div><span style="color:${chartTheme.colors.muted}">الجديد:</span> <b style="color:${chartTheme.colors.success}">${(monthly?.value ?? 0).toLocaleString("ar-EG")}</b></div>
        </div>`;
      },
    },
    legend: {
      show: true,
      top: 0,
      left: 10,
      textStyle: { color: chartTheme.colors.muted, fontFamily: "IBM Plex Sans Arabic", fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16
    },
    grid: { top: 40, right: 10, bottom: 50, left: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: growthMonths,
      axisLabel: { color: chartTheme.colors.muted, fontSize: 11, fontFamily: "IBM Plex Sans Arabic", margin: 12, rotate: growthMonths.length > 8 ? 25 : 0 },
      axisLine: { lineStyle: { color: chartTheme.colors.grid } },
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: "value",
        axisLabel: {
          color: chartTheme.colors.muted, fontSize: 11, fontFamily: "Inter",
        },
        splitLine: { lineStyle: { color: chartTheme.colors.grid, type: "dashed" } },
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
        borderColor: chartTheme.colors.grid,
        backgroundColor: "transparent",
        fillerColor: chartTheme.isLight ? "rgba(163, 111, 8, 0.08)" : "rgba(213, 173, 63, 0.08)",
        textStyle: { color: chartTheme.colors.muted, fontSize: 9, fontFamily: "IBM Plex Sans Arabic" },
        handleSize: "75%",
        handleStyle: { color: chartTheme.colors.primary, borderWidth: 0, shadowBlur: 4, shadowColor: "rgba(0,0,0,0.2)" },
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
        lineStyle: { color: chartTheme.colors.primary, width: 3, shadowColor: chartTheme.isLight ? "rgba(163, 111, 8, 0.15)" : "rgba(245, 158, 11, 0.35)", shadowBlur: 12, shadowOffsetY: 6 },
        itemStyle: { color: chartTheme.colors.primary, borderColor: chartTheme.colors.cardBorder, borderWidth: 2 },
      },
      {
        name: "جديد هذا الشهر",
        type: "bar",
        data: growthValues,
        barWidth: "22%",
        itemStyle: {
          color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: chartTheme.isLight ? "rgba(4, 120, 87, 0.85)" : "rgba(52, 211, 153, 0.9)" },
              { offset: 1, color: chartTheme.isLight ? "rgba(4, 120, 87, 0.55)" : "rgba(52, 211, 153, 0.65)" },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        yAxisIndex: 1,
      },
    ],
  }), [cumulativeValues, growthMonths, growthValues, chartTheme]);

  return (
    <Card variant="chart" className="xl:col-span-2 p-6">
      <ChartHeader
        title="نمو مزودي الخدمة"
        subtitle="عدد المزودين المسجلين شهرياً — آخر تحديث قبل 5 دقائق"
        icon={TrendingUp}
        action={
          <div className="flex items-center gap-2 bg-secondary/50 border border-border/50 rounded-lg p-1.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-success border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{totalProviders} مزود إجمالي</span>
            </div>
          </div>
        }
      />
      
      <div className="relative z-10 -mx-2 h-[320px]">
        {isLoading || (!isMounted && !isError) ? (
          <ChartSkeleton type="bar" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="flex items-center gap-2 text-danger">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">تعذر تحميل بيانات النمو</p>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 h-8">
                <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
              </Button>
            )}
          </div>
        ) : growthMonths.length > 0 ? (
          <ReactECharts key={chartTheme.key} option={growthChartOption} style={{ height: "100%" }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">لا تتوفر بيانات لعرضها</div>
        )}
      </div>
    </Card>
  );
}
