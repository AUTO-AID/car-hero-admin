"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Package,
  Search,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteBooking, getAllOrders, updateBookingStatus, type OrderFilters } from "@/infrastructure/services/bookings.service";

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "all", label: "كل الحالات" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "accepted", label: "مقبول" },
  { value: "provider_assigned", label: "تم تعيين مزود" },
  { value: "provider_en_route", label: "المزود بالطريق" },
  { value: "provider_arrived", label: "وصل المزود" },
  { value: "in_progress", label: "جاري التنفيذ" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
  { value: "rejected", label: "مرفوض" },
];

const statusCards = [
  { value: "pending", label: "قيد الانتظار", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { value: "in_progress", label: "قيد التنفيذ", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  { value: "completed", label: "مكتملة", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "cancelled", label: "ملغاة", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  { value: "rejected", label: "مرفوضة", color: "text-red-400 bg-red-400/10 border-red-400/20" },
];

const nextStatusLabels: Record<string, string> = {
  accepted: "قبول الطلب",
  provider_assigned: "تعيين مزود",
  provider_en_route: "المزود بالطريق",
  provider_arrived: "وصل المزود",
  in_progress: "بدء التنفيذ",
  completed: "إنهاء الطلب",
  cancelled: "إلغاء الطلب",
  rejected: "رفض الطلب",
};

const allowedTransitions: Record<string, string[]> = {
  pending: ["accepted", "provider_assigned", "cancelled", "rejected"],
  accepted: ["provider_en_route", "provider_arrived", "in_progress", "cancelled", "rejected"],
  provider_assigned: ["provider_en_route", "provider_arrived", "in_progress", "cancelled", "rejected"],
  provider_en_route: ["provider_arrived", "in_progress", "cancelled"],
  provider_arrived: ["in_progress", "cancelled"],
  in_progress: ["completed"],
};

function unwrapOrders(payload: any) {
  const container = payload?.data ?? payload;
  return {
    orders: container?.orders ?? payload?.orders ?? [],
    pagination: container?.pagination ?? payload?.pagination ?? {},
    facets: container?.facets ?? payload?.facets ?? {},
  };
}

function amount(order: any) {
  return Number(order.payableAmount ?? order.totalAmount ?? order.total ?? 0);
}

function getCount(facets: any, status: string) {
  return facets?.statusCounts?.find((item: any) => item._id === status)?.count ?? 0;
}

function exportCsv(rows: any[]) {
  const header = ["orderNumber", "user", "provider", "service", "status", "paymentStatus", "paymentMethod", "amount", "createdAt"];
  const csvRows = rows.map((order) =>
    [
      order.orderNumber,
      order.user?.fullName,
      order.provider?.businessName,
      order.service?.name,
      order.status,
      order.paymentStatus,
      order.paymentMethod,
      amount(order),
      order.createdAt,
    ]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );

  const blob = new Blob([[header.join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-page-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function OrderDetailsDialog({ order, onClose }: { order: any | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            تفاصيل الطلب {order?.orderNumber}
          </DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "العميل", value: order.user?.fullName || "غير معروف", icon: User },
                { label: "المزود", value: order.provider?.businessName || "لم يعين", icon: Wrench },
                { label: "الخدمة", value: order.service?.name || order.serviceName || "غير محدد", icon: Package },
                { label: "الموقع", value: order.address || "غير محدد", icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border/30 bg-secondary/20 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {label}
                  </p>
                  <p className="text-xs font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">حالة الطلب</p>
                <StatusBadge status={order.status} />
              </div>
              <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">الدفع</p>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">طريقة الدفع</p>
                <p className="text-xs font-bold text-white">{order.paymentMethod || "-"}</p>
              </div>
              <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">المبلغ</p>
                <p className="text-xs font-black text-primary">{amount(order).toLocaleString("ar-SA")} ل.س</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/30 bg-secondary/10 p-3">
              <p className="text-[10px] font-bold text-muted-foreground mb-2">التواريخ</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <span>أنشئ: {order.createdAt ? format(new Date(order.createdAt), "yyyy-MM-dd HH:mm") : "-"}</span>
                <span>مجدول: {order.scheduledAt ? format(new Date(order.scheduledAt), "yyyy-MM-dd HH:mm") : "لا"}</span>
                <span>بدأ: {order.startedAt ? format(new Date(order.startedAt), "yyyy-MM-dd HH:mm") : "-"}</span>
                <span>اكتمل: {order.completedAt ? format(new Date(order.completedAt), "yyyy-MM-dd HH:mm") : "-"}</span>
              </div>
            </div>

            {(order.userNotes || order.cancellationReason) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-[10px] text-amber-400 font-bold mb-1">ملاحظات</p>
                <p className="text-xs text-foreground/85">{order.userNotes || order.cancellationReason}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    paymentMethod: "all",
    isScheduled: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const queryFilters: OrderFilters = useMemo(
    () => ({
      search: search.trim(),
      paymentStatus: filters.paymentStatus,
      paymentMethod: filters.paymentMethod,
      isScheduled: filters.isScheduled,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters, search],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders-page", page, filters.status, queryFilters],
    queryFn: () => getAllOrders(page, PAGE_SIZE, filters.status === "all" ? undefined : filters.status, queryFilters),
    retry: 1,
  });

  const { orders, pagination, facets } = unwrapOrders(data);
  const total = Number(pagination?.total ?? 0);
  const totalPages = Number(pagination?.pages ?? Math.ceil(total / PAGE_SIZE));
  const totals = facets?.totals ?? {};

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-page"] });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "تعذر تحديث حالة الطلب"),
  });

  const removeOrder = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-page"] });
      toast.success("تم حذف الطلب");
      setDeleteId(null);
    },
    onError: () => toast.error("تعذر حذف الطلب"),
  });

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setFilters({
      status: "all",
      paymentStatus: "all",
      paymentMethod: "all",
      isScheduled: "all",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger">
        {statusCards.map(({ value, label, color }) => (
          <Card
            key={value}
            className={`p-4 bg-card border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              filters.status === value ? color : "border-border/40 hover:border-border/80"
            }`}
            onClick={() => setFilter("status", filters.status === value ? "all" : value)}
          >
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <p className={`text-2xl font-bold tabular-nums tracking-tight ${filters.status === value ? "" : color.split(" ")[0]}`}>
                {getCount(facets, value).toLocaleString("ar-SA")}
              </p>
              <p className={`text-[11px] font-medium ${filters.status === value ? "" : "text-muted-foreground"}`}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-card/70 border-border/40">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">إجمالي نتائج الفلتر</p>
          <p className="text-xl font-black text-white">{total.toLocaleString("ar-SA")}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">قيمة الطلبات ضمن الفلتر</p>
          <p className="text-xl font-black text-primary">{Number(totals.revenue || 0).toLocaleString("ar-SA")} ل.س</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">طلبات مجدولة ضمن الفلتر</p>
          <p className="text-xl font-black text-blue-400">{Number(totals.scheduled || 0).toLocaleString("ar-SA")}</p>
        </div>
      </Card>

      <Card className="bg-card border-border/40 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 p-5 border-b border-border/30 bg-secondary/20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 mr-auto">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm tracking-tight">إدارة الطلبات</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">بحث وفرز وإجراءات مباشرة على orders من قاعدة البيانات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <Input
                  placeholder="رقم الطلب، العميل، الهاتف، المزود، الخدمة..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="bg-background border-border/40 text-xs h-9 pr-9 rounded-lg placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
                />
              </div>
              <Button variant="outline" onClick={() => exportCsv(orders)} disabled={orders.length === 0} className="h-9 gap-2 text-xs border-border/40">
                <Download className="w-3.5 h-3.5" />
                تصدير الصفحة
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-10 gap-2">
            <Select value={filters.status} onValueChange={(value) => setFilter("status", value || "all")}>
              <SelectTrigger className="h-9 bg-background border-border/40 text-xs">
                <Filter className="w-3 h-3 ml-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filters.paymentStatus} onValueChange={(value) => setFilter("paymentStatus", value || "all")}>
              <SelectTrigger className="h-9 bg-background border-border/40 text-xs"><SelectValue placeholder="حالة الدفع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل حالات الدفع</SelectItem>
                <SelectItem value="pending">قيد الدفع</SelectItem>
                <SelectItem value="completed">مدفوع</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
                <SelectItem value="refunded">مسترد</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.paymentMethod} onValueChange={(value) => setFilter("paymentMethod", value || "all")}>
              <SelectTrigger className="h-9 bg-background border-border/40 text-xs"><SelectValue placeholder="طريقة الدفع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الطرق</SelectItem>
                {facets?.paymentMethods?.map((method: any) => (
                  <SelectItem key={method._id} value={method._id}>{method._id} ({method.count})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.isScheduled} onValueChange={(value) => setFilter("isScheduled", value || "all")}>
              <SelectTrigger className="h-9 bg-background border-border/40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الطلبات</SelectItem>
                <SelectItem value="true">مجدولة فقط</SelectItem>
                <SelectItem value="false">فورية فقط</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={filters.dateFrom} onChange={(event) => setFilter("dateFrom", event.target.value)} className="h-9 bg-background border-border/40 text-xs" />
            <Input type="date" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} className="h-9 bg-background border-border/40 text-xs" />
            <Input type="number" value={filters.minAmount} onChange={(event) => setFilter("minAmount", event.target.value)} placeholder="أدنى مبلغ" className="h-9 bg-background border-border/40 text-xs" />
            <Input type="number" value={filters.maxAmount} onChange={(event) => setFilter("maxAmount", event.target.value)} placeholder="أعلى مبلغ" className="h-9 bg-background border-border/40 text-xs" />
            <Select value={filters.sortBy} onValueChange={(value) => setFilter("sortBy", value || "createdAt")}>
              <SelectTrigger className="h-9 bg-background border-border/40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">الأحدث</SelectItem>
                <SelectItem value="scheduledAt">وقت الجدولة</SelectItem>
                <SelectItem value="amount">المبلغ</SelectItem>
                <SelectItem value="status">الحالة</SelectItem>
                <SelectItem value="orderNumber">رقم الطلب</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select value={filters.sortOrder} onValueChange={(value) => setFilter("sortOrder", value === "asc" ? "asc" : "desc")}>
                <SelectTrigger className="h-9 bg-background border-border/40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">تنازلي</SelectItem>
                  <SelectItem value="asc">تصاعدي</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={resetFilters} className="h-9 w-9 shrink-0 bg-background border-border/40" title="مسح الفلاتر">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border/20 bg-secondary/10">
                {["الطلب", "العميل", "المزود", "الخدمة", "الحالة", "الدفع", "المبلغ", "الموقع والوقت", ""].map((header) => (
                  <th key={header} className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, cell) => (
                      <td key={cell} className="px-5 py-4"><div className="h-3 rounded bg-secondary/60" /></td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-rose-400">تعذر تحميل الطلبات من الخادم</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <Package className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">لا توجد طلبات مطابقة للفلاتر الحالية</p>
                  </td>
                </tr>
              ) : (
                orders.map((order: any, index: number) => (
                  <tr key={order._id || order.id} className="table-row-hover transition-colors animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-mono font-bold text-foreground">{order.orderNumber}</span>
                        {order.isScheduled && <Badge variant="outline" className="text-[9px] text-blue-400 bg-blue-400/10 border-blue-400/20 w-fit"><CalendarIcon className="w-2.5 h-2.5 ml-1" /> مجدول</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">{order.user?.fullName ?? "غير معروف"}</span>
                        <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">{order.user?.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-foreground">{order.provider?.businessName ?? "لم يعين"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                        {order.service?.name ?? order.serviceName ?? "غير معروف"}
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
                      <span className="text-xs font-bold text-foreground tabular-nums">{amount(order).toLocaleString("ar-SA")} <span className="font-normal text-[10px] text-muted-foreground">ل.س</span></span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{order.address || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { locale: ar, addSuffix: true }) : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-popover border-border/50 rounded-xl">
                          <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            <Eye className="w-3.5 h-3.5" /> عرض التفاصيل
                          </DropdownMenuItem>
                          {(allowedTransitions[order.status] || []).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              className="gap-2 text-xs cursor-pointer"
                              onClick={() => updateStatus.mutate({ id: order._id || order.id, status })}
                            >
                              {status === "cancelled" || status === "rejected" ? <X className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              {nextStatusLabels[status]}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-xs text-destructive cursor-pointer" onClick={() => setDeleteId(order._id || order.id)}>
                            <Trash2 className="w-3.5 h-3.5" /> حذف الطلب
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-border/20 bg-secondary/10">
          <p className="text-[11px] text-muted-foreground/60">
            عرض <span className="font-bold text-foreground">{orders.length}</span> من <span className="font-bold text-foreground">{total.toLocaleString("ar-SA")}</span> طلب
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="h-7 text-[10px] border-border/40 rounded-lg bg-background hover:bg-secondary">السابق</Button>
            <span className="text-[11px] px-3 text-muted-foreground/60 tabular-nums font-medium">صفحة {page} / {Math.max(totalPages, 1)}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages || totalPages === 0} className="h-7 text-[10px] border-border/40 rounded-lg bg-background hover:bg-secondary">التالي</Button>
          </div>
        </div>
      </Card>

      <OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle className="text-white text-sm font-bold">تأكيد حذف الطلب</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">سيتم حذف الطلب نهائياً من قاعدة البيانات. استخدم هذا الخيار للحالات الإدارية فقط.</p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={removeOrder.isPending}>إلغاء</Button>
            <Button variant="destructive" onClick={() => deleteId && removeOrder.mutate(deleteId)} disabled={removeOrder.isPending} className="gap-2">
              {removeOrder.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
