"use client";
import { Activity, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
export function AiKpiCards({isLoading,totalRecommendations,successRate,averageConfidence,failedRecommendations}:{isLoading:boolean;totalRecommendations:number;successRate:number;averageConfidence:number;failedRecommendations:number}) {
 return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard title="إجمالي طلبات التوصية" value={isLoading?"...":totalRecommendations.toLocaleString("ar-SY")} subtitle="طلبات مسجلة في قاعدة البيانات" icon={Activity} iconColor="text-violet-400" iconBg="from-violet-500/15 to-violet-500/5" loading={isLoading}/>
  <StatCard title="نسبة نجاح التوصيات" value={isLoading?"...":`${successRate}%`} subtitle="طلبات أنتجت توصيات صالحة" icon={CheckCircle2} iconColor="text-emerald-400" iconBg="from-emerald-500/15 to-emerald-500/5" loading={isLoading}/>
  <StatCard title="متوسط ثقة النموذج" value={isLoading?"...":`${(averageConfidence*100).toFixed(1)}%`} subtitle="متوسط الثقة في النتائج المقترحة" icon={Sparkles} iconColor="text-amber-400" iconBg="from-amber-500/15 to-amber-500/5" loading={isLoading}/>
  <StatCard title="الطلبات الفاشلة" value={isLoading?"...":failedRecommendations.toLocaleString("ar-SY")} subtitle="طلبات لم تنتج مزودين مطابقين" icon={AlertTriangle} iconColor="text-rose-400" iconBg="from-rose-500/15 to-rose-500/5" loading={isLoading}/>
 </div>;
}
