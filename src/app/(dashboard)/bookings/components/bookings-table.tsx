"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Search, Filter, MoreHorizontal, Eye, Trash2, User, Wrench, CalendarCheck, CalendarX, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import { Booking } from "@/domain/entities/booking.types";

interface BookingsTableProps {
  bookings: Booking[];
  total: number;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onViewDetails: (booking: Booking) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  statusMeta: Record<string, { color: string; label: string; icon: React.ElementType }>;
}

const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "مؤكّد" },
  { value: "in_progress", label: "جاري" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

export function BookingsTable({
  bookings,
  total,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
  onViewDetails,
  onUpdateStatus,
  onDelete,
  statusMeta,
}: BookingsTableProps) {
  const filtered = search
    ? bookings.filter((b) =>
        b.bookingNumber?.includes(search) ||
        b.user?.fullName?.includes(search) ||
        b.service?.name?.includes(search)
      )
    : bookings;

  return (
    <Card className="bg-card border-border/40 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-5 border-b border-border/30 bg-secondary/10">
        <div className="flex items-center gap-2 w-full sm:w-auto mr-auto">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-white text-sm tracking-tight">إدارة الحجوزات</h2>
          <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/40 text-[10px] tabular-nums">
            {total} حجز
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="رقم الحجز، العميل، الخدمة..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background border-border/40 text-xs h-9 pr-9 rounded-lg"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val || "all")}>
            <SelectTrigger className="w-36 h-9 bg-background border-border/40 text-xs rounded-lg">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/40 rounded-xl">
              {statusOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border/20 bg-secondary/10">
              {["الحجز", "العميل", "المزود", "الخدمة", "الموعد", "الحالة", "المبلغ", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-20 rounded" /></td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <Calendar className="w-10 h-10 text-muted-foreground/25 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">لا توجد حجوزات مطابقة</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">جرّب تغيير معايير البحث أو الفلتر</p>
                  </td>
                </tr>
              )
              : filtered.map((booking, i) => {
                  const meta = statusMeta[booking.status] ?? statusMeta.pending;
                  const StatusIcon = meta.icon;
                  const bookingId = booking._id || booking.id || "";
                  const scheduleDate = booking.scheduledAt ? new Date(booking.scheduledAt) : new Date();

                  return (
                    <tr key={bookingId} className="table-row-hover transition-colors animate-fade-in" style={{ animationDelay: `${i * 25}ms` }}>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-mono font-bold text-foreground">{booking.bookingNumber}</p>
                        {booking.notes && (
                          <p className="text-[10px] text-amber-400/80 mt-0.5 truncate max-w-[110px]" title={booking.notes}>
                            ملاحظة: {booking.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{booking.user?.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {booking.provider ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Wrench className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-xs font-medium text-foreground">{booking.provider.businessName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 px-2">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                          {booking.service?.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <CalendarCheck className="w-3 h-3 text-primary shrink-0" />
                            {format(scheduleDate, "dd MMM", { locale: ar })}
                          </div>
                          <span className="text-[10px] text-muted-foreground/60">
                            {format(scheduleDate, "hh:mm a")}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border ${meta.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {meta.label}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {(booking.totalAmount || booking.payableAmount || 0).toLocaleString("ar-SA")} <span className="text-[10px] text-muted-foreground font-normal">ل.س</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-secondary/60">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border/50 w-48 rounded-xl shadow-xl">
                            <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => onViewDetails(booking)}>
                              <Eye className="w-3.5 h-3.5" /> عرض التفاصيل
                            </DropdownMenuItem>
                            {booking.status === "pending" && (
                              <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-emerald-400 focus:text-emerald-400"
                                onClick={() => onUpdateStatus(bookingId, "confirmed")}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> تأكيد الحجز
                              </DropdownMenuItem>
                            )}
                            {(booking.status === "pending" || booking.status === "confirmed") && (
                              <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-rose-400 focus:text-rose-400"
                                onClick={() => onUpdateStatus(bookingId, "cancelled")}>
                                <XCircle className="w-3.5 h-3.5" /> إلغاء الحجز
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-xs text-destructive cursor-pointer"
                              onClick={() => onDelete(bookingId)}>
                              <Trash2 className="w-3.5 h-3.5" /> حذف نهائي
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/20 bg-secondary/10">
        <p className="text-[11px] text-muted-foreground/60">
          إجمالي <span className="font-bold text-foreground">{total}</span> حجز
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1} className="h-7 text-[11px] border-border/30 rounded-lg px-3">السابق</Button>
          <span className="text-[11px] text-muted-foreground/60 px-2 tabular-nums font-medium">صفحة {page}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)}
            disabled={filtered.length < 10} className="h-7 text-[11px] border-border/30 rounded-lg px-3">التالي</Button>
        </div>
      </div>
    </Card>
  );
}
