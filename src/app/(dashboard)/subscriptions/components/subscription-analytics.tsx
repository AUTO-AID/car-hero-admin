"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, CalendarClock, CreditCard, Users } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function SubscriptionAnalytics({ stats }: { stats: any }) {
  const timeline = stats?.timeline || [];
  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["اشتراكات جديدة", "الإيراد"], textStyle: { color: "#94a3b8" } },
    grid: { left: 12, right: 12, top: 38, bottom: 12, containLabel: true },
    xAxis: { type: "category", data: timeline.map((item: any) => item._id), axisLabel: { color: "#94a3b8" } },
    yAxis: { type: "value", axisLabel: { color: "#94a3b8" }, splitLine: { lineStyle: { color: "rgba(255,255,255,.06)" } } },
    series: [
      { name: "اشتراكات جديدة", type: "bar", data: timeline.map((item: any) => item.count), itemStyle: { color: "#a57ed8", borderRadius: [4, 4, 0, 0] } },
      { name: "الإيراد", type: "line", smooth: true, data: timeline.map((item: any) => item.revenue), lineStyle: { color: "#10b981" }, itemStyle: { color: "#10b981" } },
    ],
  };
  return <>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="إجمالي الاشتراكات" value={Number(stats?.totalSubscriptions || 0).toLocaleString("ar-SY")} icon={Users} iconColor="text-blue-400" iconBg="from-blue-500/15 to-blue-500/5" />
      <StatCard title="الاشتراكات النشطة" value={Number(stats?.activeSubscriptions || 0).toLocaleString("ar-SY")} icon={BadgeCheck} iconColor="text-emerald-400" iconBg="from-emerald-500/15 to-emerald-500/5" />
      <StatCard title="إجمالي الإيراد" value={`${Number(stats?.totalRevenue || 0).toLocaleString("ar-SY")} ل.س`} icon={CreditCard} iconColor="text-amber-400" iconBg="from-amber-500/15 to-amber-500/5" />
      <StatCard title="التجديد التلقائي" value={Number(stats?.autoRenewSubscriptions || 0).toLocaleString("ar-SY")} icon={CalendarClock} iconColor="text-violet-400" iconBg="from-violet-500/15 to-violet-500/5" />
    </div>
    <Card className="p-4 bg-card border-border/40">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold">نمو الاشتراكات والإيراد</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="badge-neutral">منتهي: {Number(stats?.expiredSubscriptions || 0).toLocaleString("ar-SY")}</Badge>
          <Badge variant="outline" className="badge-danger">ملغي: {Number(stats?.cancelledSubscriptions || 0).toLocaleString("ar-SY")}</Badge>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: 260 }} />
    </Card>
  </>;
}
