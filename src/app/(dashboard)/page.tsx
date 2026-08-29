"use client";

import { useQuery } from "@tanstack/react-query";
import { LazySyriaMap } from "@/components/ui/lazy-syria-map";
import { SectionHeader } from "@/components/ui/section-header";
import { Activity, BarChart3, MapPinned, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import new Clean Architecture API Services
import { getAllBookings } from "@/infrastructure/services/bookings.service";
import {
  getDashboardSummary,
  getProvidersByGovernorate,
  getProvidersByService,
  getProvidersGrowth,
  getTopCities,
} from "@/infrastructure/services/stats.service";

// Import modularized presentation components
import { OverviewStatsRow } from "./components/overview-stats-row";
import { OverviewGrowthChart } from "./components/overview-growth-chart";
import { OverviewGovChart } from "./components/overview-gov-chart";
import { OverviewCategoryChart } from "./components/overview-category-chart";
import { OverviewFunnelChart } from "./components/overview-funnel-chart";
import { OverviewRevenueChart } from "./components/overview-revenue-chart";
import { OverviewCitiesTable } from "./components/overview-cities-table";
import { OverviewBookingsFeed } from "./components/overview-bookings-feed";
import { queryKeys } from "@/infrastructure/query/query-keys";

export default function OverviewPage() {
  /* ── Fetching Dashboard Data using React Query ── */
  const { data: dashSummary, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: getDashboardSummary,
    retry: 1,
  });

  const { data: govData, isLoading: govLoading, isError: govError, refetch: refetchGov } = useQuery({
    queryKey: queryKeys.dashboard.providersByGovernorate,
    queryFn: getProvidersByGovernorate,
    enabled: !summaryLoading,
    retry: 1,
  });

  const { data: serviceData, isLoading: serviceLoading, isError: serviceError, refetch: refetchService } = useQuery({
    queryKey: queryKeys.dashboard.providersByService,
    queryFn: getProvidersByService,
    enabled: !summaryLoading,
    retry: 1,
  });

  const { data: growthData, isLoading: growthLoading, isError: growthError, refetch: refetchGrowth } = useQuery({
    queryKey: queryKeys.dashboard.providersGrowth,
    queryFn: () => getProvidersGrowth(),
    enabled: !summaryLoading,
    retry: 1,
  });

  const { data: topCitiesData, isLoading: citiesLoading } = useQuery({
    queryKey: queryKeys.dashboard.topCities,
    queryFn: () => getTopCities(),
    enabled: !summaryLoading,
    retry: 1,
  });

  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: queryKeys.dashboard.recentBookings,
    queryFn: () => getAllBookings(1, 10),
    enabled: !summaryLoading,
    refetchInterval: 60_000,
    retry: 1,
  });

  /* ── Normalizing Summary KPI values ── */
  const summary = dashSummary?.data ?? dashSummary ?? {};
  const provSummary = summary?.providers ?? {};

  const kpi = {
    totalProviders: provSummary.total ?? 0,
    approvedProviders: provSummary.approved ?? 0,
    pendingProviders: provSummary.pending ?? 0,
    rejectedProviders: provSummary.rejected ?? 0,
    totalUsers: summary?.users?.total ?? 0,
    totalOrders: summary?.orders?.total ?? 0,
    totalRevenue: summary?.revenue?.total ?? 0,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">الرئيسية</h1>
            <p className="text-sm text-muted-foreground mt-1">نظرة عامة على أداء المنصة ونشاط المستخدمين</p>
          </div>
          <TabsList className="bg-card/50 backdrop-blur-md border border-border/40 p-1 rounded-xl h-auto">
            <TabsTrigger value="overview" className="rounded-lg px-6 py-2.5 font-semibold text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all">نظرة عامة</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6 py-2.5 font-semibold text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all">التحليلات</TabsTrigger>
            <TabsTrigger value="live" className="rounded-lg px-6 py-2.5 font-semibold text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all">النشاط الحي</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-10 outline-none animate-in fade-in duration-500">
          <section>
            <SectionHeader title="مؤشرات الأداء" icon={<Activity className="w-5 h-5" />} />
            <OverviewStatsRow kpi={kpi} summaryLoading={summaryLoading} />
          </section>

          <section>
            <SectionHeader title="معدل النمو" icon={<BarChart3 className="w-5 h-5" />} />
            <OverviewGrowthChart 
              growthData={growthData?.data ?? growthData} 
              totalProviders={kpi.totalProviders} 
              isLoading={growthLoading}
              isError={growthError}
              onRetry={refetchGrowth}
            />
          </section>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-10 outline-none animate-in fade-in duration-500">
          <section>
            <SectionHeader title="المخططات التحليلية" icon={<BarChart3 className="w-5 h-5" />} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <OverviewGovChart 
                govData={govData?.data ?? govData} 
                isLoading={govLoading}
                isError={govError}
                onRetry={refetchGov}
              />
              <OverviewCategoryChart 
                serviceData={serviceData?.data ?? serviceData} 
                isLoading={serviceLoading}
                isError={serviceError}
                onRetry={refetchService}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OverviewFunnelChart />
              <OverviewRevenueChart />
            </div>
          </section>

          <section>
            <SectionHeader title="خريطة التغطية" icon={<MapPinned className="w-5 h-5" />} />
            <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden shadow-xl shadow-black/20 relative max-w-5xl mx-auto">
              <LazySyriaMap govCounts={govData?.data ?? govData} />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="live" className="space-y-10 outline-none animate-in fade-in duration-500">
          <section>
            <SectionHeader title="المتابعة الحية" icon={<Zap className="w-5 h-5" />} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OverviewBookingsFeed bookingsResponse={bookingsResponse} bookingsLoading={bookingsLoading} />
              <OverviewCitiesTable topCitiesData={topCitiesData?.data ?? topCitiesData} isLoading={citiesLoading} />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
