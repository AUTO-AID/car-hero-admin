"use client";

import { Users, Crown, Shield } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface UsersStatsProps {
  total: number;
  premiumCount: number;
  activeCount: number;
}

export default function UsersStats({ total, premiumCount, activeCount }: UsersStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
      <StatCard 
        title="إجمالي العملاء" 
        value={total.toLocaleString("ar-SA")} 
        icon={Users}
        iconColor="text-blue-400" 
        iconBg="from-blue-500/15 to-blue-500/5" 
        glowClass="glow-blue" 
      />
      <StatCard 
        title="مشتركو Premium" 
        value={premiumCount.toLocaleString("ar-SA")}
        icon={Crown} 
        iconColor="text-amber-400" 
        iconBg="from-amber-500/15 to-amber-500/5" 
        glowClass="glow-amber"
        trend={{
          value: total ? Math.round((premiumCount / total) * 100) : 0,
          label: "نسبة من المشتركين"
        }}
      />
      <StatCard 
        title="حسابات فعالة" 
        value={activeCount.toLocaleString("ar-SA")}
        icon={Shield} 
        iconColor="text-emerald-400" 
        iconBg="from-emerald-500/15 to-emerald-500/5" 
        glowClass="glow-green" 
      />
    </div>
  );
}
