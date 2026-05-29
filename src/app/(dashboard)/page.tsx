"use client";

import { useQuery } from "@tanstack/react-query";
import { SyriaMap } from "@/components/ui/syria-map";

// Import new Clean Architecture API Services
import { getPlatformWallet } from "@/infrastructure/services/finance.service";
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
import { OverviewCitiesTable } from "./components/overview-cities-table";
import { OverviewBookingsFeed } from "./components/overview-bookings-feed";

export default function OverviewPage() {
  /* ── Fetching Dashboard Data using React Query ── */
  const { data: dashSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    retry: 1,
  });

  const { data: govData } = useQuery({
    queryKey: ["providers-by-governorate"],
    queryFn: getProvidersByGovernorate,
    retry: 1,
  });

  const { data: serviceData } = useQuery({
    queryKey: ["providers-by-service"],
    queryFn: getProvidersByService,
    retry: 1,
  });

  const { data: growthData } = useQuery({
    queryKey: ["providers-growth"],
    queryFn: () => getProvidersGrowth(),
    retry: 1,
  });

  const { data: topCitiesData } = useQuery({
    queryKey: ["top-cities"],
    queryFn: () => getTopCities(),
    retry: 1,
  });

  const { data: wallet } = useQuery({
    queryKey: ["platform-wallet"],
    queryFn: getPlatformWallet,
    retry: false,
  });

  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-recent-bookings"],
    queryFn: () => getAllBookings(1, 10),
    refetchInterval: 10000,
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
    platformBalance: wallet?.data?.balance ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* 1. Stat Cards KPI Grid */}
      <OverviewStatsRow kpi={kpi} summaryLoading={summaryLoading} />

      {/* 2. Charts Section: Growth and Governorates */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <OverviewGrowthChart growthData={growthData?.data ?? growthData} totalProviders={kpi.totalProviders} />
        <OverviewGovChart govData={govData?.data ?? govData} />
      </div>

      {/* 3. Syria Map Coverage */}
      <SyriaMap />

      {/* 4. Bottom Row: Service Categories, Active Cities, Recent Bookings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <OverviewCategoryChart serviceData={serviceData?.data ?? serviceData} />
        <OverviewCitiesTable topCitiesData={topCitiesData?.data ?? topCitiesData} />
        <OverviewBookingsFeed bookingsResponse={bookingsResponse} bookingsLoading={bookingsLoading} />
      </div>
    </div>
  );
}
