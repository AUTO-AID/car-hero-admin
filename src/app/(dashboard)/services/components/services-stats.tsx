"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const tooltip = {
  backgroundColor: "rgba(13, 9, 22, 0.97)",
  borderColor: "rgba(143,92,177,0.35)",
  borderWidth: 1,
  textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
  extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px;",
};

const colors = ["#a57ed8", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

interface ServicesStatsProps {
  facets?: any;
  categoryMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }>;
  isLoading?: boolean;
}

export function ServicesStats({ facets, categoryMeta, isLoading = false }: ServicesStatsProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (isLoading) {
    return <Card className="p-5 bg-card border-border/40 text-sm text-muted-foreground">جاري تحميل إحصائيات الخدمات من الخادم...</Card>;
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
      data: categories.map((item: any) => categoryMeta[item._id]?.label || item._id),
      axisLabel: { color: "#64748b", fontSize: 10, rotate: 30 },
    },
    yAxis: { type: "value", axisLabel: { color: "#64748b", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(143,92,177,0.07)", type: "dashed" } } },
    series: [{
      type: "bar",
      data: categories.map((item: any, index: number) => ({ value: item.count, itemStyle: { color: colors[index % colors.length], borderRadius: [6, 6, 0, 0] } })),
      label: { show: true, position: "top", color: "#94a3b8", fontSize: 10 },
    }],
  };

  const usageOption = {
    backgroundColor: "transparent",
    tooltip,
    grid: { top: 10, right: 20, bottom: 40, left: 10, containLabel: true },
    xAxis: { type: "value", axisLabel: { color: "#64748b", fontSize: 10 } },
    yAxis: {
      type: "category",
      data: topUsed.map((item: any) => item.name).reverse(),
      axisLabel: { color: "#64748b", fontSize: 10 },
    },
    series: [{
      type: "bar",
      data: topUsed.map((item: any, index: number) => ({ value: item.ordersCount, itemStyle: { color: colors[index % colors.length], borderRadius: [0, 6, 6, 0] } })).reverse(),
      label: { show: true, position: "right", color: "#94a3b8", fontSize: 10 },
    }],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-card/70 border-border/40">
          <p className="text-[10px] text-muted-foreground mb-1">إجمالي الخدمات</p>
          <p className="text-xl font-black text-white">{Number(totals.total || 0).toLocaleString("ar-SA")}</p>
        </Card>
        <Card className="p-4 bg-card/70 border-border/40">
          <p className="text-[10px] text-muted-foreground mb-1">الخدمات النشطة</p>
          <p className="text-xl font-black text-emerald-400">{Number(totals.active || 0).toLocaleString("ar-SA")}</p>
        </Card>
        <Card className="p-4 bg-card/70 border-border/40">
          <p className="text-[10px] text-muted-foreground mb-1">إجمالي الطلبات المرتبطة</p>
          <p className="text-xl font-black text-primary">{Number(totals.totalOrders || 0).toLocaleString("ar-SA")}</p>
        </Card>
        <Card className="p-4 bg-card/70 border-border/40">
          <p className="text-[10px] text-muted-foreground mb-1">إيراد الخدمات</p>
          <p className="text-xl font-black text-blue-400">{Number(totals.totalRevenue || 0).toLocaleString("ar-SA")}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-card/70 backdrop-blur-xl border border-border/40">
          <div className="mb-4">
            <h3 className="font-semibold text-white text-sm tracking-tight">الخدمات حسب التصنيف</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">تجميع مباشر من مجموعة services</p>
          </div>
          {isMounted && <ReactECharts option={categoryOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
        </Card>

        <Card className="p-5 bg-card/70 backdrop-blur-xl border border-border/40">
          <div className="mb-4">
            <h3 className="font-semibold text-white text-sm tracking-tight">أكثر الخدمات طلباً</h3>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">عدد الطلبات المرتبطة بكل خدمة من orders</p>
          </div>
          {isMounted && <ReactECharts option={usageOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
        </Card>
      </div>
    </div>
  );
}
