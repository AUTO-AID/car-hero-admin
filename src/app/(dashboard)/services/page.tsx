"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Battery, Car, Download, Fuel, KeyRound, Plus, Search, Settings2, ShieldAlert, SlidersHorizontal, Wrench, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createService, deleteService, getAllServices, updateService, type ServiceFilters } from "@/infrastructure/services/services.service";
import { Service } from "@/domain/entities/service.types";
import { ServicesStats } from "./components/services-stats";
import { ServiceDialog } from "./components/service-dialog";
import { ServicesList } from "./components/services-list";

export const categoryMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  roadside_assistance: { label: "مساعدة الطريق", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: ShieldAlert },
  towing: { label: "سطحة / سحب", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Car },
  battery: { label: "بطارية", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Battery },
  tire: { label: "إطارات", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: Wrench },
  fuel: { label: "وقود", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Fuel },
  lockout: { label: "فتح أقفال", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: KeyRound },
  maintenance: { label: "صيانة", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: Settings2 },
  car_wash: { label: "غسيل", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", icon: Car },
  other: { label: "أخرى", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", icon: Zap },
};

function unwrapServices(payload: any) {
  const container = payload?.data ?? payload;
  return {
    services: (container?.services ?? container?.data ?? (Array.isArray(container) ? container : [])) as Service[],
    pagination: container?.pagination ?? {},
    facets: container?.facets ?? {},
  };
}

function exportCsv(rows: Service[]) {
  const header = ["name", "nameAr", "category", "basePrice", "discountedPrice", "estimatedDuration", "isActive", "isEmergency", "ordersCount", "ordersRevenue"];
  const csvRows = rows.map((service) =>
    header.map((key) => `"${String((service as any)[key] ?? "").replace(/"/g, '""')}"`).join(","),
  );
  const blob = new Blob([[header.join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `services-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Service | null>(null);
  const [filters, setFilters] = useState({
    category: "all",
    isActive: "all",
    isEmergency: "all",
    sortBy: "sortOrder",
    sortOrder: "asc" as "asc" | "desc",
  });

  const queryFilters: ServiceFilters = useMemo(
    () => ({
      search: search.trim(),
      ...filters,
    }),
    [filters, search],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-services", queryFilters],
    queryFn: () => getAllServices(queryFilters, 1, 100),
    retry: 1,
  });

  const { services, facets } = unwrapServices(data);

  const createMut = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تمت إضافة الخدمة بنجاح");
      closeModal();
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "فشل إضافة الخدمة"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تم تحديث الخدمة بنجاح");
      closeModal();
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "فشل تحديث الخدمة"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تم إيقاف الخدمة وإخفاؤها من واجهة العملاء");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("فشل إيقاف الخدمة");
      setDeleteId(null);
    },
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateService(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تم تحديث حالة الخدمة بنجاح");
    },
    onError: () => toast.error("فشل تحديث حالة الخدمة في السيرفر"),
  });

  const openCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditData(svc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleSave = (payload: any) => {
    if (editData) {
      const id = editData._id || editData.id || "";
      updateMut.mutate({ id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full space-y-6">
        <div className="flex flex-col gap-4 bg-secondary/15 px-5 py-4 rounded-2xl border border-border/30 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">إدارة الخدمات والتسعير</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  إدارة كتالوج الخدمات الأساسي وربطه بإحصاءات الطلبات الفعلية.
                </p>
              </div>

              <TabsList className="flex h-auto gap-1 rounded-xl border border-border/40 bg-secondary/30 p-1">
                <TabsTrigger value="list" className="rounded-lg px-4 py-1.5 text-xs transition-all data-[state=active]:bg-card text-white">
                  قائمة الخدمات
                </TabsTrigger>
                <TabsTrigger value="stats" className="rounded-lg px-4 py-1.5 text-xs transition-all data-[state=active]:bg-card text-white">
                  إحصائيات الخدمات
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="m-0 border-0 p-0 bg-transparent">
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" onClick={() => exportCsv(services)} disabled={services.length === 0} className="gap-2 border-border/40 font-bold">
                  <Download className="w-4 h-4" />
                  تصدير
                </Button>
                <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> إضافة خدمة
                </Button>
              </div>
            </TabsContent>
          </div>

          <TabsContent value="list" className="m-0 border-0 p-0 bg-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
                <Input
                  placeholder="ابحث عن اسم الخدمة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background/80 border-border/40 text-xs h-9 pr-9 rounded-lg"
                />
              </div>
              <Select value={filters.category} onValueChange={(value) => setFilter("category", value || "all")}>
                <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {Object.entries(categoryMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.isActive} onValueChange={(value) => setFilter("isActive", value || "all")}>
                <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="true">نشطة</SelectItem>
                  <SelectItem value="false">موقوفة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.isEmergency} onValueChange={(value) => setFilter("isEmergency", value || "all")}>
                <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  <SelectItem value="true">طارئة</SelectItem>
                  <SelectItem value="false">عادية</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.sortBy} onValueChange={(value) => setFilter("sortBy", value || "sortOrder")}>
                <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs">
                  <SlidersHorizontal className="w-3 h-3 ml-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sortOrder">ترتيب الظهور</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                  <SelectItem value="price">السعر</SelectItem>
                  <SelectItem value="duration">المدة</SelectItem>
                  <SelectItem value="usage">الاستخدام</SelectItem>
                  <SelectItem value="revenue">الإيراد</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.sortOrder} onValueChange={(value) => setFilter("sortOrder", value === "desc" ? "desc" : "asc")}>
                <SelectTrigger className="h-9 bg-background/80 border-border/40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">تصاعدي</SelectItem>
                  <SelectItem value="desc">تنازلي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </div>

        <TabsContent value="list" className="m-0 border-0 p-0 bg-transparent space-y-6 focus-visible:outline-none">
          {isError ? (
            <Card className="p-8 bg-card/60 border-border/40 text-center text-rose-400">تعذر تحميل الخدمات من الخادم</Card>
          ) : (
            <ServicesList
              services={services}
              isLoading={isLoading}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
              onToggleActive={(id, isActive) => toggleActiveMut.mutate({ id, isActive })}
              categoryMeta={categoryMeta}
            />
          )}
        </TabsContent>

        <TabsContent value="stats" className="m-0 border-0 p-0 bg-transparent space-y-6 focus-visible:outline-none">
          <ServicesStats facets={facets} categoryMeta={categoryMeta} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <ServiceDialog
        open={modalOpen}
        onClose={closeModal}
        editData={editData}
        onSave={handleSave}
        isPending={createMut.isPending || updateMut.isPending}
        categoryMeta={categoryMeta}
      />

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              إيقاف الخدمة
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            سيتم إيقاف الخدمة وإخفاؤها من واجهة العملاء مع الحفاظ على سجلات الطلبات المرتبطة بها.
          </p>
          <DialogFooter className="gap-2 mt-4 pt-2 border-t border-border/20">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} className="border-border/40 font-bold">إلغاء</Button>
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              disabled={deleteMut.isPending}>
              {deleteMut.isPending ? "جاري الإيقاف..." : "تأكيد الإيقاف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
