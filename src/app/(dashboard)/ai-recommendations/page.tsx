/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Brain, Download, RefreshCw, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AiAnalyticsFilters, exportAiRecommendationLogs, getAiRecommendationCityPerformance,
  getAiRecommendationFilters, getAiRecommendationLogs, getAiRecommendationServicePerformance,
  getAiRecommendationSummary, getAiRecommendationTopProviders, retrainAiModel,
} from "@/infrastructure/services/ai-recommendations.service";
import { AiCityPerformance } from "./components/ai-city-performance";
import { AiConfidenceTrend } from "./components/ai-confidence-trend";
import { AiDailyTrend } from "./components/ai-daily-trend";
import { AiKpiCards } from "./components/ai-kpi-cards";
import { AiModelDist } from "./components/ai-model-dist";
import { AiServicePerformance } from "./components/ai-service-performance";
import { AiTopProviders } from "./components/ai-top-providers";

const unwrap = (value: any) => value?.data ?? value ?? {};
const serviceNames: Record<string, string> = { towing: "سطحة / سحب", tire: "إطارات", battery: "بطارية", fuel: "وقود", locksmith: "فتح أقفال", mechanical: "ميكانيك", electrical: "كهرباء" };
const useAnalyticsQuery = (key: string, filters: AiAnalyticsFilters, fn: () => Promise<any>) =>
  useQuery({ queryKey: ["ai-recommendations", key, filters], queryFn: fn, retry: 1 });

export default function AiRecommendationsDashboard() {
  const [period, setPeriod] = useState<AiAnalyticsFilters["period"]>("all");
  const [city, setCity] = useState("all");
  const [serviceCategory, setServiceCategory] = useState("all");
  const [modelType, setModelType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const filters = { period, city, serviceCategory, modelType, status };
  const logFilters = { ...filters, search: deferredSearch.trim(), page, limit: 10 };
  const summaryQ = useAnalyticsQuery("summary", filters, () => getAiRecommendationSummary(filters));
  const providersQ = useAnalyticsQuery("providers", filters, () => getAiRecommendationTopProviders(filters));
  const servicesQ = useAnalyticsQuery("services", filters, () => getAiRecommendationServicePerformance(filters));
  const citiesQ = useAnalyticsQuery("cities", filters, () => getAiRecommendationCityPerformance(filters));
  const filterQ = useQuery({ queryKey: ["ai-recommendations", "filters"], queryFn: getAiRecommendationFilters });
  const logsQ = useQuery({ queryKey: ["ai-recommendations", "logs", logFilters], queryFn: () => getAiRecommendationLogs(logFilters), retry: 1 });
  const retrain = useMutation({ mutationFn: retrainAiModel, onSuccess: (response) => { const result=unwrap(response); const message=String(result.message??"اكتملت عملية إعادة التدريب"); if(message.includes("reload request failed")) toast.warning("تم التدريب، لكن خدمة الاستدلال غير متاحة لإعادة التحميل"); else toast.success("اكتملت عملية إعادة التدريب وإعادة التحميل"); }, onError: () => toast.error("تعذر تشغيل إعادة التدريب") });
  const summary = unwrap(summaryQ.data);
  const options = unwrap(filterQ.data);
  const logs = unwrap(logsQ.data);
  const loading = summaryQ.isLoading || providersQ.isLoading || servicesQ.isLoading || citiesQ.isLoading;
  const refresh = () => { summaryQ.refetch(); providersQ.refetch(); servicesQ.refetch(); citiesQ.refetch(); logsQ.refetch(); };
  const reset = () => { setPeriod("all"); setCity("all"); setServiceCategory("all"); setModelType("all"); setStatus("all"); setSearch(""); setPage(1); };
  const download = async () => {
    try {
      const blob = await exportAiRecommendationLogs({ ...filters, search: deferredSearch.trim() });
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `ai-recommendations-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
      toast.success("تم تصدير السجل المفلتر");
    } catch { toast.error("تعذر تصدير السجل"); }
  };
  const update = (setter: (value: any) => void) => (value: any) => { setter(value ?? "all"); setPage(1); };

  return <div className="space-y-5 pb-10" dir="rtl">
    <div className="flex flex-col gap-4 border-b border-border/30 bg-secondary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="flex items-center gap-2 text-lg font-bold text-white"><Brain className="h-5 w-5 text-rose-400" /> تحليلات الذكاء الاصطناعي</h1><p className="mt-1 text-xs text-muted-foreground">قياس جودة نظام توصية مزودي الخدمة من سجلات قاعدة البيانات الفعلية</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={download}><Download /> تصدير CSV</Button><Button variant="outline" onClick={refresh} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> تحديث</Button><Button onClick={() => retrain.mutate()} disabled={retrain.isPending}><Sparkles /> إعادة تدريب النموذج</Button></div>
    </div>
    <Card className="p-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-white"><SlidersHorizontal className="h-4 w-4 text-primary" /> فلاتر التحليل</div><div className="grid gap-2 md:grid-cols-5">
      <Filter value={period ?? "all"} onChange={update(setPeriod)} items={[["all","كل الفترات"],["30d","آخر 30 يوما"],["90d","آخر 90 يوما"],["365d","آخر سنة"]]} />
      <Filter value={city} onChange={update(setCity)} items={[["all","كل المدن"],...(options.cities ?? []).map((v:string)=>[v,v])]} />
      <Filter value={serviceCategory} onChange={update(setServiceCategory)} items={[["all","كل الخدمات"],...(options.serviceCategories ?? []).map((v:string)=>[v,serviceNames[v] ?? v])]} />
      <Filter value={modelType} onChange={update(setModelType)} items={[["all","كل النماذج"],...(options.modelTypes ?? []).map((v:string)=>[v,v])]} />
      <Filter value={status} onChange={update(setStatus)} items={[["all","كل الحالات"],["success","ناجحة"],["failed","فاشلة"]]} />
    </div><Button variant="ghost" size="sm" className="mt-2" onClick={reset}>مسح الفلاتر</Button></Card>
    <AiKpiCards isLoading={loading} totalRecommendations={summary.totalRecommendations ?? 0} successRate={summary.successRate ?? 0} averageConfidence={summary.averageConfidence ?? 0} failedRecommendations={summary.failedRecommendations ?? 0} />
    <div className="grid gap-5 lg:grid-cols-3"><AiModelDist isLoading={loading} modelTypeDistribution={summary.modelTypeDistribution ?? []} /><AiConfidenceTrend isLoading={loading} confidenceTrend={summary.confidenceTrend ?? []} /></div>
    <div className="grid gap-5 lg:grid-cols-2"><AiServicePerformance isLoading={loading} servicePerformance={unwrap(servicesQ.data).servicePerformance ?? []} /><AiCityPerformance isLoading={loading} cityPerformance={unwrap(citiesQ.data).cityPerformance ?? []} /></div>
    <AiDailyTrend isLoading={loading} dailyTrend={summary.dailyTrend ?? []} />
    <AiTopProviders isLoading={loading} topProviders={unwrap(providersQ.data).topProviders ?? []} />
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-border/30 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold text-white">سجل طلبات التوصية</h3><p className="mt-1 text-xs text-muted-foreground">تفصيل قابل للبحث للمراجعة والتدقيق</p></div><div className="relative sm:w-72"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="ابحث بالمدينة أو الخدمة أو النموذج" className="pr-9" /></div></div>
      <div className="overflow-x-auto"><table className="w-full text-right text-xs"><thead className="bg-secondary/20 text-muted-foreground"><tr>{["التاريخ","المدينة","الخدمة","النموذج","الحالة","المرشحون","النتائج","تم الاختيار"].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{logsQ.isLoading?<tr><td colSpan={8} className="p-6 text-center text-muted-foreground">جاري التحميل...</td></tr>:(logs.logs ?? []).map((row:any)=><tr key={row.id} className="border-t border-border/20"><td className="px-4 py-3" dir="ltr">{new Date(row.date).toLocaleDateString("ar-SY")}</td><td className="px-4 py-3">{row.city}</td><td className="px-4 py-3">{serviceNames[row.serviceCategory] ?? row.serviceCategory}</td><td className="px-4 py-3">{row.modelType} {row.modelVersion}</td><td className={`px-4 py-3 ${row.status==="success"?"text-emerald-400":"text-rose-400"}`}>{row.status==="success"?"ناجحة":"فاشلة"}</td><td className="px-4 py-3">{row.candidateCount}</td><td className="px-4 py-3">{row.recommendationCount}</td><td className="px-4 py-3">{row.chosenProvider?"نعم":"لا"}</td></tr>)}{!logsQ.isLoading && !(logs.logs ?? []).length && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">لا توجد سجلات مطابقة للفلاتر</td></tr>}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-border/30 p-3 text-xs text-muted-foreground"><span>{logs.pagination?.total ?? 0} سجل</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(page-1)}>السابق</Button><span className="px-2 py-1">{page} / {logs.pagination?.pages || 1}</span><Button variant="outline" size="sm" disabled={page>=(logs.pagination?.pages||1)} onClick={()=>setPage(page+1)}>التالي</Button></div></div>
    </Card>
  </div>;
}

function Filter({ value, onChange, items }: { value: string; onChange: (value: string | null) => void; items: string[][] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{items.map(([id,label])=><SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select>;
}
