"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOrder, getAllBookings, updateBookingStatus, deleteBooking } from "@/infrastructure/services/bookings.service";
import { getBookingsAnalytics } from "@/infrastructure/services/stats.service";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle2, AlertCircle, CalendarCheck, CalendarX } from "lucide-react";
import { toast } from "sonner";
import { Booking } from "@/domain/entities/booking.types";
import { queryKeys } from "@/infrastructure/query/query-keys";

import { BookingsStats } from "./components/bookings-stats";
import { BookingsTable } from "./components/bookings-table";
import { BookingDetailsDialog } from "./components/booking-details-dialog";

export const statusMeta: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  pending:     { color: "badge-warning", label: "قيد الانتظار", icon: Clock },
  accepted:    { color: "badge-info", label: "مؤكّد", icon: CheckCircle2 },
  in_progress: { color: "text-primary bg-primary/10 border-primary/20", label: "جاري", icon: AlertCircle },
  completed:   { color: "badge-success", label: "مكتمل", icon: CalendarCheck },
  cancelled:   { color: "badge-danger", label: "ملغي", icon: CalendarX },
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bookings.list(page, statusFilter),
    queryFn: () => getAllBookings(page, 10, statusFilter === "all" ? undefined : statusFilter),
    retry: false,
  });

  const { data: analytics } = useQuery({
    queryKey: queryKeys.bookings.analytics,
    queryFn: getBookingsAnalytics,
    retry: false,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("تم تحديث حالة الحجز");
    },
    onError: () => toast.error("فشل تحديث الحالة"),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("تم إلغاء الحجز مع حفظ السبب");
      setCancelTarget(null);
      setCancelReason("");
    },
    onError: () => toast.error("فشل إلغاء الحجز"),
  });

  const removeMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("تم حذف الحجز");
      setDeleteId(null);
    },
    onError: () => { 
      toast.error("فشل حذف الحجز"); 
      setDeleteId(null); 
    },
  });

  const bookings: Booking[] = data?.data?.bookings ?? data?.data?.orders ?? (Array.isArray(data?.data) ? data.data : (data?.bookings ?? data?.orders ?? []));
  const total = data?.data?.pagination?.total ?? data?.data?.total ?? data?.total ?? 0;

  return (
    <div className="space-y-5">
      {/* 1. Stats and charts cards layout */}
      <BookingsStats
        bookings={bookings}
        analytics={analytics}
        statusFilter={statusFilter}
        onFilterSelect={(key) => {
          setStatusFilter(key);
          setPage(1);
        }}
      />

      {/* 2. Main interactive tabular data list */}
      <BookingsTable
        bookings={bookings}
        total={total}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        page={page}
        onPageChange={setPage}
        onViewDetails={setViewBooking}
        onUpdateStatus={(id, status) => {
          if (status === "cancelled") {
            setCancelTarget(id);
            return;
          }
          updateStatus.mutate({ id, status });
        }}
        onDelete={setDeleteId}
        statusMeta={statusMeta}
      />

      {/* 3. Stepper detailed preview timeline dialog */}
      <BookingDetailsDialog
        booking={viewBooking}
        onClose={() => setViewBooking(null)}
      />

      {/* 4. Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف هذا الحجز نهائياً؟ لا يمكن التراجع عن هذه العملية.</p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} className="border-border/40">إلغاء</Button>
            <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => deleteId && removeMutation.mutate(deleteId)}
              disabled={removeMutation.isPending}>
              {removeMutation.isPending ? "جاري الحذف..." : "حذف نهائي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason(""); } }}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold">سبب إلغاء الحجز</DialogTitle>
          </DialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="اكتب سببًا واضحًا يظهر في سجل الحالة..."
            rows={4}
          />
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => { setCancelTarget(null); setCancelReason(""); }}>
              تراجع
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={cancelMutation.isPending || cancelReason.trim().length < 5}
              onClick={() => cancelTarget && cancelMutation.mutate({ id: cancelTarget, reason: cancelReason.trim() })}
            >
              {cancelMutation.isPending ? "جار الإلغاء..." : "إلغاء الحجز"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
