"use client";

import dynamic from "next/dynamic";
import { EyeOff, MessageSquareReply, MessageSquareWarning, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function ReviewsStats({ stats }: { stats: any }) {
  const ratings = stats?.ratingDistribution || [];
  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: 12, right: 12, top: 16, bottom: 12, containLabel: true },
    xAxis: { type: "category", data: ratings.map((item: any) => `${item._id} نجوم`), axisLabel: { color: "#94a3b8" } },
    yAxis: { type: "value", axisLabel: { color: "#94a3b8" }, splitLine: { lineStyle: { color: "rgba(255,255,255,.06)" } } },
    series: [{ type: "bar", data: ratings.map((item: any) => item.count), itemStyle: { color: "#f59e0b", borderRadius: [4, 4, 0, 0] }, label: { show: true, position: "top", color: "#94a3b8" } }],
  };
  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="إجمالي التقييمات" value={Number(stats?.total || 0).toLocaleString("ar-SY")} icon={Star} iconColor="text-amber-400" iconBg="from-amber-500/15 to-amber-500/5" />
      <StatCard title="متوسط التقييم" value={`${Number(stats?.averageRating || 0).toFixed(2)} / 5`} icon={Star} iconColor="text-blue-400" iconBg="from-blue-500/15 to-blue-500/5" />
      <StatCard title="المبلغ عنها" value={Number(stats?.reported || 0).toLocaleString("ar-SY")} icon={MessageSquareWarning} iconColor="text-rose-400" iconBg="from-rose-500/15 to-rose-500/5" />
      <StatCard title="ردود المزودين" value={Number(stats?.responded || 0).toLocaleString("ar-SY")} icon={MessageSquareReply} iconColor="text-emerald-400" iconBg="from-emerald-500/15 to-emerald-500/5" />
    </div>
    <Card className="p-4 bg-card border-border/40">
      <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold">توزيع تقييمات العملاء</h3><span className="text-xs text-muted-foreground flex gap-1"><EyeOff className="w-3.5 h-3.5" />مخفية: {Number(stats?.hidden || 0).toLocaleString("ar-SY")}</span></div>
      <ReactECharts option={option} style={{ height: 230 }} />
    </Card>
  </div>;
}
