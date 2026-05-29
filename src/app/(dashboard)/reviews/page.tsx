"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getReviews,
  toggleReviewVisibility,
  deleteReview,
} from "@/infrastructure/services/reviews.service";
import { getExcelSummary } from "@/infrastructure/services/stats.service";
import ReviewsStats from "./components/reviews-stats";
import ReviewsList from "./components/reviews-list";
import DeleteConfirmDialog from "./components/delete-confirm-dialog";
import { Review } from "@/domain/entities/review.types";

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", page, filter],
    queryFn: () => getReviews(page, filter),
    retry: false,
  });

  const { data: excelSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["admin-excel-summary"],
    queryFn: getExcelSummary,
    retry: 1,
  });

  const reviews: Review[] = data?.data?.reviews ?? (Array.isArray(data?.data) ? data.data : (data?.reviews ?? []));
  const total = data?.data?.pagination?.total ?? data?.data?.total ?? data?.total ?? 0;

  const toggleMut = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      toggleReviewVisibility(id, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("تم تحديث حالة التقييم");
    },
    onError: () => toast.error("فشل تحديث التقييم"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("تم حذف التقييم نهائياً");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("فشل حذف التقييم");
      setDeleteId(null);
    },
  });

  const filtered = search
    ? reviews.filter((r) =>
        r.user?.fullName?.includes(search) ||
        r.provider?.businessName?.includes(search) ||
        r.comment?.includes(search)
      )
    : reviews;

  const reportedCount = filtered.filter((r) => r.isReported).length;
  const avgRating = filtered.reduce((s, r) => s + r.rating, 0) / (filtered.length || 1);

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    toggleMut.mutate({ id, isVisible });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMut.mutate(deleteId);
    }
  };

  return (
    <div className="space-y-6">
      <ReviewsStats
        total={total}
        reportedCount={reportedCount}
        avgRating={avgRating}
        ratingDistribution={excelSummary?.RATING_DISTRIBUTION}
        isLoading={isSummaryLoading}
      />

      <ReviewsList
        reviews={filtered}
        isLoading={isLoading}
        total={total}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        page={page}
        setPage={setPage}
        onToggleVisibility={handleToggleVisibility}
        isTogglePending={toggleMut.isPending}
        onDeleteClick={setDeleteId}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMut.isPending}
      />
    </div>
  );
}
