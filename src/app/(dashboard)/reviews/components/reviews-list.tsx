"use client";

import { Eye, EyeOff, ShieldAlert, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Review } from "@/domain/entities/review.types";
import { TablePagination } from "@/components/ui/table-pagination";

export default function ReviewsList({ reviews, isLoading, total, page, pages, setPage, onToggleVisibility, isTogglePending, onDeleteClick }: { reviews: Review[]; isLoading: boolean; total: number; page: number; pages: number; setPage: (value: number | ((p: number) => number)) => void; onToggleVisibility: (id: string, visible: boolean) => void; isTogglePending: boolean; onDeleteClick: (id: string) => void }) {
  return <Card className="bg-card border-border/40 overflow-hidden">
    <div className="divide-y divide-border/10">
      {isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="p-5"><Skeleton className="h-16 w-full" /></div>)}
      {!isLoading && reviews.map((review) => {
        const response = review.providerResponse || review.response?.comment;
        return <div key={review._id} className={`p-5 border-r-2 ${review.isReported ? "border-rose-500 bg-rose-500/[.02]" : "border-transparent"}`}>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><b className="text-sm">{review.user?.fullName || "مستخدم غير معروف"}</b><span className="text-muted-foreground">إلى</span><span className="text-xs text-primary">{review.provider?.businessName || "مزود غير معروف"}</span>{review.isReported && <Badge variant="outline" className="badge-danger"><ShieldAlert className="w-3 h-3" />مبلغ عنه</Badge>}{!review.isVisible && <Badge variant="outline" className="badge-neutral">مخفي</Badge>}</div>
              <div className="flex items-center gap-2 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-warning fill-amber-400" : "text-muted/30"}`} />)}<span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { locale: ar, addSuffix: true })}</span></div>
              <p className="text-sm text-foreground/80 mt-3">{review.comment || "لا يوجد تعليق نصي"}</p>
              {review.isReported && review.reportReason && <p className="text-xs text-danger mt-2">سبب البلاغ: {review.reportReason}</p>}
              {response && <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border/30"><p className="text-xs text-muted-foreground">رد المزود</p><p className="text-xs mt-1">{response}</p></div>}
            </div>
            <div className="flex md:flex-col gap-2 shrink-0"><Button size="sm" variant="outline" disabled={isTogglePending} onClick={() => onToggleVisibility(review._id, !review.isVisible)}>{review.isVisible ? <><EyeOff className="w-3.5 h-3.5" />إخفاء</> : <><Eye className="w-3.5 h-3.5" />إظهار</>}</Button><Button size="sm" variant="outline" className="text-danger" onClick={() => onDeleteClick(review._id)}><Trash2 className="w-3.5 h-3.5" />حذف</Button></div>
          </div>
        </div>;
      })}
      {!isLoading && !reviews.length && <div className="p-14 text-center text-sm text-muted-foreground">لا توجد تقييمات مطابقة للفلاتر الحالية</div>}
    </div>
    <TablePagination
      page={page}
      totalPages={pages}
      total={total}
      shown={reviews.length}
      unit="تقييم"
      onPageChange={(next) => setPage(() => next)}
    />
  </Card>;
}
