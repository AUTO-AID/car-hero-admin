"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, CreditCard, Clock, CheckCircle2, XCircle, Loader2, Receipt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Payout {
  _id: string;
  provider: string;
  amount: number;
  bankAccount: string;
  status: string;
  createdAt: Date | string;
}

interface PayoutRequestsProps {
  payouts: Payout[];
  approvingId: string | null;
  onApprove: (id: string, action: "complete" | "reject") => void;
  isPending: boolean;
}

export default function PayoutRequests({
  payouts,
  approvingId,
  onApprove,
  isPending,
}: PayoutRequestsProps) {
  return (
    <div className="grid gap-4">
      {payouts.map((payout, i) => (
        <Card key={payout._id} className="p-5 bg-card border-border/40 hover:border-border/80 transition-all hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white mb-1">طلب سحب: {payout.provider}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono"><CreditCard className="w-3.5 h-3.5" />{payout.bankAccount.slice(0, 12)}...</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDistanceToNow(new Date(payout.createdAt), { locale: ar, addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground mb-0.5">المبلغ المطلوب</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{payout.amount.toLocaleString("ar-SA")} ل.س</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onApprove(payout._id, "complete")}
                  disabled={isPending && approvingId === payout._id}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-md shadow-emerald-500/20"
                >
                  {isPending && approvingId === payout._id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />}
                  تحويل الآن
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onApprove(payout._id, "reject")}
                  disabled={isPending && approvingId === payout._id}
                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 gap-2"
                >
                  <XCircle className="w-4 h-4" /> رفض
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      {payouts.length === 0 && (
        <Card className="p-16 text-center border-border/40 bg-card/50">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-semibold text-white">لا توجد طلبات سحب</h3>
        </Card>
      )}
    </div>
  );
}
