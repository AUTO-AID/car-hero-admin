"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cancelOrder,
  deleteBooking,
  getAllOrders,
  rejectOrder,
  updateBookingStatus,
  type OrderFilters,
  type OrderRecord,
} from "@/infrastructure/services/bookings.service";
import { apiErrorMessage } from "@/infrastructure/api/response";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { useDebouncedValue } from "@/application/hooks/use-debounced-value";
import { TablePagination } from "@/components/ui/table-pagination";
import { OrderDetailsDialog } from "./components/order-details-dialog";

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
  { value: "pending", label: "قيد الانتظار", color: "badge-warning" },
  { value: "in_progress", label: "قيد التنفيذ", color: "text-info bg-violet-400/10 border-violet-400/20" },
  { value: "completed", label: "مكتملة", color: "badge-success" },
  { value: "cancelled", label: "ملغاة", color: "badge-danger" },
  { value: "rejected", label: "مرفوضة", color: "badge-danger" },
];

const paymentStatusLabels: Record<string, string> = {
  all: "كل الحالات",
  pending: "قيد الدفع",
  completed: "مدفوع",
  failed: "فشل",
  refunded: "مسترد",
};

const scheduleLabels: Record<string, string> = {
  all: "كل الطلبات",
  true: "مجدولة",
  false: "فورية",
};

const sortByLabels: Record<string, string> = {
  createdAt: "الأحدث",
  scheduledAt: "وقت الجدولة",
  amount: "المبلغ",
  status: "الحالة",
  orderNumber: "رقم الطلب",
};

const sortOrderLabels: Record<string, string> = {
  desc: "تنازلي",
  asc: "تصاعدي",
};

const optionLabel = (options: Array<{ value: string; label: string }>, value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

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

type OrderFacets = {
  totals?: Record<string, number>;
  statusCounts?: Array<{ _id: string; count: number }>;
  paymentMethods?: Array<{ _id: string; count: number }>;
};

function unwrapOrders(payload: {
  data?: {
    orders?: OrderRecord[];
    pagination?: Record<string, unknown>;
    facets?: OrderFacets;
  };
  orders?: OrderRecord[];
  pagination?: Record<string, unknown>;
  facets?: OrderFacets;
} | undefined): { orders: OrderRecord[]; pagination: Record<string, unknown>; facets: OrderFacets } {
  const container = payload?.data ?? payload;
  return {
    orders: container?.orders ?? payload?.orders ?? [],
    pagination: container?.pagination ?? payload?.pagination ?? {},
    facets: container?.facets ?? payload?.facets ?? {},
  };
}

function amount(order: OrderRecord) {
  return Number(order.payableAmount ?? order.totalAmount ?? order.total ?? 0);
}

function getCount(facets: { statusCounts?: Array<{ _id: string; count: number }> } | undefined, status: string) {
  return facets?.statusCounts?.find((item) => item._id === status)?.count ?? 0;
}

function exportCsv(rows: OrderRecord[]) {
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


export function OrdersPageContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial states from searchParams
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "all";
  const initialPaymentStatus = searchParams.get("paymentStatus") || "all";
  const initialPaymentMethod = searchParams.get("paymentMethod") || "all";
  const initialIsScheduled = searchParams.get("isScheduled") || "all";
  const initialDateFrom = searchParams.get("dateFrom") || "";
  const initialDateTo = searchParams.get("dateTo") || "";
  const initialMinAmount = searchParams.get("minAmount") || "";
  const initialMaxAmount = searchParams.get("maxAmount") || "";
  const initialSortBy = searchParams.get("sortBy") || "createdAt";
  const initialSortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<{ id: string; status: "cancelled" | "rejected" } | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [filters, setFilters] = useState({
    status: initialStatus,
    paymentStatus: initialPaymentStatus,
    paymentMethod: initialPaymentMethod,
    isScheduled: initialIsScheduled,
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
    minAmount: initialMinAmount,
    maxAmount: initialMaxAmount,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  });

  // Sync state back to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.paymentStatus !== "all") params.set("paymentStatus", filters.paymentStatus);
    if (filters.paymentMethod !== "all") params.set("paymentMethod", filters.paymentMethod);
    if (filters.isScheduled !== "all") params.set("isScheduled", filters.isScheduled);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.minAmount) params.set("minAmount", filters.minAmount);
    if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);
    if (filters.sortBy !== "createdAt") params.set("sortBy", filters.sortBy);
    if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [debouncedSearch, filters, page, pathname, router]);

  const queryFilters: OrderFilters = useMemo(
    () => ({
      search: debouncedSearch.trim(),
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
    [debouncedSearch, filters],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim() !== "") count++;
    if (filters.status !== "all") count++;
    if (filters.paymentStatus !== "all") count++;
    if (filters.paymentMethod !== "all") count++;
    if (filters.isScheduled !== "all") count++;
    if (filters.dateFrom !== "") count++;
    if (filters.dateTo !== "") count++;
    if (filters.minAmount !== "") count++;
    if (filters.maxAmount !== "") count++;
    if (filters.sortBy !== "createdAt") count++;
    if (filters.sortOrder !== "desc") count++;
    return count;
  }, [search, filters]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: queryKeys.orders.list(page, filters.status, queryFilters),
    queryFn: () => getAllOrders(page, PAGE_SIZE, filters.status === "all" ? undefined : filters.status, queryFilters),
    retry: 1,
    placeholderData: keepPreviousData,
  });

  const { orders, pagination, facets } = unwrapOrders(data);
  const total = Number(pagination?.total ?? 0);
  const totalPages = Number(pagination?.pages ?? Math.ceil(total / PAGE_SIZE));
  const totals = facets?.totals ?? {};

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: (error) => toast.error(apiErrorMessage(error, "تعذر تحديث حالة الطلب")),
  });

  const terminalStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: "cancelled" | "rejected"; reason: string }) =>
      status === "cancelled" ? cancelOrder(id, reason) : rejectOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(variables.status === "cancelled" ? "تم إلغاء الطلب مع حفظ السبب" : "تم رفض الطلب مع حفظ السبب");
      setStatusAction(null);
      setStatusReason("");
    },
    onError: (error) => toast.error(apiErrorMessage(error, "تعذر تنفيذ الإجراء")),
  });

  const removeOrder = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
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
              <p className={`text-xs font-semibold ${filters.status === value ? "" : "text-muted-foreground"}`}>{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-card/70 border-border/40">
        <div>
          <p className="text-xs text-muted-foreground mb-1">إجمالي نتائج الفلتر</p>
          <p className="text-xl font-bold text-white">{total.toLocaleString("ar-SA")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">قيمة الطلبات ضمن الفلتر</p>
          <p className="text-xl font-bold text-primary">{Number(totals.revenue || 0).toLocaleString("ar-SA")} ل.س</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">طلبات مجدولة ضمن الفلتر</p>
          <p className="text-xl font-bold text-info">{Number(totals.scheduled || 0).toLocaleString("ar-SA")}</p>
        </div>
      </Card>

      <Card className="bg-card border-border/40 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 p-5 border-b border-border/30 bg-secondary/20">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 ms-auto">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm tracking-tight">إدارة الطلبات</h2>
                <p className="text-xs text-muted-foreground mt-0.5">بحث وفرز وإجراءات مباشرة على orders من قاعدة البيانات</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
              <div className="relative flex-1 lg:w-80 min-w-[200px]">
                {search !== debouncedSearch || isFetching ? (
                  <Loader2 className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary animate-spin" />
                ) : (
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                )}
                <Input
                  placeholder="رقم الطلب، العميل، الهاتف، المزود، الخدمة..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="bg-background border-border/40 text-xs h-9 ps-9 rounded-lg placeholder:text-muted-foreground/60 focus-visible:ring-primary/20"
                />
              </div>

              {/* الفلاتر الأساسية السريعة */}
              <div className="hidden sm:flex items-center gap-2">
                <Select value={filters.status} onValueChange={(value) => setFilter("status", value || "all")}>
                  <SelectTrigger className={`h-9 bg-background text-xs w-36 rounded-lg transition-all ${filters.status !== "all" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`}>
                    <FilterSelectValue label="الحالة" value={optionLabel(statusOptions, filters.status)} />
                  </SelectTrigger>
                  <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                </Select>

                <Select value={filters.isScheduled} onValueChange={(value) => setFilter("isScheduled", value || "all")}>
                  <SelectTrigger className={`h-9 bg-background text-xs w-36 rounded-lg transition-all ${filters.isScheduled !== "all" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`}>
                    <FilterSelectValue label="نوع الطلب" value={scheduleLabels[filters.isScheduled] ?? filters.isScheduled} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الطلبات</SelectItem>
                    <SelectItem value="true">مجدولة فقط</SelectItem>
                    <SelectItem value="false">فورية فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="h-9 px-3 text-xs gap-1.5 text-danger hover:text-danger hover:bg-rose-500/10 border border-rose-500/20 rounded-lg shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  إعادة ضبط
                </Button>
              )}
              
              <Sheet>
                <SheetTrigger render={
                  <Button variant="outline" className={`h-9 gap-2 text-xs rounded-lg transition-all ${
                    activeFiltersCount > 0 
                      ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" 
                      : "border-border/40 bg-secondary/30 hover:bg-secondary"
                  }`}>
                    <Filter className="w-3.5 h-3.5" />
                    فلاتر متقدمة
                    {activeFiltersCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground px-1">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                } />
                <SheetContent side="right" className="bg-card border-e-border/40 w-full sm:max-w-md overflow-y-auto" dir="rtl">
                  <SheetHeader className="mb-6 text-start">
                    <SheetTitle className="text-start flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      فلاتر متقدمة والفرز
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-5">
                    {/* Status & Types */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">التصنيف الأساسي</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={filters.status} onValueChange={(value) => setFilter("status", value || "all")}>
                          <SelectTrigger className={`h-9 bg-background text-xs transition-all ${filters.status !== "all" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`}>
                            <FilterSelectValue label="الحالة" value={optionLabel(statusOptions, filters.status)} />
                          </SelectTrigger>
                          <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={filters.isScheduled} onValueChange={(value) => setFilter("isScheduled", value || "all")}>
                          <SelectTrigger className={`h-9 bg-background text-xs transition-all ${filters.isScheduled !== "all" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`}>
                            <FilterSelectValue label="نوع الطلب" value={scheduleLabels[filters.isScheduled] ?? filters.isScheduled} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل الطلبات</SelectItem>
                            <SelectItem value="true">مجدولة فقط</SelectItem>
                            <SelectItem value="false">فورية فقط</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Finance */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">المالية والدفع</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={filters.paymentStatus} onValueChange={(value) => setFilter("paymentStatus", value || "all")}>
                          <SelectTrigger className={`h-9 bg-background text-xs transition-all ${filters.paymentStatus !== "all" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`}>
                            <FilterSelectValue label="الدفع" value={paymentStatusLabels[filters.paymentStatus] ?? filters.paymentStatus} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل حالات الدفع</SelectItem>
                            <SelectItem value="pending">قيد الدفع</SelectItem>
                            <SelectItem value="completed">مدفوع</SelectItem>
                            <SelectItem value="failed">فشل</SelectItem>
                            <SelectItem value="refunded">مسترد</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filters.paymentMethod} onValueChange={(value) => setFilter("paymentMethod", value || "all")}>
                          <SelectTrigger className={`h-9 bg-background text-xs transition-all ${filters.paymentMethod !== "all" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`}>
                            <FilterSelectValue label="طريقة الدفع" value={filters.paymentMethod === "all" ? "كل الطرق" : filters.paymentMethod} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل الطرق</SelectItem>
                            {facets?.paymentMethods?.map((method: { _id: string; count: number }) => (
                              <SelectItem key={method._id} value={method._id}>{method._id} ({method.count})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" value={filters.minAmount} onChange={(event) => setFilter("minAmount", event.target.value)} placeholder="أدنى مبلغ" className={`h-9 bg-background text-xs transition-all ${filters.minAmount !== "" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`} />
                        <Input type="number" value={filters.maxAmount} onChange={(event) => setFilter("maxAmount", event.target.value)} placeholder="أعلى مبلغ" className={`h-9 bg-background text-xs transition-all ${filters.maxAmount !== "" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`} />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">التاريخ والوقت</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="date" aria-label="من تاريخ" value={filters.dateFrom} onChange={(event) => setFilter("dateFrom", event.target.value)} className={`h-9 bg-background text-xs transition-all ${filters.dateFrom !== "" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`} />
                        <Input type="date" aria-label="إلى تاريخ" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} className={`h-9 bg-background text-xs transition-all ${filters.dateTo !== "" ? "border-primary bg-primary/5 text-primary" : "border-border/40"}`} />
                      </div>
                    </div>

                    {/* Sorting */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الترتيب والفرز</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={filters.sortBy} onValueChange={(value) => setFilter("sortBy", value || "createdAt")}>
                          <SelectTrigger className="h-9 bg-background border-border/40 text-xs">
                            <FilterSelectValue label="الفرز" value={sortByLabels[filters.sortBy] ?? filters.sortBy} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="createdAt">الأحدث</SelectItem>
                            <SelectItem value="scheduledAt">وقت الجدولة</SelectItem>
                            <SelectItem value="amount">المبلغ</SelectItem>
                            <SelectItem value="status">الحالة</SelectItem>
                            <SelectItem value="orderNumber">رقم الطلب</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filters.sortOrder} onValueChange={(value) => setFilter("sortOrder", value === "asc" ? "asc" : "desc")}>
                          <SelectTrigger className="h-9 bg-background border-border/40 text-xs">
                            <FilterSelectValue label="الاتجاه" value={sortOrderLabels[filters.sortOrder]} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="desc">تنازلي</SelectItem>
                            <SelectItem value="asc">تصاعدي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-border/20">
                    <Button variant="outline" onClick={resetFilters} className="w-full h-10 gap-2 border-rose-500/20 text-danger hover:bg-rose-500/10 hover:text-danger">
                      <X className="w-4 h-4" />
                      مسح جميع الفلاتر
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="outline" onClick={() => exportCsv(orders)} disabled={orders.length === 0} className="h-9 gap-2 text-xs border-border/40">
                <Download className="w-3.5 h-3.5" />
                تصدير الصفحة
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="قائمة الطلبات">
          <table className="w-full text-start">
            <caption className="sr-only">قائمة الطلبات</caption>
            <thead>
              <tr className="border-b border-border/20 bg-secondary/10">
                {["الطلب", "العميل", "المزود", "الخدمة", "الحالة", "الدفع", "المبلغ", "الموقع والوقت", ""].map((header) => (
                  <th scope="col" key={header} className="text-start px-5 py-3.5 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">
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
                <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-danger">تعذر تحميل الطلبات من الخادم</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8">
                    <EmptyState
                      title="لم يتم العثور على طلبات"
                      description="لا توجد طلبات تطابق خيارات الفرز أو البحث الحالية."
                      icon={Package}
                      action={{
                        label: "إعادة ضبط الفلاتر",
                        onClick: resetFilters,
                      }}
                    />
                  </td>
                </tr>
              ) : (
                orders.map((order: OrderRecord, index: number) => (
                  <tr key={order._id || order.id} className="table-row-hover transition-colors animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-mono font-bold text-foreground">{order.orderNumber}</span>
                        {order.isScheduled && <Badge variant="outline" className="text-xs text-info bg-blue-400/10 border-blue-400/20 w-fit"><CalendarIcon className="w-2.5 h-2.5 me-1" /> مجدول</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">{order.user?.fullName ?? "غير معروف"}</span>
                        <span className="text-xs text-muted-foreground font-mono" dir="ltr">{order.user?.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-foreground">{order.provider?.businessName ?? "لم يعين"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                        {order.service?.name ?? order.serviceName ?? "غير معروف"}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={order.paymentStatus ?? "pending"} />
                        <span className="text-xs text-muted-foreground/60">{order.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-foreground tabular-nums">{amount(order).toLocaleString("ar-SA")} <span className="font-normal text-xs text-muted-foreground">ل.س</span></span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{order.address || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { locale: ar, addSuffix: true }) : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-end">
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
                              onClick={() => {
                                const id = order._id || order.id;
                                if (!id) return;
                                if (status === "cancelled" || status === "rejected") {
                                  setStatusAction({ id, status });
                                  return;
                                }
                                updateStatus.mutate({ id, status });
                              }}
                            >
                              {status === "cancelled" || status === "rejected" ? <X className="w-3.5 h-3.5 text-danger" /> : <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                              {nextStatusLabels[status]}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-xs text-destructive cursor-pointer" onClick={() => {
                            const id = order._id || order.id;
                            if (id) setDeleteId(id);
                          }}>
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

        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          shown={orders.length}
          unit="طلب"
          onPageChange={(next) => setPage(() => next)}
          className="bg-secondary/10"
        />
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

      <Dialog open={Boolean(statusAction)} onOpenChange={(open) => { if (!open) { setStatusAction(null); setStatusReason(""); } }}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold">
              {statusAction?.status === "cancelled" ? "سبب إلغاء الطلب" : "سبب رفض الطلب"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={statusReason}
            onChange={(event) => setStatusReason(event.target.value)}
            placeholder="اكتب سببًا واضحًا ليظهر في سجل حالة الطلب..."
            rows={4}
          />
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => { setStatusAction(null); setStatusReason(""); }} disabled={terminalStatusMutation.isPending}>
              تراجع
            </Button>
            <Button
              variant="destructive"
              disabled={terminalStatusMutation.isPending || statusReason.trim().length < 5}
              onClick={() => statusAction && terminalStatusMutation.mutate({ ...statusAction, reason: statusReason.trim() })}
            >
              {terminalStatusMutation.isPending ? "جار التنفيذ..." : statusAction?.status === "cancelled" ? "إلغاء الطلب" : "رفض الطلب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
