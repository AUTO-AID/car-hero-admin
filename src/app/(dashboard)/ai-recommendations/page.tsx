"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Brain, RefreshCw } from "lucide-react";

// Import new Clean Architecture API Services
import {
  getAiRecommendationSummary,
  getAiRecommendationTopProviders,
  getAiRecommendationServicePerformance,
  getAiRecommendationCityPerformance
} from "@/infrastructure/services/ai-recommendations.service";

// Import modularized components
import { AiKpiCards } from "./components/ai-kpi-cards";
import { AiModelDist } from "./components/ai-model-dist";
import { AiConfidenceTrend } from "./components/ai-confidence-trend";
import { AiServicePerformance } from "./components/ai-service-performance";
import { AiCityPerformance } from "./components/ai-city-performance";
import { AiDailyTrend } from "./components/ai-daily-trend";
import { AiTopProviders } from "./components/ai-top-providers";

export default function AiRecommendationsDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Fetch summary
  const { 
    data: summaryData, 
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ["ai-recommendations-summary"],
    queryFn: getAiRecommendationSummary,
    retry: 1,
  });

  // Fetch top providers
  const { 
    data: topProvidersData, 
    isLoading: isTopProvidersLoading,
    refetch: refetchTopProviders
  } = useQuery({
    queryKey: ["ai-recommendations-top-providers"],
    queryFn: () => getAiRecommendationTopProviders(10),
    retry: 1,
  });

  // Fetch service performance
  const { 
    data: serviceData, 
    isLoading: isServiceLoading,
    refetch: refetchService
  } = useQuery({
    queryKey: ["ai-recommendations-service-performance"],
    queryFn: getAiRecommendationServicePerformance,
    retry: 1,
  });

  // Fetch city performance
  const { 
    data: cityData, 
    isLoading: isCityLoading,
    refetch: refetchCity
  } = useQuery({
    queryKey: ["ai-recommendations-city-performance"],
    queryFn: getAiRecommendationCityPerformance,
    retry: 1,
  });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchTopProviders();
    refetchService();
    refetchCity();
  };

  if (!isMounted) return null;

  const summary = summaryData?.data ?? summaryData ?? {};
  const topProviders = topProvidersData?.topProviders ?? topProvidersData?.data?.topProviders ?? [];
  const servicePerformance = serviceData?.servicePerformance ?? serviceData?.data?.servicePerformance ?? [];
  const cityPerformance = cityData?.cityPerformance ?? cityData?.data?.cityPerformance ?? [];

  const totalRecommendations = summary.totalRecommendations ?? 0;
  const successRate = summary.successRate ?? 0;
  const averageConfidence = summary.averageConfidence ?? 0;
  const failedRecommendations = summary.failedRecommendations ?? 0;
  const modelTypeDistribution = summary.modelTypeDistribution ?? [];
  const dailyTrend = summary.dailyTrend ?? [];
  const confidenceTrend = summary.confidenceTrend ?? [];

  const isLoading = isSummaryLoading || isTopProvidersLoading || isServiceLoading || isCityLoading;

  return (
    <div className="space-y-6 w-full pb-10" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 shadow-md">
            <Brain className="w-6 h-6 text-rose-400 animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">تحليلات الذكاء الاصطناعي</h1>
            <p className="text-sm text-muted-foreground mt-1">رصد وتحليل كفاءة نظام التوصيات الذكي لمزودي الخدمة</p>
          </div>
        </div>
        <button 
          onClick={handleRefreshAll}
          disabled={isLoading}
          className="flex items-center gap-2 bg-secondary/80 border border-border/60 hover:bg-secondary text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </button>
      </div>

      {/* KPI Cards */}
      <AiKpiCards
        isLoading={isLoading}
        totalRecommendations={totalRecommendations}
        successRate={successRate}
        averageConfidence={averageConfidence}
        failedRecommendations={failedRecommendations}
      />

      {/* Model Distribution & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AiModelDist isLoading={isLoading} modelTypeDistribution={modelTypeDistribution} />
        <AiConfidenceTrend isLoading={isLoading} confidenceTrend={confidenceTrend} />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiServicePerformance isLoading={isLoading} servicePerformance={servicePerformance} />
        <AiCityPerformance isLoading={isLoading} cityPerformance={cityPerformance} />
      </div>

      {/* Daily trend over last 30 days */}
      <AiDailyTrend isLoading={isLoading} dailyTrend={dailyTrend} />

      {/* Top recommended providers table */}
      <AiTopProviders isLoading={isLoading} topProviders={topProviders} />
    </div>
  );
}
