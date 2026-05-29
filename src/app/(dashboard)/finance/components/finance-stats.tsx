"use client";

import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface FinanceStatsProps {
  balance: number;
  totalCommissions: number;
  totalPayouts: number;
  payoutsCount: number;
}

export default function FinanceStats({
  balance,
  totalCommissions,
  totalPayouts,
  payoutsCount,
}: FinanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
      <StatCard
        title="رصيد المنصة الحالي"
        value={`${balance.toLocaleString("ar-SA")} ل.س`}
        icon={Wallet} iconColor="text-emerald-400" iconBg="from-emerald-500/15 to-emerald-500/5" glowClass="glow-green"
        trend={{ value: 12, label: "نمو شهر مايو", type: "up" }}
      />
      <StatCard
        title="إجمالي العمولات"
        value={`${totalCommissions.toLocaleString("ar-SA")} ل.س`}
        icon={ArrowDownRight} iconColor="text-blue-400" iconBg="from-blue-500/15 to-blue-500/5" glowClass="glow-blue"
        trend={{ value: 8, label: "منذ الشهر الماضي", type: "up" }}
      />
      <StatCard
        title="إجمالي المدفوعات للمزودين"
        value={`${totalPayouts.toLocaleString("ar-SA")} ل.س`}
        icon={ArrowUpRight} iconColor="text-orange-400" iconBg="from-orange-500/15 to-orange-500/5"
        trend={{ value: 5, label: "بانتظار التنفيذ", customValue: `${payoutsCount} طلبات`, type: "neutral" }}
      />
    </div>
  );
}
