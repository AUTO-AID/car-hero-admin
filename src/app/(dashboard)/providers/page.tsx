"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProviders, approveProvider, rejectProvider } from "@/infrastructure/services/providers.service";
import { getExcelSummary } from "@/infrastructure/services/stats.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Search, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Sub-components
import { ProvidersKpiCards } from "./components/providers-kpi-cards";
import { ProvidersStats } from "./components/providers-stats";
import { ProvidersTable } from "./components/providers-table";
import { ProviderAuditDialog } from "./components/provider-audit-dialog";

export default function ProvidersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("approved");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [auditProvider, setAuditProvider] = useState<any | null>(null);
  const [activeOuterTab, setActiveOuterTab] = useState("list");

  // Fetch real data from backend
  const { data, isLoading } = useQuery({
    queryKey: ["admin-providers", tab, page, searchQuery],
    queryFn: () => getAllProviders(tab, page, 10),
    retry: 1,
  });

  const { data: excelSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["admin-excel-summary"],
    queryFn: getExcelSummary,
    retry: 1,
  });

  const approveMutation = useMutation({
    mutationFn: approveProvider,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] }); 
      toast.success("تم اعتماد وتفعيل حساب مزود الخدمة بنجاح"); 
      setAuditProvider(null);
    },
    onError: () => toast.error("حدث خطأ أثناء اعتماد الملف"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectProvider(id, reason),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] }); 
      toast.error("تم رفض طلب التسجيل وإعلام المزود بالسبب"); 
      setAuditProvider(null);
    },
    onError: () => toast.error("حدث خطأ أثناء تنفيذ عملية الرفض"),
  });

  // Keep the audit honest: if the API fails, show an empty state instead of demo rows.
  const apiProviders = data?.data?.providers || data?.data || data;
  let providersList = Array.isArray(apiProviders) ? apiProviders : [];
  
  if (searchQuery) {
    providersList = providersList.filter((p: any) => 
      p.businessName?.includes(searchQuery) || 
      p.ownerName?.includes(searchQuery) ||
      p.phone?.includes(searchQuery)
    );
  }

  const pendingCount = excelSummary?.SUMMARY?.pendingProviders ?? 0;

  return (
    <div className="space-y-6">
      {/* ───── Page Header ───── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/15 px-5 py-4 rounded-2xl border border-border/30 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">إدارة شؤون المزودين</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">مراجعة وثائق التسجيل، اعتماد الورشات وتفعيل السطحات ميدانياً</p>
          </div>
          
          {/* Outer tabs switcher */}
          <div className="flex h-auto gap-1 rounded-xl border border-border/40 bg-secondary/30 p-1">
            <button
              onClick={() => setActiveOuterTab("list")}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs transition-all font-bold",
                activeOuterTab === "list" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
              )}
            >
              قائمة المزودين
            </button>
            <button
              onClick={() => setActiveOuterTab("stats")}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs transition-all font-bold",
                activeOuterTab === "stats" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
              )}
            >
              إحصائيات وتحليلات
            </button>
          </div>
        </div>
        
        {activeOuterTab === "list" ? (
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 bg-secondary/50 border-border/40 hover:bg-secondary gap-2 text-sm font-bold">
              <Filter className="w-4 h-4 text-muted-foreground" />
              فلاتر متقدمة
            </Button>
            <Button className="h-10 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              <Wrench className="w-4 h-4" />
              إضافة مزود جديد يدوياً
            </Button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-violet-400 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            تحليلات ذكية شاملة
          </span>
        )}
      </div>

      {activeOuterTab === "list" && (
        <>
          {/* ───── Controls Row ───── */}
          <Card className="p-2.5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <Tabs value={tab} onValueChange={(v) => { setTab(v || "approved"); setPage(1); }} className="w-full md:w-auto">
              <TabsList className="bg-background/50 border border-border/30 h-11 p-1 rounded-xl w-full flex">
                <TabsTrigger value="approved" className="flex-1 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">المعتمدون</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg gap-2">
                  طلبات قيد المراجعة
                  {pendingCount > 0 && (
                    <span className="flex items-center justify-center h-4 min-w-4 px-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-500 animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1 text-xs font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">المرفوضون</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              <input 
                type="text" 
                placeholder="بحث بالاسم أو رقم الهاتف..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 bg-background/50 border border-border/40 rounded-xl pr-10 pl-4 text-sm text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </Card>

          {/* ───── Data Table ───── */}
          <ProvidersTable 
            providersList={providersList}
            isLoading={isLoading}
            tab={tab}
            page={page}
            setPage={setPage}
            handleOpenAudit={setAuditProvider}
            totalCount={data?.data?.total || providersList.length}
          />
        </>
      )}

      {activeOuterTab === "stats" && (
        <>
          <ProvidersKpiCards kpis={excelSummary?.KPI_DATA} isLoading={isSummaryLoading} />
          <ProvidersStats summary={excelSummary} isLoading={isSummaryLoading} />
        </>
      )}

      {/* ───── Visual Documents Audit Modal (Dialog) ───── */}
      <ProviderAuditDialog 
        auditProvider={auditProvider}
        onClose={() => setAuditProvider(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
        isApprovePending={approveMutation.isPending}
        isRejectPending={rejectMutation.isPending}
      />
    </div>
  );
}
