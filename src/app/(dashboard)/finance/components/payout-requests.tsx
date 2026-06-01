"use client";

import { CheckCircle2, Clock, CreditCard, Landmark, Loader2, Receipt, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Payout {
  _id?: string;
  id?: string;
  ownerName?: string;
  providerName?: string;
  amount: number;
  bankAccount?: string;
  bankName?: string;
  status: string;
  createdAt?: Date | string;
  description?: string;
}

interface PayoutRequestsProps {
  payouts: Payout[];
  approvingId: string | null;
  onApprove: (id: string, action: "complete" | "reject") => void;
  isPending: boolean;
  isLoading?: boolean;
}

const statusLabel: Record<string, string> = {
  pending: "معلق",
  completed: "مكتمل",
  failed: "مرفوض",
  reversed: "معكوس",
};

export default function PayoutRequests({
  payouts,
  approvingId,
  onApprove,
  isPending,
  isLoading = false,
}: PayoutRequestsProps) {
  return (
    <div className="grid gap-4">
      {isLoading && (
        <Card className="p-12 text-center border-border/40 bg-card/50 text-sm text-muted-foreground">
          جاري تحميل طلبات السحب...
        </Card>
      )}
      {!isLoading && payouts.map((payout, i) => {
        const id = payout._id || payout.id || "";
        const createdAt = payout.createdAt ? new Date(payout.createdAt) : null;
        const canProcess = payout.status === "pending";
        return (
          <Card key={id || i} className="p-5 bg-card border-border/40 hover:border-border/80 transition-all hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-white">طلب سحب: {payout.ownerName || payout.providerName || "مزود غير معروف"}</h4>
                    <Badge variant="outline" className="text-[10px] border-border/40">{statusLabel[payout.status] || payout.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <CreditCard className="w-3.5 h-3.5" />
                      {(payout.bankAccount || payout.bankName || payout.description || "بيانات البنك غير محفوظة").slice(0, 32)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {createdAt && !Number.isNaN(createdAt.getTime()) ? formatDistanceToNow(createdAt, { locale: ar, addSuffix: true }) : "غير محدد"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground mb-0.5">المبلغ المطلوب</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">{Number(payout.amount || 0).toLocaleString("ar-SY")} ل.س</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onApprove(id, "complete")}
                    disabled={!canProcess || (isPending && approvingId === id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-500/20"
                  >
                    {isPending && approvingId === id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    تحويل الآن
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onApprove(id, "reject")}
                    disabled={!canProcess || (isPending && approvingId === id)}
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2"
                  >
                    <XCircle className="w-4 h-4" /> رفض
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      {!isLoading && payouts.length === 0 && (
        <Card className="p-16 text-center border-border/40 bg-card/50">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-semibold text-white">لا توجد طلبات سحب مطابقة</h3>
          <p className="text-xs text-muted-foreground mt-1">كل طلبات السحب الحالية ضمن هذا الفلتر تمت معالجتها أو غير موجودة.</p>
        </Card>
      )}
    </div>
  );
}
