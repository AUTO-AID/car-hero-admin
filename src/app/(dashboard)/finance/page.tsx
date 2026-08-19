"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart2, Download, RotateCcw, Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  approvePayout,
  getAllTransactions,
  getPayoutRequests,
  getPlatformWallet,
  type WalletTransactionFilters,
} from "@/infrastructure/services/finance.service";
import FinanceCharts from "./components/finance-charts";
import FinanceStats from "./components/finance-stats";
import PayoutRequests from "./components/payout-requests";
import TransactionsTable, { type WalletTransaction } from "./components/transactions-table";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { TablePagination } from "@/components/ui/table-pagination";

const defaultFilters: Required<Pick<WalletTransactionFilters, "search" | "type" | "status" | "ownerType" | "referenceType" | "dateFrom" | "dateTo" | "amountMin" | "amountMax" | "sortBy" | "sortOrder">> = {
  search: "",
  type: "all",
  status: "all",
  ownerType: "all",
  referenceType: "all",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const typeLabels: Record<string, string> = {
  all: "كل الأنواع",
  credit: "إيداع",
  debit: "سحب",
  refund: "استرداد",
};

const transactionStatusLabels: Record<string, string> = {
  all: "كل الحالات",
  pending: "معلق",
  completed: "مكتمل",
  failed: "فشل",
  reversed: "معكوس",
};

const ownerTypeLabels: Record<string, string> = {
  all: "كل المالكين",
  user: "عملاء",
  provider: "مزودون",
  system: "النظام",
};

const referenceTypeLabels: Record<string, string> = {
  all: "كل المراجع",
  order: "طلبات",
  topup: "شحن",
  "payout,withdrawal": "سحوبات",
  payout_reversal: "إرجاع سحب",
};

const financeSortByLabels: Record<string, string> = {
  createdAt: "التاريخ",
  amount: "المبلغ",
  status: "الحالة",
  type: "النوع",
};

const sortOrderLabels: Record<string, string> = {
  desc: "تنازلي",
  asc: "تصاعدي",
};

const payoutStatusLabels: Record<string, string> = {
  pending: "طلبات معلقة",
  completed: "منفذة",
  failed: "مرفوضة",
  all: "كل الطلبات",
};

const unwrapList = (payload: any) => {
  const body = payload?.data && (Array.isArray(payload.data) || payload.data.data) ? payload.data : payload;
  const data = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  const pagination = body?.pagination || {
    page: 1,
    limit: data.length,
    total: body?.total ?? data.length,
    totalPages: Math.max(1, Math.ceil((body?.total ?? data.length) / Math.max(data.length, 1))),
  };
  return { data, pagination, total: body?.total ?? pagination.total ?? data.length };
};

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (rows: WalletTransaction[], filename: string) => {
  const header = ["رقم العملية", "المالك", "نوع المالك", "النوع", "التصنيف", "المبلغ", "الحالة", "طريقة الدفع", "المرجع", "التاريخ", "الوصف"];
  const csvRows = rows.map((tx) => [
    tx.transactionNumber || tx._id || tx.id,
    tx.ownerName || tx.providerName,
    tx.ownerType,
    tx.type,
    tx.referenceType,
    tx.amount,
    tx.status,
    tx.paymentMethod,
    tx.referenceId,
    tx.createdAt ? new Date(tx.createdAt).toISOString() : "",
    tx.description,
  ].map(csvCell).join(","));
  const blob = new Blob(["\ufeff", [header.map(csvCell).join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function FinancePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutStatus, setPayoutStatus] = useState("pending");
  const [filters, setFilters] = useState(defaultFilters);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const queryFilters = useMemo(() => ({ ...filters }), [filters]);

  const walletQuery = useQuery({
    queryKey: queryKeys.finance.platformWallet,
    queryFn: getPlatformWallet,
    retry: false,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.finance.transactions(page, queryFilters),
    queryFn: () => getAllTransactions(page, 15, queryFilters),
  });

  const chartQuery = useQuery({
    queryKey: queryKeys.finance.transactionsChart(queryFilters.dateFrom, queryFilters.dateTo),
    queryFn: () => getAllTransactions(1, 500, {
      dateFrom: queryFilters.dateFrom,
      dateTo: queryFilters.dateTo,
      sortBy: "createdAt",
      sortOrder: "asc",
    }),
  });

  const payoutsQuery = useQuery({
    queryKey: queryKeys.finance.payouts(payoutPage, payoutStatus),
    queryFn: () => getPayoutRequests(payoutPage, 10, payoutStatus),
  });

  const walletData = walletQuery.data?.data?.data ?? walletQuery.data?.data ?? {};
  const wallet = {
    balance: Number(walletData.platformBalance ?? walletData.balance ?? 0),
    totalCommissions: Number(walletData.totalCommissionEarned ?? 0),
    totalPayouts: Number(walletData.totalPayoutsProcessed ?? 0),
    pendingPayoutsAmount: Number(walletData.pendingPayoutsAmount ?? 0),
    pendingPayoutsCount: Number(walletData.pendingPayoutsCount ?? 0),
    transactionsCount: Number(walletData.transactionsCount ?? 0),
  };

  const transactionsResult = unwrapList(transactionsQuery.data);
  const transactions = transactionsResult.data as WalletTransaction[];
  const chartTransactions = unwrapList(chartQuery.data).data as WalletTransaction[];
  const payoutsResult = unwrapList(payoutsQuery.data);
  const payouts = payoutsResult.data as any[];

  const payoutMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "complete" | "reject" }) => {
      const note = action === "reject" ? "تم الرفض من لوحة الإدارة" : "تم التحويل من لوحة الإدارة";
      return approvePayout(id, action, note);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(vars.action === "complete" ? "تم تحويل الدفعة بنجاح" : "تم رفض طلب السحب وإرجاع المبلغ");
      setApprovingId(null);
    },
    onError: () => {
      toast.error("فشلت العملية، حاول مرة أخرى");
      setApprovingId(null);
    },
  });

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const handleApprovePayout = (id: string, action: "complete" | "reject") => {
    if (!id) return;
    setApprovingId(id);
    payoutMut.mutate({ id, action });
  };

  return (
    <div className="space-y-6">
      <FinanceStats
        balance={wallet.balance}
        totalCommissions={wallet.totalCommissions}
        totalPayouts={wallet.totalPayouts}
        pendingPayoutsAmount={wallet.pendingPayoutsAmount}
        payoutsCount={wallet.pendingPayoutsCount}
        transactionsCount={wallet.transactionsCount}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-secondary/30 border border-border/40 h-11 p-1 rounded-xl w-full sm:w-auto inline-flex mb-6">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-card rounded-lg px-6 gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="flow" className="text-xs data-[state=active]:bg-card rounded-lg px-6 gap-2">
            <BarChart2 className="w-3.5 h-3.5" /> التدفق المالي
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs data-[state=active]:bg-card rounded-lg px-6 gap-2">
            سجل العمليات
          </TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs data-[state=active]:bg-card rounded-lg px-6 gap-2">
            طلبات السحب
            {wallet.pendingPayoutsCount > 0 && (
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500 text-xs font-bold text-amber-950">
                {wallet.pendingPayoutsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <Card className="p-6 mb-6 bg-card border-border/40">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-white">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            فلاتر المحفظة
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
            <div className="relative xl:col-span-2">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <Input
                value={filters.search}
                onChange={(event) => setFilter("search", event.target.value)}
                placeholder="بحث بالعملية، المالك، الوصف أو المرجع..."
                className="h-9 ps-9 bg-background/80 border-border/40 text-xs"
              />
            </div>
            <Select value={filters.type} onValueChange={(value) => setFilter("type", value || "all")}>
              <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="النوع" value={typeLabels[filters.type] ?? filters.type} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                <SelectItem value="credit">إيداع</SelectItem>
                <SelectItem value="debit">سحب</SelectItem>
                <SelectItem value="refund">استرداد</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilter("status", value || "all")}>
              <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="الحالة" value={transactionStatusLabels[filters.status] ?? filters.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
                <SelectItem value="reversed">معكوس</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.ownerType} onValueChange={(value) => setFilter("ownerType", value || "all")}>
              <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="المالك" value={ownerTypeLabels[filters.ownerType] ?? filters.ownerType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المالكين</SelectItem>
                <SelectItem value="user">عملاء</SelectItem>
                <SelectItem value="provider">مزودون</SelectItem>
                <SelectItem value="system">النظام</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.referenceType} onValueChange={(value) => setFilter("referenceType", value || "all")}>
              <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="المرجع" value={referenceTypeLabels[filters.referenceType] ?? filters.referenceType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المراجع</SelectItem>
                <SelectItem value="order">طلبات</SelectItem>
                <SelectItem value="topup">شحن</SelectItem>
                <SelectItem value="payout,withdrawal">سحوبات</SelectItem>
                <SelectItem value="payout_reversal">إرجاع سحب</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" aria-label="من تاريخ" value={filters.dateFrom} onChange={(event) => setFilter("dateFrom", event.target.value)} className="h-9 bg-background/80 border-border/40 text-xs" />
            <Input type="date" aria-label="إلى تاريخ" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} className="h-9 bg-background/80 border-border/40 text-xs" />
            <Input value={filters.amountMin} onChange={(event) => setFilter("amountMin", event.target.value)} placeholder="أقل مبلغ" className="h-9 bg-background/80 border-border/40 text-xs" />
            <Input value={filters.amountMax} onChange={(event) => setFilter("amountMax", event.target.value)} placeholder="أعلى مبلغ" className="h-9 bg-background/80 border-border/40 text-xs" />
            <Select value={filters.sortBy} onValueChange={(value) => setFilter("sortBy", value || "createdAt")}>
              <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="الفرز" value={financeSortByLabels[filters.sortBy] ?? filters.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">التاريخ</SelectItem>
                <SelectItem value="amount">المبلغ</SelectItem>
                <SelectItem value="status">الحالة</SelectItem>
                <SelectItem value="type">النوع</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortOrder} onValueChange={(value) => setFilter("sortOrder", (value || "desc") as "asc" | "desc")}>
              <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="الاتجاه" value={sortOrderLabels[filters.sortOrder]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">تنازلي</SelectItem>
                <SelectItem value="asc">تصاعدي</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 xl:col-span-2">
              <Button variant="outline" className="h-9 text-xs gap-2" onClick={() => { setFilters(defaultFilters); setPage(1); }}>
                <RotateCcw className="w-3.5 h-3.5" /> إعادة ضبط
              </Button>
              <Button variant="outline" className="h-9 text-xs gap-2" onClick={() => downloadCsv(transactions, "wallet-transactions.csv")} disabled={!transactions.length}>
                <Download className="w-3.5 h-3.5" /> تصدير المعروض
              </Button>
            </div>
          </div>
        </Card>

        <TabsContent value="overview" className="m-0 focus-visible:outline-none">
          <FinanceCharts type="overview" transactions={chartTransactions} />
        </TabsContent>

        <TabsContent value="flow" className="m-0 focus-visible:outline-none">
          <FinanceCharts type="flow" transactions={chartTransactions} />
        </TabsContent>

        <TabsContent value="transactions" className="m-0 focus-visible:outline-none space-y-4">
          <TransactionsTable transactions={transactions} isLoading={transactionsQuery.isLoading} />
          <TablePagination
            page={page}
            totalPages={Number(transactionsResult.pagination.totalPages || 1)}
            total={Number(transactionsResult.total || 0)}
            shown={transactions.length}
            unit="عملية"
            busy={transactionsQuery.isFetching}
            onPageChange={(next) => setPage(() => next)}
            className="border-t-0"
          />
        </TabsContent>

        <TabsContent value="payouts" className="m-0 focus-visible:outline-none space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Select value={payoutStatus} onValueChange={(value) => { setPayoutStatus(value || "pending"); setPayoutPage(1); }}>
              <SelectTrigger className="w-full sm:w-56 h-9 bg-background/80 border-border/40 text-xs">
                <FilterSelectValue label="السحوبات" value={payoutStatusLabels[payoutStatus] ?? payoutStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">طلبات معلقة</SelectItem>
                <SelectItem value="completed">منفذة</SelectItem>
                <SelectItem value="failed">مرفوضة</SelectItem>
                <SelectItem value="all">كل طلبات السحب</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-9 text-xs gap-2" onClick={() => downloadCsv(payouts, "wallet-payouts.csv")} disabled={!payouts.length}>
              <Download className="w-3.5 h-3.5" /> تصدير الطلبات
            </Button>
          </div>
          <PayoutRequests
            payouts={payouts}
            approvingId={approvingId}
            onApprove={handleApprovePayout}
            isPending={payoutMut.isPending}
            isLoading={payoutsQuery.isLoading}
          />
          <TablePagination
            page={payoutPage}
            totalPages={Number(payoutsResult.pagination.totalPages || 1)}
            total={Number(payoutsResult.total || 0)}
            shown={payouts.length}
            unit="طلب سحب"
            busy={payoutsQuery.isFetching}
            onPageChange={(next) => setPayoutPage(() => next)}
            className="border-t-0"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
