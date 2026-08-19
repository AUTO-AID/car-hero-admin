"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { Review } from "@/domain/entities/review.types";
import { deleteReview, getReviews, getReviewStats, toggleReviewVisibility, type ReviewFilters } from "@/infrastructure/services/reviews.service";
import DeleteConfirmDialog from "./components/delete-confirm-dialog";
import ReviewsList from "./components/reviews-list";
import ReviewsStats from "./components/reviews-stats";

const defaults = { search: "", isReported: "all", isVisible: "all", rating: "all", hasResponse: "all", sortBy: "createdAt", sortOrder: "desc" as "asc" | "desc" };
const unwrap = (value: any) => value?.data?.data ?? value?.data ?? value ?? {};

export default function ReviewsPage() {
  const client = useQueryClient(); const [page, setPage] = useState(1); const [filters, setFilters] = useState(defaults); const [deleteId, setDeleteId] = useState<string | null>(null);
  const reviewsQuery = useQuery({ queryKey: ["admin-reviews", page, filters], queryFn: () => getReviews(page, 12, filters as ReviewFilters) });
  const statsQuery = useQuery({ queryKey: ["admin-review-stats"], queryFn: getReviewStats });
  const result = unwrap(reviewsQuery.data); const reviews: Review[] = result.reviews || []; const pagination = result.pagination || { total: 0, pages: 1 };
  const refresh = () => { client.invalidateQueries({ queryKey: ["admin-reviews"] }); client.invalidateQueries({ queryKey: ["admin-review-stats"] }); };
  const toggle = useMutation({ mutationFn: ({ id, visible }: any) => toggleReviewVisibility(id, visible), onSuccess: () => { refresh(); toast.success("تم تحديث ظهور التقييم"); }, onError: () => toast.error("تعذر تحديث التقييم") });
  const remove = useMutation({ mutationFn: deleteReview, onSuccess: () => { refresh(); setDeleteId(null); toast.success("تم حذف التقييم وإعادة احتساب تقييم المزود"); }, onError: () => toast.error("تعذر حذف التقييم") });
  const setFilter = (key: keyof typeof filters, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const exportCsv = () => { const rows = reviews.map((r) => [r.user?.fullName, r.provider?.businessName, r.rating, r.comment, r.isReported ? "نعم" : "لا", r.isVisible ? "ظاهر" : "مخفي", r.createdAt]); const csv = [["المستخدم", "المزود", "التقييم", "التعليق", "بلاغ", "الظهور", "التاريخ"], ...rows].map((row: unknown[]) => row.map((v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "reviews.csv"; a.click(); URL.revokeObjectURL(url); };
  return <div className="space-y-5" dir="rtl">
    <div><h2 className="text-lg font-bold">إدارة ومراجعة التقييمات</h2><p className="text-xs text-muted-foreground">مراقبة تقييمات العملاء، البلاغات، ردود المزودين وحالة الظهور.</p></div>
    <ReviewsStats stats={unwrap(statsQuery.data)} />
    <Card className="p-3 bg-card border-border/40 grid gap-6 md:grid-cols-4 xl:grid-cols-10">
      <div className="relative md:col-span-2"><Search className="absolute start-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" /><Input className="ps-9" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="بحث بالمستخدم، المزود أو التعليق..." /></div>
      <Filter label="البلاغات" value={filters.isReported} set={(v) => setFilter("isReported", v)} items={[["all", "كل البلاغات"], ["true", "مبلغ عنها"], ["false", "غير مبلغ عنها"]]} />
      <Filter label="الظهور" value={filters.isVisible} set={(v) => setFilter("isVisible", v)} items={[["all", "كل حالات الظهور"], ["true", "ظاهرة"], ["false", "مخفية"]]} />
      <Filter label="التقييم" value={filters.rating} set={(v) => setFilter("rating", v)} items={[["all", "كل النجوم"], ["5", "5 نجوم"], ["4", "4 نجوم"], ["3", "3 نجوم"], ["2", "نجمتان"], ["1", "نجمة واحدة"]]} />
      <Filter label="الرد" value={filters.hasResponse} set={(v) => setFilter("hasResponse", v)} items={[["all", "كل الردود"], ["true", "مع رد"], ["false", "بدون رد"]]} />
      <Filter label="الفرز" value={filters.sortBy} set={(v) => setFilter("sortBy", v)} items={[["createdAt", "التاريخ"], ["rating", "النجوم"], ["helpfulCount", "الإعجابات"]]} />
      <Filter label="الاتجاه" value={filters.sortOrder} set={(v) => setFilter("sortOrder", v as "asc" | "desc")} items={[["desc", "تنازلي"], ["asc", "تصاعدي"]]} />
      <Button variant="outline" onClick={() => { setFilters(defaults); setPage(1); }}><RotateCcw className="w-3.5 h-3.5" />مسح</Button><Button variant="outline" disabled={!reviews.length} onClick={exportCsv}><Download className="w-3.5 h-3.5" />تصدير</Button>
    </Card>
    <ReviewsList reviews={reviews} isLoading={reviewsQuery.isLoading} total={pagination.total} page={page} pages={pagination.pages} setPage={setPage} onToggleVisibility={(id, visible) => toggle.mutate({ id, visible })} isTogglePending={toggle.isPending} onDeleteClick={setDeleteId} />
    <DeleteConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} onConfirm={() => deleteId && remove.mutate(deleteId)} isPending={remove.isPending} />
  </div>;
}

function Filter({ label, value, set, items }: { label: string; value: string; set: (value: string) => void; items: string[][] }) {
  const selected = items.find(([key]) => key === value)?.[1] ?? value;
  return <Select value={value} onValueChange={(v) => set(v || "all")}><SelectTrigger><FilterSelectValue label={label} value={selected} /></SelectTrigger><SelectContent>{items.map(([key, itemLabel]) => <SelectItem key={key} value={key}>{itemLabel}</SelectItem>)}</SelectContent></Select>;
}
