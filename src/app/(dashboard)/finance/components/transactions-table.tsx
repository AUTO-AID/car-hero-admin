"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  referenceId: string;
  createdAt: Date | string;
  providerName: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Card className="bg-card border-border/40 overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border/20 bg-secondary/10">
              {["المعاملة", "النوع", "المبلغ", "المرجع", "الحالة", "التاريخ"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {transactions.map((tx, i) => (
              <tr key={tx._id} className="table-row-hover transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tx.type === "COMMISSION" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                      {tx.type === "COMMISSION" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-medium text-foreground">{tx.providerName || "النظام"}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-md ${tx.type === "COMMISSION" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                    {tx.type === "COMMISSION" ? "عمولة منصة" : "سحب رصيد"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-bold tabular-nums tracking-tight ${tx.type === "COMMISSION" ? "text-blue-400" : "text-foreground"}`}>
                    {tx.type === "COMMISSION" ? "+" : "-"}{tx.amount.toLocaleString("ar-SA")} ل.س
                  </span>
                </td>
                <td className="px-5 py-4"><span className="text-xs font-mono text-muted-foreground">{tx.referenceId}</span></td>
                <td className="px-5 py-4"><StatusBadge status={tx.status} /></td>
                <td className="px-5 py-4 text-[11px] text-muted-foreground/60">
                  {formatDistanceToNow(new Date(tx.createdAt), { locale: ar, addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
