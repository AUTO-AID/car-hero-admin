"use client";

import { ArrowDownRight, ArrowUpRight, Clock3, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface FinanceStatsProps {
  balance: number;
  totalCommissions: number;
  totalPayouts: number;
  payoutsCount: number;
  pendingPayoutsAmount?: number;
  transactionsCount?: number;
}

export default function FinanceStats({
  balance,
  totalCommissions,
  totalPayouts,
  payoutsCount,
  pendingPayoutsAmount = 0,
  transactionsCount = 0,
}: FinanceStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
      <StatCard
        title="رصيد المنصة المحسوب"
        value={`${balance.toLocaleString("ar-SY")} ل.س`}
        icon={Wallet}
        iconColor="text-emerald-400"
        iconBg="from-emerald-500/15 to-emerald-500/5"
        glowClass="glow-green"
        trend={{ value: 0, label: `${transactionsCount.toLocaleString("ar-SY")} عملية`, type: "neutral" }}
      />
      <StatCard
        title="إجمالي عمولات الطلبات"
        value={`${totalCommissions.toLocaleString("ar-SY")} ل.س`}
        icon={ArrowDownRight}
        iconColor="text-blue-400"
        iconBg="from-blue-500/15 to-blue-500/5"
        glowClass="glow-blue"
        trend={{ value: 0, label: "من طلبات المحفظة المكتملة", type: "neutral" }}
      />
      <StatCard
        title="مدفوعات المزودين المنفذة"
        value={`${totalPayouts.toLocaleString("ar-SY")} ل.س`}
        icon={ArrowUpRight}
        iconColor="text-orange-400"
        iconBg="from-orange-500/15 to-orange-500/5"
        trend={{ value: 0, label: "سحوبات مكتملة للمزودين", type: "neutral" }}
      />
      <StatCard
        title="طلبات السحب المعلقة"
        value={`${pendingPayoutsAmount.toLocaleString("ar-SY")} ل.س`}
        icon={Clock3}
        iconColor="text-amber-400"
        iconBg="from-amber-500/15 to-amber-500/5"
        trend={{ value: 0, label: `${payoutsCount.toLocaleString("ar-SY")} طلب بانتظار المعالجة`, type: "neutral" }}
      />
    </div>
  );
}
