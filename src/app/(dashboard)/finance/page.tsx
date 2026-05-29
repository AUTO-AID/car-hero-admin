"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import {
  getPlatformWallet,
  approvePayout,
  getAllTransactions,
  getPayoutRequests,
} from "@/infrastructure/services/finance.service";
import FinanceStats from "./components/finance-stats";
import FinanceCharts from "./components/finance-charts";
import TransactionsTable from "./components/transactions-table";
import PayoutRequests from "./components/payout-requests";


export default function FinancePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: walletData } = useQuery({
    queryKey: ["platform-wallet"],
    queryFn: getPlatformWallet,
    retry: false,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ["transactions", tab],
    queryFn: () => getAllTransactions(1, 20),
    enabled: tab === "transactions" || tab === "overview" || tab === "flow",
  });

  const { data: payoutsData } = useQuery({
    queryKey: ["payout-requests"],
    queryFn: () => getPayoutRequests(1, 20),
    enabled: tab === "payouts",
  });

  const wallet = {
    balance: walletData?.data?.platformBalance ?? walletData?.data?.balance ?? 0,
    totalCommissions: walletData?.data?.totalCommissionEarned ?? walletData?.data?.totalCommissions ?? 0,
    totalPayouts: walletData?.data?.totalPayoutsProcessed ?? walletData?.data?.totalPayouts ?? 0,
  };

  const payoutMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "complete" | "reject" }) =>
      approvePayout(id, action),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["platform-wallet"] });
      toast.success(vars.action === "complete" ? "✅ تم تحويل الدفعة بنجاح" : "❌ تم رفض طلب السحب");
      setApprovingId(null);
    },
    onError: () => {
      toast.error("فشلت العملية، حاول مرة أخرى");
      setApprovingId(null);
    },
  });

  const handleApprovePayout = (id: string, action: "complete" | "reject") => {
    setApprovingId(id);
    payoutMut.mutate({ id, action });
  };

  const transactions = transactionsData?.data?.transactions ?? [];
  const payouts: any[] = payoutsData?.data?.transactions ?? payoutsData?.transactions ?? [];

  return (
    <div className="space-y-6">
      <FinanceStats
        balance={wallet.balance}
        totalCommissions={wallet.totalCommissions}
        totalPayouts={wallet.totalPayouts}
        payoutsCount={payouts.length}
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
            سجل المعاملات
          </TabsTrigger>
          <TabsTrigger value="payouts" className="text-xs data-[state=active]:bg-card rounded-lg px-6 gap-2">
            طلبات السحب
            {payouts.length > 0 && (
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-500 text-[10px] font-bold text-amber-950">
                {payouts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="m-0 focus-visible:outline-none">
          <FinanceCharts type="overview" transactions={transactions} />
        </TabsContent>

        <TabsContent value="flow" className="m-0 focus-visible:outline-none">
          <FinanceCharts type="flow" transactions={transactions} />
        </TabsContent>

        <TabsContent value="transactions" className="m-0 focus-visible:outline-none">
          <TransactionsTable transactions={transactions} />
        </TabsContent>

        <TabsContent value="payouts" className="m-0 focus-visible:outline-none">
          <PayoutRequests
            payouts={payouts}
            approvingId={approvingId}
            onApprove={handleApprovePayout}
            isPending={payoutMut.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
