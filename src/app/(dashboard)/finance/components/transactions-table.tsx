"use client";

import { ArrowDownRight, ArrowUpRight, Receipt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface WalletTransaction {
  _id?: string;
  id?: string;
  transactionNumber?: string;
  type: string;
  amount: number;
  status: string;
  ownerType?: string;
  ownerName?: string;
  providerName?: string;
  ownerPhone?: string;
  referenceType?: string;
  referenceId?: string;
  paymentMethod?: string;
  description?: string;
  createdAt?: Date | string;
}

interface TransactionsTableProps {
  transactions: WalletTransaction[];
  isLoading?: boolean;
}

const statusLabel: Record<string, string> = {
  pending: "معلق",
  completed: "مكتمل",
  failed: "فشل",
  reversed: "معكوس",
};

const typeLabel = (tx: WalletTransaction) => {
  const type = String(tx.type).toLowerCase();
  const referenceType = String(tx.referenceType || "").toLowerCase();
  if (type === "credit" && referenceType === "order") return "إيراد مزود";
  if (type === "debit" && referenceType === "order") return "دفع طلب";
  if (type === "debit" && ["payout", "withdrawal"].includes(referenceType)) return "سحب مزود";
  if (type === "credit" && referenceType === "topup") return "شحن محفظة";
  if (type === "credit" && referenceType === "payout_reversal") return "إرجاع سحب";
  return type === "credit" ? "إيداع" : "سحب";
};

export default function TransactionsTable({ transactions, isLoading = false }: TransactionsTableProps) {
  return (
    <Card className="bg-card border-border/40 overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border/20 bg-secondary/10">
              {["العملية", "المالك", "النوع", "المبلغ", "المرجع", "الحالة", "التاريخ"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">جاري تحميل العمليات...</td>
              </tr>
            )}
            {!isLoading && transactions.map((tx, i) => {
              const isCredit = String(tx.type).toLowerCase() === "credit";
              const createdAt = tx.createdAt ? new Date(tx.createdAt) : null;
              return (
                <tr key={tx._id || tx.id || tx.transactionNumber || i} className="table-row-hover transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isCredit ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                        {isCredit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{tx.transactionNumber || tx._id || tx.id}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[260px]">{tx.description || "لا يوجد وصف"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-medium text-foreground">{tx.ownerName || tx.providerName || "غير معروف"}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.ownerType === "provider" ? "مزود" : tx.ownerType === "user" ? "عميل" : "النظام"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md ${isCredit ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                      {typeLabel(tx)}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold tabular-nums tracking-tight ${isCredit ? "text-emerald-400" : "text-orange-300"}`}>
                      {isCredit ? "+" : "-"}{Number(tx.amount || 0).toLocaleString("ar-SY")} ل.س
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-muted-foreground">{tx.referenceType || "بدون"}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/60">{tx.referenceId || tx.paymentMethod || "-"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-border/40">
                      {statusLabel[String(tx.status).toLowerCase()] || tx.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-[11px] text-muted-foreground/70">
                    {createdAt && !Number.isNaN(createdAt.getTime())
                      ? formatDistanceToNow(createdAt, { locale: ar, addSuffix: true })
                      : "غير محدد"}
                  </td>
                </tr>
              );
            })}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <Receipt className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-semibold text-white">لا توجد عمليات مطابقة</p>
                  <p className="text-xs text-muted-foreground mt-1">غيّر الفلاتر أو نطاق التاريخ لعرض بيانات أخرى.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
