"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Search, Filter, MoreHorizontal, Eye, Trash2, User, Wrench, CalendarCheck, CalendarX, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import { Booking } from "@/domain/entities/booking.types";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { orderAmount } from "@/lib/order-amount";

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
  { value: "accepted", label: "مؤكّد" },
  { value: "in_progress", label: "جاري" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

const statusLabel = (value: string) =>
  statusOptions.find((option) => option.value === value)?.label ?? value;

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
        <div className="flex items-center gap-2 w-full sm:w-auto ms-auto">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-white text-sm tracking-tight">إدارة الحجوزات</h2>
          <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/40 text-xs tabular-nums">
            {total} حجز
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="رقم الحجز، العميل، الخدمة..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background border-border/40 text-xs h-9 ps-9 rounded-lg"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val || "all")}>
            <SelectTrigger className="w-full sm:w-48 h-9 bg-background border-border/40 text-xs rounded-lg">
              <FilterSelectValue
                label="الحالة"
                value={statusLabel(statusFilter)}
                icon={<Filter className="w-3 h-3 text-muted-foreground" />}
              />
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
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="قائمة الحجوزات">
        <table className="w-full text-start"><caption className="sr-only">قائمة الحجوزات</caption>
          <thead>
            <tr className="border-b border-border/20 bg-secondary/10">
              {["الحجز", "العميل", "المزود", "الخدمة", "الموعد", "الحالة", "المبلغ", ""].map((h) => (
                <th scope="col" key={h} className="text-start px-5 py-3.5 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
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
                  <td colSpan={8} className="px-5 py-14">
                    <EmptyState
                      icon={Calendar}
                      title="لا توجد حجوزات مطابقة"
                      description="جرّب تغيير معايير البحث أو الفلتر"
                    />
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
                        <p className="text-sm font-mono font-bold text-foreground">{booking.bookingNumber}</p>
                        {booking.notes && (
                          <p className="text-xs text-warning/80 mt-0.5 truncate max-w-[110px]" title={booking.notes}>
                            ملاحظة: {booking.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="text-xs font-semibold text-foreground">{booking.user?.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {booking.provider ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Wrench className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">{booking.provider.businessName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 px-2">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                          {booking.service?.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                            <CalendarCheck className="w-3 h-3 text-primary shrink-0" />
                            {format(scheduleDate, "dd MMM", { locale: ar })}
                          </div>
                          <span className="text-xs text-muted-foreground/60">
                            {format(scheduleDate, "hh:mm a")}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border ${meta.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {meta.label}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {orderAmount(booking).toLocaleString("ar-SA")} <span className="text-xs text-muted-foreground font-normal">ل.س</span>
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
                              <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-success focus:text-success"
                                onClick={() => onUpdateStatus(bookingId, "accepted")}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> تأكيد الحجز
                              </DropdownMenuItem>
                            )}
                            {(booking.status === "pending" || booking.status === "accepted") && (
                              <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-danger focus:text-danger"
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

      {/* `filtered.length < 10` used to stand in for "last page", which
          disables next on any short final page even when more exist. */}
      <TablePagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / 10))}
        total={total}
        shown={filtered.length}
        unit="حجز"
        onPageChange={onPageChange}
        className="bg-secondary/10"
      />
    </Card>
  );
}
