"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllServices, createService, updateService, deleteService } from "@/infrastructure/services/services.service";
import { getExcelSummary } from "@/infrastructure/services/stats.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Service } from "@/domain/entities/service.types";

import { ServicesStats } from "./components/services-stats";
import { ServiceDialog } from "./components/service-dialog";
import { ServicesList } from "./components/services-list";

// Lucide Icons for categories
import { Car, Settings2, Wrench, ShieldAlert, Zap } from "lucide-react";

export const categoryMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  CAR_WASH:            { label: "غسيل وتلميع", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Car },
  OIL_CHANGE:          { label: "تغيير زيت", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Settings2 },
  GENERAL_MAINTENANCE: { label: "صيانة عامة", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: Wrench },
  TIRE_SERVICE:        { label: "إطارات وبنشر", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: ShieldAlert },
  BATTERY:             { label: "كهرباء وبطارية", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Zap },
  TOWING:              { label: "سطحة / سحب", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Car },
  DIAGNOSTICS:         { label: "فحص كمبيوتر", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: Settings2 },
  PAINT_REPAIR:        { label: "حدادة وبويا", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", icon: Wrench }
};

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Service | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: getAllServices,
    retry: false,
  });

  const { data: excelSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["admin-excel-summary"],
    queryFn: getExcelSummary,
    retry: 1,
  });

  const services: Service[] = data?.services ?? data?.data ?? [];

  const createMut = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("✅ تم إضافة الخدمة بنجاح");
      closeModal();
    },
    onError: () => toast.error("فشل إضافة الخدمة"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("✅ تم تحديث الخدمة بنجاح");
      closeModal();
    },
    onError: () => toast.error("فشل تحديث الخدمة"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("تم حذف الخدمة");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("فشل حذف الخدمة");
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
      createMut.mutate(payload as any);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/15 px-5 py-4 rounded-2xl border border-border/30 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">إدارة فئات الخدمة والتسعير</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                تهيئة وتعديل بطاقات الخدمات الأساسية المعروضة للزبائن.
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
              <div className="relative w-48 sm:w-56">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
                <Input
                  placeholder="ابحث عن اسم الخدمة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background/80 border-border/40 text-xs h-9 pr-9 rounded-lg"
                />
              </div>
              <Button onClick={openCreate} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                <Plus className="w-4 h-4" /> إضافة فئة جديدة
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="m-0 border-0 p-0 bg-transparent flex items-center">
            <span className="text-xs font-semibold text-violet-400 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
              إحصائيات وحلول ذكية
            </span>
          </TabsContent>
        </div>

        <TabsContent value="list" className="m-0 border-0 p-0 bg-transparent space-y-6 focus-visible:outline-none">
          <ServicesList
            services={services}
            isLoading={isLoading}
            search={search}
            onEdit={openEdit}
            onDelete={(id) => setDeleteId(id)}
            onToggleActive={(id, isActive) => toggleActiveMut.mutate({ id, isActive })}
            categoryMeta={categoryMeta}
          />
        </TabsContent>

        <TabsContent value="stats" className="m-0 border-0 p-0 bg-transparent space-y-6 focus-visible:outline-none">
          <ServicesStats
            categoryData={excelSummary?.CATEGORY_DATA}
            emergencyByCategory={excelSummary?.EMERGENCY_BY_CATEGORY}
            isLoading={isSummaryLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <ServiceDialog
        open={modalOpen}
        onClose={closeModal}
        editData={editData}
        onSave={handleSave}
        isPending={createMut.isPending || updateMut.isPending}
        categoryMeta={categoryMeta}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
              تأكيد حذف فئة الخدمة
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            سيتم إزالة الخدمة نهائياً من قائمة الفئات، ولن يتمكن العملاء من طلبها مجدداً. هل أنت متأكد من الحذف؟
          </p>
          <DialogFooter className="gap-2 mt-4 pt-2 border-t border-border/20">
            <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} className="border-border/40 font-bold">إلغاء</Button>
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
              onClick={() => deleteId && deleteMut.mutate(deleteId)}
              disabled={deleteMut.isPending}>
              {deleteMut.isPending ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
