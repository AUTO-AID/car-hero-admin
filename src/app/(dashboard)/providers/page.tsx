"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveProvider,
  getAllProviders,
  rejectProvider,
  updateProvider,
  type ProviderFilters,
} from "@/infrastructure/services/providers.service";
import { getExcelSummary } from "@/infrastructure/services/stats.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search, SlidersHorizontal, Wrench, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { ProvidersKpiCards } from "./components/providers-kpi-cards";
import { ProvidersStats } from "./components/providers-stats";
import { ProvidersTable } from "./components/providers-table";
import { ProviderAuditDialog } from "./components/provider-audit-dialog";
import { ProviderEditDialog } from "./components/provider-edit-dialog";

const PAGE_SIZE = 10;

function unwrapProviders(payload: any) {
  const container = payload?.data ?? payload;
  const providers = Array.isArray(container?.providers)
    ? container.providers
    : Array.isArray(container?.data)
      ? container.data
      : Array.isArray(container)
        ? container
        : [];

  return {
    providers,
    pagination: container?.pagination ?? container?.meta ?? payload?.pagination ?? payload?.meta ?? {},
    facets: container?.facets ?? payload?.facets ?? {},
  };
}

function exportCsv(rows: any[]) {
  const header = [
    "businessName",
    "ownerName",
    "phone",
    "city",
    "registrationStatus",
    "isActive",
    "status",
    "orders",
    "completedOrders",
    "rating",
  ];
  const csvRows = rows.map((provider) =>
    header
      .map((key) => {
        const value =
          key === "orders"
            ? provider.actualOrdersCount ?? provider.totalOrders ?? 0
            : key === "completedOrders"
              ? provider.completedOrdersCount ?? 0
              : key === "rating"
                ? provider.computedAverageRating ?? provider.averageRating ?? 0
                : provider[key] ?? "";
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(","),
  );

  const blob = new Blob([[header.join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `providers-page-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ProvidersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [auditProvider, setAuditProvider] = useState<any | null>(null);
  const [editProvider, setEditProvider] = useState<any | null>(null);
  const [activeOuterTab, setActiveOuterTab] = useState("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    isActive: "all",
    runtimeStatus: "all",
    city: "all",
    service: "all",
    emergency: "all",
    minRating: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const queryFilters: ProviderFilters = useMemo(
    () => ({
      status: tab,
      search: searchQuery.trim(),
      ...filters,
    }),
    [filters, searchQuery, tab],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-providers", queryFilters, page],
    queryFn: () => getAllProviders(queryFilters, page, PAGE_SIZE),
    retry: 1,
  });

  const { data: excelSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["admin-excel-summary"],
    queryFn: getExcelSummary,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { providers: providersList, pagination, facets } = unwrapProviders(data);
  const totalCount = Number(pagination?.total ?? providersList.length);
  const totalPages = Number(pagination?.pages ?? Math.ceil(totalCount / PAGE_SIZE));
  const pendingCount = excelSummary?.SUMMARY?.pendingProviders ?? 0;
  const cities = facets?.cities ?? [];
  const services = facets?.services ?? [];

  const approveMutation = useMutation({
    mutationFn: approveProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-excel-summary"] });
      toast.success("تم اعتماد وتفعيل حساب مزود الخدمة بنجاح");
      setAuditProvider(null);
    },
    onError: () => toast.error("حدث خطأ أثناء اعتماد الملف"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectProvider(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-excel-summary"] });
      toast.error("تم رفض طلب التسجيل وإعلام المزود بالسبب");
      setAuditProvider(null);
    },
    onError: () => toast.error("حدث خطأ أثناء تنفيذ عملية الرفض"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateProvider(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-excel-summary"] });
      toast.success("تم تحديث بيانات المزود");
      setEditProvider(null);
    },
    onError: () => toast.error("تعذر تحديث بيانات المزود"),
  });

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      isActive: "all",
      runtimeStatus: "all",
      city: "all",
      service: "all",
      emergency: "all",
      minRating: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPage(1);
  };

  const handleToggleActive = (provider: any) => {
    const isActive = provider.isActive !== false && provider.accountStatus !== "suspended";
    updateMutation.mutate({
      id: provider._id,
      data: {
        isActive: !isActive,
        accountStatus: isActive ? "suspended" : "active",
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/15 px-5 py-4 rounded-2xl border border-border/30 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">إدارة شؤون المزودين</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              مراجعة بيانات الورش والمزودين، اعتماد الطلبات، ومراقبة النشاط والطلبات الفعلية من قاعدة البيانات.
            </p>
          </div>

          <div className="flex h-auto gap-1 rounded-xl border border-border/40 bg-secondary/30 p-1">
            <button
              onClick={() => setActiveOuterTab("list")}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs transition-all font-bold",
                activeOuterTab === "list" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white",
              )}
            >
              قائمة المزودين
            </button>
            <button
              onClick={() => setActiveOuterTab("stats")}
              onMouseEnter={() => void import("echarts-for-react")}
              onFocus={() => void import("echarts-for-react")}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs transition-all font-bold",
                activeOuterTab === "stats" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white",
              )}
            >
              إحصائيات وتحليلات
            </button>
          </div>
        </div>

        {activeOuterTab === "list" ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters((value) => !value)}
              className="h-10 bg-secondary/50 border-border/40 hover:bg-secondary gap-2 text-sm font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              فلاتر متقدمة
            </Button>
            <Button
              variant="outline"
              onClick={() => exportCsv(providersList)}
              disabled={providersList.length === 0}
              className="h-10 bg-secondary/50 border-border/40 hover:bg-secondary gap-2 text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              تصدير الصفحة
            </Button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-violet-400 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            تحليلات مباشرة من قاعدة البيانات
          </span>
        )}
      </div>

      {activeOuterTab === "list" && (
        <>
          <Card className="p-2.5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Tabs
                value={tab}
                onValueChange={(value) => {
                  setTab(value || "approved");
                  setPage(1);
                }}
                className="w-full md:w-auto"
              >
                <TabsList className="bg-background/50 border border-border/30 h-11 p-1 rounded-xl w-full flex">
                  <TabsTrigger value="approved" className="flex-1 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">
                    المعتمدون
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex-1 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg gap-2">
                    قيد المراجعة
                    {pendingCount > 0 && (
                      <span className="flex items-center justify-center h-4 min-w-4 px-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-500 animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex-1 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">
                    المرفوضون
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full md:max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الهاتف أو المدينة أو الخدمة..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  className="w-full h-11 bg-background/50 border border-border/40 rounded-xl pr-10 pl-4 text-sm text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-8 gap-2 border-t border-border/20 pt-3">
                <Select value={filters.isActive} onValueChange={(value) => updateFilter("isActive", value || "all")}>
                  <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                    <SelectValue placeholder="حالة الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحسابات</SelectItem>
                    <SelectItem value="true">نشط</SelectItem>
                    <SelectItem value="false">موقوف</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.runtimeStatus} onValueChange={(value) => updateFilter("runtimeStatus", value || "all")}>
                  <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                    <SelectValue placeholder="حالة الاتصال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الحالات</SelectItem>
                    <SelectItem value="online">متصل</SelectItem>
                    <SelectItem value="busy">مشغول</SelectItem>
                    <SelectItem value="offline">غير متصل</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.city} onValueChange={(value) => updateFilter("city", value || "all")}>
                  <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                    <SelectValue placeholder="المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المدن</SelectItem>
                    {cities.map((city: any) => (
                      <SelectItem key={city._id} value={city._id}>
                        {city._id} ({city.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.service} onValueChange={(value) => updateFilter("service", value || "all")}>
                  <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                    <SelectValue placeholder="الخدمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الخدمات</SelectItem>
                    {services.map((service: any) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service._id} ({service.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.emergency} onValueChange={(value) => updateFilter("emergency", value || "all")}>
                  <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                    <SelectValue placeholder="الطوارئ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المزودين</SelectItem>
                    <SelectItem value="true">طوارئ فقط</SelectItem>
                    <SelectItem value="false">غير طوارئ</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={filters.minRating}
                  onChange={(event) => updateFilter("minRating", event.target.value)}
                  placeholder="أدنى تقييم"
                  className="h-10 bg-background/60 border-border/40 text-xs"
                />

                <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value || "createdAt")}>
                  <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                    <SelectValue placeholder="الترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">تاريخ التسجيل</SelectItem>
                    <SelectItem value="businessName">الاسم</SelectItem>
                    <SelectItem value="rating">التقييم</SelectItem>
                    <SelectItem value="orders">إجمالي الطلبات</SelectItem>
                    <SelectItem value="completedOrders">الطلبات المكتملة</SelectItem>
                    <SelectItem value="revenue">الإيراد المكتمل</SelectItem>
                    <SelectItem value="city">المدينة</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value === "asc" ? "asc" : "desc")}>
                    <SelectTrigger className="w-full h-10 bg-background/60 border-border/40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">تنازلي</SelectItem>
                      <SelectItem value="asc">تصاعدي</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={resetFilters} className="h-10 w-10 shrink-0 bg-background/60 border-border/40" title="مسح الفلاتر">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <ProvidersTable
            providersList={providersList}
            isLoading={isLoading}
            isError={isError}
            tab={tab}
            page={page}
            setPage={setPage}
            handleOpenAudit={setAuditProvider}
            onEditProvider={setEditProvider}
            onToggleActive={handleToggleActive}
            isUpdating={updateMutation.isPending}
            totalCount={totalCount}
            totalPages={totalPages}
          />
        </>
      )}

      {activeOuterTab === "stats" && (
        <>
          <ProvidersKpiCards kpis={excelSummary?.KPI_DATA} isLoading={isSummaryLoading} />
          <ProvidersStats summary={excelSummary} isLoading={isSummaryLoading} />
        </>
      )}

      <ProviderAuditDialog
        auditProvider={auditProvider}
        onClose={() => setAuditProvider(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
        isApprovePending={approveMutation.isPending}
        isRejectPending={rejectMutation.isPending}
      />

      <ProviderEditDialog
        provider={editProvider}
        onClose={() => setEditProvider(null)}
        onSave={(id, formData) => updateMutation.mutate({ id, data: formData })}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
