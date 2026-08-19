"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, CalendarClock, CreditCard, Users } from "lucide-react";
import { useChartTheme } from "@/application/hooks/use-chart-theme";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function SubscriptionAnalytics({ stats }: { stats: any }) {
  const chartTheme = useChartTheme();
  const timeline = stats?.timeline || [];
  const option = {
    tooltip: { ...chartTheme.tooltip, trigger: "axis" },
    legend: { data: ["اشتراكات جديدة", "الإيراد"], textStyle: { color: chartTheme.colors.muted } },
    grid: { left: 12, right: 12, top: 38, bottom: 12, containLabel: true },
    xAxis: { type: "category", data: timeline.map((item: any) => item._id), axisLabel: chartTheme.axisLabel },
    yAxis: { type: "value", axisLabel: chartTheme.axisLabel, splitLine: chartTheme.splitLine },
    series: [
      { name: "اشتراكات جديدة", type: "bar", data: timeline.map((item: any) => item.count), itemStyle: { color: chartTheme.colors.series[0], borderRadius: [4, 4, 0, 0] } },
      { name: "الإيراد", type: "line", smooth: true, data: timeline.map((item: any) => item.revenue), lineStyle: { color: chartTheme.colors.success }, itemStyle: { color: chartTheme.colors.success } },
    ],
  };
  return <>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="إجمالي الاشتراكات" value={Number(stats?.totalSubscriptions || 0).toLocaleString("ar-SY")} icon={Users} iconColor="text-info" iconBg="from-blue-500/15 to-blue-500/5" />
      <StatCard title="الاشتراكات النشطة" value={Number(stats?.activeSubscriptions || 0).toLocaleString("ar-SY")} icon={BadgeCheck} iconColor="text-success" iconBg="from-emerald-500/15 to-emerald-500/5" />
      <StatCard title="إجمالي الإيراد" value={`${Number(stats?.totalRevenue || 0).toLocaleString("ar-SY")} ل.س`} icon={CreditCard} iconColor="text-warning" iconBg="from-amber-500/15 to-amber-500/5" />
      <StatCard title="التجديد التلقائي" value={Number(stats?.autoRenewSubscriptions || 0).toLocaleString("ar-SY")} icon={CalendarClock} iconColor="text-info" iconBg="from-violet-500/15 to-violet-500/5" />
    </div>
    <Card className="p-6 bg-card border-border/40">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold">نمو الاشتراكات والإيراد</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="badge-neutral">منتهي: {Number(stats?.expiredSubscriptions || 0).toLocaleString("ar-SY")}</Badge>
          <Badge variant="outline" className="badge-danger">ملغي: {Number(stats?.cancelledSubscriptions || 0).toLocaleString("ar-SY")}</Badge>
        </div>
      </div>
      <ReactECharts key={chartTheme.key} option={option} style={{ height: 260 }} />
    </Card>
  </>;
}
