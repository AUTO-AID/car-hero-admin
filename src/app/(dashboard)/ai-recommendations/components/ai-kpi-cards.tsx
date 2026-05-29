"use client";

import { Activity, CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface AiKpiCardsProps {
  isLoading: boolean;
  totalRecommendations: number;
  successRate: number;
  averageConfidence: number;
  failedRecommendations: number;
}

export function AiKpiCards({
  isLoading,
  totalRecommendations,
  successRate,
  averageConfidence,
  failedRecommendations,
}: AiKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="إجمالي طلبات التوصية"
        value={isLoading ? "..." : totalRecommendations.toLocaleString("ar-EG")}
        subtitle="توصيات النظام الكلية"
        icon={Activity}
        iconColor="text-violet-400"
        iconBg="from-violet-500/15 to-violet-500/5"
        loading={isLoading}
      />
      <StatCard
        title="نسبة نجاح التوصيات"
        value={isLoading ? "..." : `${successRate}%`}
        subtitle="توصية ناجحة من إجمالي الطلبات"
        icon={CheckCircle2}
        iconColor="text-emerald-400"
        iconBg="from-emerald-500/15 to-emerald-500/5"
        loading={isLoading}
        trend={{
          value: successRate >= 90 ? 1 : 0,
          label: successRate >= 90 ? "أداء ممتاز" : "يحتاج لمراقبة",
          customValue: successRate >= 90 ? "ممتاز" : "مقبول",
          type: successRate >= 90 ? "up" : "neutral"
        }}
      />
      <StatCard
        title="متوسط ثقة النموذج"
        value={isLoading ? "..." : `${(averageConfidence * 100).toFixed(1)}%`}
        subtitle="معدل ثقة الذكاء الاصطناعي"
        icon={Sparkles}
        iconColor="text-amber-400"
        iconBg="from-amber-500/15 to-amber-500/5"
        loading={isLoading}
      />
      <StatCard
        title="التوصيات الفاشلة"
        value={isLoading ? "..." : failedRecommendations.toLocaleString("ar-EG")}
        subtitle="طلبات لم تجد مزودين متطابقين"
        icon={AlertTriangle}
        iconColor="text-rose-400"
        iconBg="from-rose-500/15 to-rose-500/5"
        loading={isLoading}
        trend={{
          value: failedRecommendations,
          label: "حالات تراجع (Fallback)",
          customValue: failedRecommendations > 0 ? `${((failedRecommendations / (totalRecommendations || 1)) * 100).toFixed(1)}%` : "0%",
          type: failedRecommendations > (totalRecommendations * 0.1) ? "down" : "neutral"
        }}
      />
    </div>
  );
}
