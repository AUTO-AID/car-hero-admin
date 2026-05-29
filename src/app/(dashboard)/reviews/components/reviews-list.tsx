"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Star, Eye, EyeOff, ShieldAlert, Search, Filter, Trash2, AlertCircle, CornerDownLeft, User as UserIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Review } from "@/domain/entities/review.types";

const FILTER_OPTIONS = [
  { value: "all", label: "جميع التقييمات" },
  { value: "reported", label: "المُبلَّغ عنها" },
  { value: "hidden", label: "المخفية" },
];

interface ReviewsListProps {
  reviews: Review[];
  isLoading: boolean;
  total: number;
  search: string;
  setSearch: (s: string) => void;
  filter: string;
  setFilter: (f: string) => void;
  page: number;
  setPage: (updater: number | ((p: number) => number)) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  isTogglePending: boolean;
  onDeleteClick: (id: string) => void;
}

export default function ReviewsList({
  reviews,
  isLoading,
  total,
  search,
  setSearch,
  filter,
  setFilter,
  page,
  setPage,
  onToggleVisibility,
  isTogglePending,
  onDeleteClick,
}: ReviewsListProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
    return parts[0].slice(0, 2);
  };

  return (
    <Card className="bg-card border-border/40 shadow-xl overflow-hidden animate-fade-in-up">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-border/30 bg-secondary/10">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Star className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
              إدارة ومراقبة التقييمات
              <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/40 text-[10px] py-0.5 px-2 font-mono tabular-nums">
                {total}
              </Badge>
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">مراجعة تقييمات العملاء وحظرها أو حذف التقييمات المبلغ عنها</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="ابحث في التقييمات..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-background border-border/40 text-xs h-9 pr-9 rounded-lg focus:border-primary/50"
            />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v || "all"); setPage(1); }}>
            <SelectTrigger className="w-36 h-9 bg-background border-border/40 text-xs rounded-lg">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/40 rounded-xl">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="divide-y divide-border/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-16 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">لا توجد تقييمات مطابقة</p>
          <p className="text-xs text-muted-foreground/50 mt-1">جرّب تغيير معايير البحث</p>
        </div>
      ) : (
        <div className="divide-y divide-border/10">
          {reviews.map((review, i) => (
            <div
              key={review._id}
              className={`p-5 sm:p-6 transition-all duration-200 hover:bg-secondary/10 group animate-fade-in border-r-2 ${
                review.isReported 
                  ? "bg-rose-500/[0.015] border-r-rose-500" 
                  : "border-r-transparent hover:border-r-primary"
              }`}
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                <div className="flex-1 min-w-0 w-full">
                  {/* User profile & target provider */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 text-violet-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-inner">
                      {review.user?.fullName ? getInitials(review.user.fullName) : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white">{review.user?.fullName || "مستخدم مجهول"}</span>
                        <span className="text-muted-foreground/30 text-xs">←</span>
                        <span className="text-xs font-semibold text-primary">{review.provider?.businessName || "ورشة/مركز"}</span>

                        {review.isReported && (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-bold py-0 px-1.5 flex items-center gap-1 rounded-md">
                            <ShieldAlert className="w-2.5 h-2.5" /> مُبلَّغ عنه
                          </Badge>
                        )}
                        {!review.isVisible && (
                          <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/40 text-[9px] font-bold py-0 px-1.5 flex items-center gap-1 rounded-md">
                            <EyeOff className="w-2.5 h-2.5" /> مخفي
                          </Badge>
                        )}
                      </div>

                      {/* Stars + date */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-3.5 h-3.5 ${idx < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted/10 text-muted/20"}`} />
                          ))}
                          <span className="text-[11px] font-bold text-amber-400 mr-1">{review.rating}/5</span>
                        </div>
                        <span className="text-muted-foreground/30 text-xs">•</span>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          {isMounted ? formatDistanceToNow(new Date(review.createdAt), { locale: ar, addSuffix: true }) : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mr-12">
                    <p className={`text-xs sm:text-sm leading-relaxed ${review.isVisible ? "text-slate-300" : "text-muted-foreground/45 line-through decoration-muted-foreground/30 italic"}`}>
                      "{review.comment || "لا يوجد تعليق نصي"}"
                    </p>

                    {/* Sub-Ratings Grid if exist */}
                    {(review.serviceQuality || review.punctuality || review.professionalism || review.valueForMoney) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-border/10 max-w-2xl bg-secondary/5 p-2 rounded-lg">
                        {review.serviceQuality !== undefined && (
                          <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border border-border/10 rounded">
                            <span>جودة الخدمة:</span>
                            <span className="font-bold text-amber-400">{review.serviceQuality}/5</span>
                          </div>
                        )}
                        {review.punctuality !== undefined && (
                          <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border border-border/10 rounded">
                            <span>الالتزام بالوقت:</span>
                            <span className="font-bold text-amber-400">{review.punctuality}/5</span>
                          </div>
                        )}
                        {review.professionalism !== undefined && (
                          <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border border-border/10 rounded">
                            <span>الاحترافية:</span>
                            <span className="font-bold text-amber-400">{review.professionalism}/5</span>
                          </div>
                        )}
                        {review.valueForMoney !== undefined && (
                          <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border border-border/10 rounded">
                            <span>القيمة مقابل السعر:</span>
                            <span className="font-bold text-amber-400">{review.valueForMoney}/5</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Provider response display */}
                    {review.providerResponse && (
                      <div className="mt-3.5 p-3 rounded-xl bg-violet-500/[0.03] border border-violet-500/10 flex gap-2.5 mr-2 animate-fade-in">
                        <div className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-violet-300">رد المزود ({review.provider?.businessName || "مزود الخدمة"})</span>
                            {review.providerRespondedAt && (
                              <span className="text-[9px] text-muted-foreground/50 font-mono">
                                {isMounted ? formatDistanceToNow(new Date(review.providerRespondedAt), { locale: ar, addSuffix: true }) : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                            "{review.providerResponse}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-border/10">
                  <Button
                    size="sm"
                    variant={review.isVisible ? "outline" : "default"}
                    onClick={() => onToggleVisibility(review._id, !review.isVisible)}
                    disabled={isTogglePending}
                    className={`h-8 text-xs gap-1.5 transition-all flex-1 md:flex-initial ${
                      review.isVisible
                        ? "border-border/40 hover:bg-secondary hover:border-primary/30"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    }`}
                  >
                    {review.isVisible
                      ? <><EyeOff className="w-3.5 h-3.5" /> إخفاء التقييم</>
                      : <><Eye className="w-3.5 h-3.5" /> إظهار التقييم</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteClick(review._id)}
                    className="h-8 text-xs gap-1.5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all flex-1 md:flex-initial"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> حذف نهائي
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/20 bg-secondary/10">
        <p className="text-[11px] text-muted-foreground/60">
          إجمالي <span className="font-bold text-foreground font-mono">{total}</span> تقييم
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1} className="h-7 text-[11px] border-border/30 rounded-lg px-3">السابق</Button>
          <span className="text-[11px] text-slate-300 px-2 font-mono tabular-nums">صفحة {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}
            disabled={reviews.length < 10} className="h-7 text-[11px] border-border/30 rounded-lg px-3">التالي</Button>
        </div>
      </div>
    </Card>
  );
}
