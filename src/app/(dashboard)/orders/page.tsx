"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, MapPin, Clock, User, Wrench, Calendar as CalendarIcon, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { getAllBookings } from "@/infrastructure/services/bookings.service";


const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "active", label: "نشط" },
  { value: "in_progress", label: "جاري" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders-page-bookings", page, statusFilter],
    queryFn: () => getAllBookings(page, 10, statusFilter === "all" ? undefined : statusFilter),
    retry: 1,
  });

  const orders = data?.data?.bookings ?? data?.bookings ?? (Array.isArray(data?.data) ? data.data : []);

  const filtered = orders.filter((o: any) => {
    const matchSearch =
      (o.orderNumber || o.bookingNumber || "").includes(search) ||
      (o.user?.fullName || "").includes(search) ||
      (o.service?.name || "").includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* ───── Stats Row ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger">
        {statusOptions.slice(1).map(({ value, label }) => {
          const count = orders.filter((o: any) => o.status === value).length;
          const colors: Record<string, string> = {
            pending: "text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-amber-400/5",
            active: "text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-400/5",
            in_progress: "text-violet-400 bg-violet-400/10 border-violet-400/20 shadow-violet-400/5",
            completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-400/5",
            cancelled: "text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-rose-400/5",
          };
          return (
            <Card
              key={value}
              className={`p-4 bg-card border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                statusFilter === value ? colors[value] : "border-border/40 hover:border-border/80"
              }`}
              onClick={() => setStatusFilter(value === statusFilter ? "all" : value)}
            >
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <p className={`text-2xl font-bold tabular-nums tracking-tight ${statusFilter === value ? "" : colors[value].split(" ")[0]}`}>
                  {count}
                </p>
                <p className={`text-[11px] font-medium ${statusFilter === value ? "" : "text-muted-foreground"}`}>
                  {label}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ───── Table Section ───── */}
      <Card className="bg-card border-border/40 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-5 border-b border-border/30 bg-secondary/20">
          <div className="flex items-center gap-2 mr-auto">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-white text-sm tracking-tight">إدارة الطلبات</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input
                placeholder="رقم الطلب، العميل، الخدمة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background border-border/40 text-xs h-9 pr-9 rounded-lg placeholder:text-muted-foreground/40 focus-visible:ring-primary/20 transition-all"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
              <SelectTrigger className="w-40 h-9 bg-background border-border/40 text-xs rounded-lg">
                <Filter className="w-3 h-3 ml-2 text-muted-foreground" />
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border/20 bg-secondary/10">
                {["الطلب", "العميل", "المزود", "الخدمة", "الحالة", "الدفع", "المبلغ", "الموقع والوقت"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">لا توجد طلبات مطابقة للبحث</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order: any, i: number) => (
                  <tr key={order._id} className="table-row-hover transition-colors animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-mono font-bold text-foreground">{order.orderNumber}</span>
                        {order.isScheduled && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20 w-fit">
                            <CalendarIcon className="w-2.5 h-2.5" /> مجدول
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{order.user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.provider ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                            <Wrench className="w-3 h-3 text-violet-400" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{order.provider.businessName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 px-2">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                        {order.service.name}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={order.paymentStatus} />
                        <span className="text-[9px] text-muted-foreground/60">{order.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-foreground tabular-nums tracking-tight">
                        {order.payableAmount.toLocaleString("ar-SA")} <span className="font-normal text-[10px] text-muted-foreground">ل.س</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[120px]">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          {formatDistanceToNow(order.createdAt, { locale: ar, addSuffix: true })}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/20 bg-secondary/10">
          <p className="text-[11px] text-muted-foreground/60">
            عرض <span className="font-bold text-foreground">{filtered.length}</span> طلب
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1} className="h-7 text-[10px] border-border/40 rounded-lg bg-background hover:bg-secondary">السابق</Button>
            <span className="text-[11px] px-3 text-muted-foreground/60 tabular-nums font-medium">صفحة {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}
              className="h-7 text-[10px] border-border/40 rounded-lg bg-background hover:bg-secondary">التالي</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
