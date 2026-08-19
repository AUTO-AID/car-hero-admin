"use client";

import { useState, useEffect, useMemo } from "react";
import { MapPin, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartHeader } from "@/components/ui/chart-header";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";

import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface OverviewGovChartProps {
  govData: any[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function OverviewGovChart({ govData, isLoading, isError, onRetry }: OverviewGovChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showAllGovs, setShowAllGovs] = useState(false);
  const chartTheme = useChartTheme();
  useEffect(() => { setIsMounted(true); }, []);

  const govPalette = [
    chartTheme.colors.warning, chartTheme.colors.info, chartTheme.colors.success, chartTheme.colors.warning, chartTheme.colors.danger,
    chartTheme.colors.info, chartTheme.colors.primary, chartTheme.colors.info, chartTheme.colors.primary, chartTheme.colors.info,
    chartTheme.colors.warning, chartTheme.colors.success, chartTheme.colors.danger, chartTheme.colors.info
  ];
  const govChartData = useMemo(() => {
    const raw = (govData ?? []) as any[];
    const sorted = [...raw].sort((a, b) => b.count - a.count);
    if (sorted.length <= 6) {
      return sorted.map((g: any, i: number) => ({
        name: g._id || "غير محدد",
        value: g.count,
        color: govPalette[i % govPalette.length],
      }));
    }
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    const otherCount = rest.reduce((sum, g) => sum + g.count, 0);
    const result = top5.map((g: any, i: number) => ({
      name: g._id || "غير محدد",
      value: g.count,
      color: govPalette[i % govPalette.length],
    }));
    if (otherCount > 0) {
      result.push({
        name: "محافظات أخرى",
        value: otherCount,
        color: chartTheme.colors.muted,
      });
    }
    return result;
  }, [govData]);

  const barOption = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: chartTheme.colors.tooltipBg,
      borderColor: chartTheme.colors.tooltipBorder,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: chartTheme.colors.text, fontSize: 11, fontFamily: "IBM Plex Sans Arabic" },
      formatter: (params: any[]) => {
        const p = params[0];
        return `<div style="display:flex;align-items:center;gap:6px">
          <span style="width:6px;height:6px;border-radius:50%;background:${p.color}"></span>
          <span>${p.name}: <b style="color:${chartTheme.colors.tooltipTitle}">${p.value}</b></span>
        </div>`;
      },
    },
    grid: { top: 10, right: 20, bottom: 20, left: 10, containLabel: true },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: chartTheme.colors.grid, type: "dashed" } },
      axisLabel: { color: chartTheme.colors.muted, fontSize: 11, fontFamily: "Inter" },
    },
    yAxis: {
      type: "category",
      data: govChartData.map((d: any) => d.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: chartTheme.colors.text, fontSize: 11, fontFamily: "IBM Plex Sans Arabic", margin: 10 },
    },
    series: [{
      type: "bar",
      data: govChartData.map((d: any) => ({
        value: d.value,
        itemStyle: { color: d.color, borderRadius: [0, 4, 4, 0] }
      })).reverse(),
      barWidth: "40%",
      label: {
        show: true,
        position: 'right',
        color: chartTheme.colors.text,
        fontSize: 11,
        fontFamily: 'Inter',
        formatter: '{c}'
      }
    }],
  }), [govChartData, chartTheme]);
  const totalGov = govChartData.reduce((s: number, d: any) => s + d.value, 0);

  return (
    <Card variant="chart" className="p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <ChartHeader
        title="توزيع المحافظات"
        subtitle="مزودو الخدمة حسب المحافظة — آخر تحديث قبل 5 دقائق"
        icon={MapPin}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative w-full h-[320px] mt-2">
          {isLoading || (!isMounted && !isError) ? (
            <ChartSkeleton type="horizontal-bar" />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">تعذر تحميل بيانات المحافظات</p>
              </div>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 h-8">
                  <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
                </Button>
              )}
            </div>
          ) : govChartData.length > 0 ? (
            <ReactECharts key={chartTheme.key} option={barOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">لا تتوفر بيانات لعرضها</div>
          )}
        </div>
        
        <div className="w-full mt-4 grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto p-1">
          {(showAllGovs ? govChartData : govChartData.slice(0, 3)).map((s: any) => (
            <div key={s.name} className="flex flex-col p-2.5 rounded-lg bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
                <span className="text-xs font-semibold text-muted-foreground/90 truncate">{s.name}</span>
              </div>
              <div className="flex items-baseline justify-between pe-1">
                <span className="text-sm font-bold text-white tabular-nums">{s.value}</span>
                <span className="text-xs font-bold text-muted-foreground/60 tabular-nums">
                  {totalGov > 0 ? Math.round((s.value / totalGov) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {govChartData.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-xs font-bold text-muted-foreground hover:text-white hover:bg-secondary/50 h-8 gap-1.5 transition-colors border border-border/20"
            onClick={() => setShowAllGovs(!showAllGovs)}
          >
            {showAllGovs ? (
              <>إخفاء التفاصيل <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>عرض الكل ({govChartData.length - 3} أخرى) <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
