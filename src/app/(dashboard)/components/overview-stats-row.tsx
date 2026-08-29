"use client";

import { Wrench, CheckCircle, Users, Package, Hourglass, XCircle, DollarSign } from "lucide-react";
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
  };
  summaryLoading: boolean;
}

export function OverviewStatsRow({ kpi, summaryLoading }: OverviewStatsRowProps) {
  return (
    <div className="space-y-8">
      {/* ───── Primary KPIs (Tier 1) ───── */}
      <div>
        <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
          المؤشرات المالية
        </h4>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 stagger">
          <StatCard
            className="border-s-4 border-s-emerald-500 bg-gradient-to-l from-emerald-500/10 to-transparent"
            valueClassName="text-4xl text-foreground"
            title="إجمالي الإيرادات"
            value={`${kpi.totalRevenue.toLocaleString("ar-SA")} ل.س`}
            icon={DollarSign}
            iconColor="text-success"
            iconBg="from-emerald-500/20 to-emerald-500/5"
            glowClass="glow-green"
            sparkline={[12, 14, 11, 16, 20, 24, 28, 25, 32]}
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* ───── Secondary KPIs (Tier 2) ───── */}
      <div>
        <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
          مؤشرات الأعمال الرئيسية
        </h4>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 stagger">
          <StatCard
            title="إجمالي المزودين"
            value={kpi.totalProviders.toLocaleString("ar-SA")}
            icon={Wrench}
            iconColor="text-warning"
            iconBg="from-amber-500/20 to-amber-500/5"
            glowClass="glow-amber"
            trend={{ 
              value: kpi.pendingProviders, 
              label: "بانتظار الموافقة",
              customValue: `${kpi.pendingProviders} معلقة`,
              type: kpi.pendingProviders > 0 ? "neutral" : "up" 
            }}
            sparkline={[8, 10, 14, 18, 22, 26, 30, 35, 40]}
            loading={summaryLoading}
          />
          <StatCard
            title="مزودون معتمدون"
            value={kpi.approvedProviders.toLocaleString("ar-SA")}
            icon={CheckCircle}
            iconColor="text-success"
            iconBg="from-emerald-500/20 to-emerald-500/5"
            glowClass="glow-green"
            trend={{ value: Math.round((kpi.approvedProviders / Math.max(kpi.totalProviders, 1)) * 100), label: "% من الإجمالي" }}
            sparkline={[6, 9, 12, 15, 19, 23, 26, 30, 34]}
            loading={summaryLoading}
          />
          <StatCard
            title="إجمالي العملاء"
            value={kpi.totalUsers.toLocaleString("ar-SA")}
            icon={Users}
            iconColor="text-info"
            iconBg="from-blue-500/20 to-blue-500/5"
            glowClass="glow-blue"
            loading={summaryLoading}
          />
          <StatCard
            title="إجمالي الطلبات"
            value={kpi.totalOrders.toLocaleString("ar-SA")}
            icon={Package}
            iconColor="text-warning"
            iconBg="from-orange-500/20 to-orange-500/5"
            glowClass="glow-orange"
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* ───── Tertiary KPIs (Tier 3) ───── */}
      <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
        <h4 className="text-sm font-bold text-danger mb-3 flex items-center gap-2">
          تنبيهات تشغيلية
        </h4>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 stagger">
          <StatCard
            title="طلبات معلّقة"
            value={kpi.pendingProviders.toLocaleString("ar-SA")}
            subtitle="بانتظار مراجعة الإدارة"
            icon={Hourglass}
            iconColor="text-warning"
            iconBg="from-amber-500/20 to-amber-500/5"
            critical={kpi.pendingProviders > 0}
            loading={summaryLoading}
          />
          <StatCard
            title="طلبات مرفوضة"
            value={kpi.rejectedProviders.toLocaleString("ar-SA")}
            subtitle="تحتاج متابعة"
            icon={XCircle}
            iconColor="text-danger"
            iconBg="from-rose-500/20 to-rose-500/5"
            critical={kpi.rejectedProviders > 0}
            loading={summaryLoading}
          />
        </div>
      </div>
    </div>
  );
}
