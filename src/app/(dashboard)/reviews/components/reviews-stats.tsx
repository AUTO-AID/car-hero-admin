"use client";

import dynamic from "next/dynamic";
import { EyeOff, MessageSquareReply, MessageSquareWarning, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function ReviewsStats({ stats }: { stats: any }) {
  const chartTheme = useChartTheme();
  const ratings = stats?.ratingDistribution || [];
  const option = {
    tooltip: { ...chartTheme.tooltip, trigger: "axis" },
    grid: { left: 12, right: 12, top: 16, bottom: 12, containLabel: true },
    xAxis: { type: "category", data: ratings.map((item: any) => `${item._id} نجوم`), axisLabel: chartTheme.axisLabel },
    yAxis: { type: "value", axisLabel: chartTheme.axisLabel, splitLine: chartTheme.splitLine },
    series: [{ type: "bar", data: ratings.map((item: any) => item.count), itemStyle: { color: chartTheme.colors.warning, borderRadius: [4, 4, 0, 0] }, label: { show: true, position: "top", color: chartTheme.colors.muted } }],
  };
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="إجمالي التقييمات" value={Number(stats?.total || 0).toLocaleString("ar-SY")} icon={Star} iconColor="text-warning" iconBg="from-amber-500/15 to-amber-500/5" />
      <StatCard title="متوسط التقييم" value={`${Number(stats?.averageRating || 0).toFixed(2)} / 5`} icon={Star} iconColor="text-info" iconBg="from-blue-500/15 to-blue-500/5" />
      <StatCard title="المبلغ عنها" value={Number(stats?.reported || 0).toLocaleString("ar-SY")} icon={MessageSquareWarning} iconColor="text-danger" iconBg="from-rose-500/15 to-rose-500/5" />
      <StatCard title="ردود المزودين" value={Number(stats?.responded || 0).toLocaleString("ar-SY")} icon={MessageSquareReply} iconColor="text-success" iconBg="from-emerald-500/15 to-emerald-500/5" />
    </div>
    <Card className="p-6 bg-card border-border/40">
      <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold">توزيع تقييمات العملاء</h3><span className="text-xs text-muted-foreground flex gap-1"><EyeOff className="w-3.5 h-3.5" />مخفية: {Number(stats?.hidden || 0).toLocaleString("ar-SY")}</span></div>
      <ReactECharts key={chartTheme.key} option={option} style={{ height: 230 }} />
    </Card>
  </div>;
}
