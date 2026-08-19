"use client";

import { Calendar, Receipt } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";

type Subscriber = { _id: string; user?: { fullName?: string; phoneNumber?: string; email?: string }; plan?: { name?: string; nameAr?: string; tier?: string }; startDate: string; endDate: string; status: string; autoRenew?: boolean; amountPaid?: number };
const labels: Record<string, string> = { active: "نشط", expired: "منتهي", cancelled: "ملغي", pending: "معلق" };

export default function SubscribersTable({ subscribers, isLoading, total, page, pages, setPage }: { subscribers: Subscriber[]; isLoading: boolean; total: number; page: number; pages: number; setPage: (value: number | ((p: number) => number)) => void }) {
  return <Card className="bg-card border-border/40 overflow-hidden">
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="قائمة المشتركين"><table className="w-full text-start"><caption className="sr-only">قائمة المشتركين</caption><thead><tr className="border-b border-border/20 bg-secondary/10">{["المشترك", "الخطة", "الفترة", "المبلغ", "التجديد", "الحالة"].map((h) => <th scope="col" key={h} className="text-start px-4 py-3 text-xs text-muted-foreground">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-border/10">
        {isLoading && Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td></tr>)}
        {!isLoading && subscribers.map((sub) => <tr key={sub._id} className="table-row-hover">
          <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar className="w-7 h-7"><AvatarFallback>{sub.user?.fullName?.[0] || "?"}</AvatarFallback></Avatar><div><p className="text-xs font-bold">{sub.user?.fullName || "مستخدم غير معروف"}</p><p className="text-xs text-muted-foreground">{sub.user?.phoneNumber || sub.user?.email || "-"}</p></div></div></td>
          <td className="px-4 py-3 text-xs">{sub.plan?.nameAr || sub.plan?.name || "خطة غير متاحة"}</td>
          <td className="px-4 py-3 text-xs text-muted-foreground"><p className="flex gap-1"><Calendar className="w-3 h-3" />{format(new Date(sub.startDate), "d MMM yyyy", { locale: ar })}</p><p>{format(new Date(sub.endDate), "d MMM yyyy", { locale: ar })}</p></td>
          <td className="px-4 py-3 text-xs font-bold">{Number(sub.amountPaid || 0).toLocaleString("ar-SY")} ل.س</td>
          <td className="px-4 py-3 text-xs">{sub.autoRenew ? "تلقائي" : "يدوي"}</td>
          <td className="px-4 py-3"><Badge variant="outline" className={sub.status === "active" ? "badge-success" : sub.status === "cancelled" ? "badge-danger" : "badge-neutral"}>{labels[sub.status] || sub.status}</Badge></td>
        </tr>)}
        {!isLoading && !subscribers.length && <tr><td colSpan={6} className="py-14"><EmptyState icon={Receipt} title="لا توجد اشتراكات مطابقة" description="غيّر الفلاتر لعرض اشتراكات أخرى." /></td></tr>}
      </tbody></table></div>
    <TablePagination
      page={page}
      totalPages={pages}
      total={total}
      shown={subscribers.length}
      unit="اشتراك"
      onPageChange={(next) => setPage(() => next)}
    />
  </Card>;
}
