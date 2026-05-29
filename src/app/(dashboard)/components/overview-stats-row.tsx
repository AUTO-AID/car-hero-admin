"use client";

import { Wrench, CheckCircle, Users, Package, Hourglass, XCircle, DollarSign, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface OverviewStatsRowProps {
  kpi: {
    totalProviders: number;
    approvedProviders: number;
    pendingProviders: number;
    rejectedProviders: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    platformBalance: number;
  };
  summaryLoading: boolean;
}

export function OverviewStatsRow({ kpi, summaryLoading }: OverviewStatsRowProps) {
  return (
    <div className="space-y-6">
      {/* ───── KPI Row 1: Provider Analytics ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard
          title="إجمالي المزودين"
          value={kpi.totalProviders.toLocaleString("ar-SA")}
          icon={Wrench}
          iconColor="text-violet-400"
          iconBg="from-violet-500/20 to-violet-500/5"
          glowClass="glow-purple"
          trend={{ 
            value: kpi.pendingProviders, 
            label: "بانتظار الموافقة",
            customValue: `${kpi.pendingProviders} معلقة`,
            type: kpi.pendingProviders > 0 ? "neutral" : "up" 
          }}
          loading={summaryLoading}
        />
        <StatCard
          title="مزودون معتمدون"
          value={kpi.approvedProviders.toLocaleString("ar-SA")}
          icon={CheckCircle}
          iconColor="text-emerald-400"
          iconBg="from-emerald-500/20 to-emerald-500/5"
          glowClass="glow-green"
          trend={{ value: Math.round((kpi.approvedProviders / Math.max(kpi.totalProviders, 1)) * 100), label: "% من الإجمالي" }}
          loading={summaryLoading}
        />
        <StatCard
          title="إجمالي العملاء"
          value={kpi.totalUsers.toLocaleString("ar-SA")}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="from-blue-500/20 to-blue-500/5"
          glowClass="glow-blue"
          loading={summaryLoading}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={kpi.totalOrders.toLocaleString("ar-SA")}
          icon={Package}
          iconColor="text-orange-400"
          iconBg="from-orange-500/20 to-orange-500/5"
          glowClass="glow-orange"
          loading={summaryLoading}
        />
      </div>

      {/* ───── KPI Row 2 ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <StatCard
          title="طلبات معلّقة"
          value={kpi.pendingProviders.toLocaleString("ar-SA")}
          subtitle="بانتظار مراجعة الإدارة"
          icon={Hourglass}
          iconColor="text-amber-400"
          iconBg="from-amber-500/20 to-amber-500/5"
          loading={summaryLoading}
        />
        <StatCard
          title="طلبات مرفوضة"
          value={kpi.rejectedProviders.toLocaleString("ar-SA")}
          subtitle="تحتاج متابعة"
          icon={XCircle}
          iconColor="text-rose-400"
          iconBg="from-rose-500/20 to-rose-500/5"
          loading={summaryLoading}
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${kpi.totalRevenue.toLocaleString("ar-SA")} ل.س`}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="from-emerald-500/20 to-emerald-500/5"
          glowClass="glow-green"
          loading={summaryLoading}
        />
        <StatCard
          title="رصيد المنصة"
          value={`${kpi.platformBalance.toLocaleString("ar-SA")} ل.س`}
          icon={Wallet}
          iconColor="text-cyan-400"
          iconBg="from-cyan-500/20 to-cyan-500/5"
          glowClass="glow-cyan"
          loading={summaryLoading}
        />
      </div>
    </div>
  );
}
