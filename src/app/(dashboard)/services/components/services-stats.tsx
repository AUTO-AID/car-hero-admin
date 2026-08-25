"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { useChartTheme } from "@/application/hooks/use-chart-theme";
import { categoryLabel } from "@/domain/entities/service-catalog";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// tooltip / axis / series values now come from useChartTheme, which reads the
// design tokens at runtime — the literals here were a dark-only palette that
// also carried the marketing site's purple.

interface ServicesStatsProps {
  facets?: any;
  isLoading?: boolean;
}

export function ServicesStats({ facets, isLoading = false }: ServicesStatsProps) {
  const chartTheme = useChartTheme();
  const tooltip = chartTheme.tooltip;
  const colors = chartTheme.colors.series;
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (isLoading) {
    return <Card className="p-6 bg-card border-border/40 text-sm text-muted-foreground">جاري تحميل إحصائيات الخدمات من الخادم...</Card>;
  }

  const categories = facets?.categories ?? [];
  const topUsed = facets?.topUsed ?? [];
  const totals = facets?.totals?.[0] ?? facets?.totals ?? {};

  const categoryOption = {
    backgroundColor: "transparent",
    tooltip,
    grid: { top: 20, right: 10, bottom: 70, left: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: categories.map((item: any) => categoryLabel(item._id) || item._id),
      axisLabel: { ...chartTheme.axisLabel, fontSize: 10, rotate: 30 },
    },
    yAxis: { type: "value", axisLabel: { ...chartTheme.axisLabel, fontSize: 10 }, splitLine: chartTheme.splitLine },
    series: [{
      type: "bar",
      data: categories.map((item: any, index: number) => ({ value: item.count, itemStyle: { color: colors[index % colors.length], borderRadius: [6, 6, 0, 0] } })),
      label: { show: true, position: "top", color: chartTheme.colors.muted, fontSize: 10 },
    }],
  };

  const usageOption = {
    backgroundColor: "transparent",
    tooltip,
    grid: { top: 10, right: 20, bottom: 40, left: 10, containLabel: true },
    xAxis: { type: "value", axisLabel: { ...chartTheme.axisLabel, fontSize: 10 } },
    yAxis: {
      type: "category",
      data: topUsed.map((item: any) => item.name).reverse(),
      axisLabel: { ...chartTheme.axisLabel, fontSize: 10 },
    },
    series: [{
      type: "bar",
      data: topUsed.map((item: any, index: number) => ({ value: item.ordersCount, itemStyle: { color: colors[index % colors.length], borderRadius: [0, 6, 6, 0] } })).reverse(),
      label: { show: true, position: "right", color: chartTheme.colors.muted, fontSize: 10 },
    }],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-6 bg-card/70 border-border/40">
          <p className="text-xs text-muted-foreground mb-1">إجمالي الخدمات</p>
          <p className="text-xl font-bold text-white">{Number(totals.total || 0).toLocaleString("ar-SA")}</p>
        </Card>
        <Card className="p-6 bg-card/70 border-border/40">
          <p className="text-xs text-muted-foreground mb-1">الخدمات النشطة</p>
          <p className="text-xl font-bold text-success">{Number(totals.active || 0).toLocaleString("ar-SA")}</p>
        </Card>
        <Card className="p-6 bg-card/70 border-border/40">
          <p className="text-xs text-muted-foreground mb-1">إجمالي الطلبات المرتبطة</p>
          <p className="text-xl font-bold text-primary">{Number(totals.totalOrders || 0).toLocaleString("ar-SA")}</p>
        </Card>
        <Card className="p-6 bg-card/70 border-border/40">
          <p className="text-xs text-muted-foreground mb-1">إيراد الخدمات</p>
          <p className="text-xl font-bold text-info">{Number(totals.totalRevenue || 0).toLocaleString("ar-SA")}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40">
          <div className="mb-4">
            <h3 className="font-semibold text-white text-sm tracking-tight">الخدمات حسب التصنيف</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">تجميع مباشر من مجموعة services</p>
          </div>
          {isMounted && <ReactECharts key={chartTheme.key} option={categoryOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
        </Card>

        <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40">
          <div className="mb-4">
            <h3 className="font-semibold text-white text-sm tracking-tight">أكثر الخدمات طلباً</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">عدد الطلبات المرتبطة بكل خدمة من orders</p>
          </div>
          {isMounted && <ReactECharts key={chartTheme.key} option={usageOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
        </Card>
      </div>
    </div>
  );
}
