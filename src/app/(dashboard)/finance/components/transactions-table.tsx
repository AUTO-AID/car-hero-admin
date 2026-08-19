"use client";

import { ArrowDownRight, ArrowUpRight, Receipt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="قائمة العمليات المالية">
        <table className="w-full text-start"><caption className="sr-only">قائمة العمليات المالية</caption>
          <thead>
            <tr className="border-b border-border/20 bg-secondary/10">
              {["العملية", "المالك", "النوع", "المبلغ", "المرجع", "الحالة", "التاريخ"].map((h) => (
                <th scope="col" key={h} className="text-start px-5 py-3.5 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">{h}</th>
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
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isCredit ? "bg-emerald-500/10 text-success border-emerald-500/20" : "bg-orange-500/10 text-warning border-orange-500/20"}`}>
                        {isCredit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{tx.transactionNumber || tx._id || tx.id}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[260px]">{tx.description || "لا يوجد وصف"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-foreground">{tx.ownerName || tx.providerName || "غير معروف"}</p>
                    <p className="text-xs text-muted-foreground">{tx.ownerType === "provider" ? "مزود" : tx.ownerType === "user" ? "عميل" : "النظام"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-md ${isCredit ? "bg-emerald-500/10 text-success border-emerald-500/20" : "bg-orange-500/10 text-warning border-orange-500/20"}`}>
                      {typeLabel(tx)}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold tabular-nums tracking-tight ${isCredit ? "text-success" : "text-warning"}`}>
                      {isCredit ? "+" : "-"}{Number(tx.amount || 0).toLocaleString("ar-SY")} ل.س
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-muted-foreground">{tx.referenceType || "بدون"}</p>
                    <p className="text-xs font-mono text-muted-foreground/60">{tx.referenceId || tx.paymentMethod || "-"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 rounded-md border border-border/40">
                      {statusLabel[String(tx.status).toLowerCase()] || tx.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground/70">
                    {createdAt && !Number.isNaN(createdAt.getTime())
                      ? formatDistanceToNow(createdAt, { locale: ar, addSuffix: true })
                      : "غير محدد"}
                  </td>
                </tr>
              );
            })}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16">
                  <EmptyState
                    icon={Receipt}
                    title="لا توجد عمليات مطابقة"
                    description="غيّر الفلاتر أو نطاق التاريخ لعرض بيانات أخرى."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
