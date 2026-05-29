"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, Plus } from "lucide-react";
import {
  getAllMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  getMembershipSubscribers,
} from "@/infrastructure/services/subscriptions.service";
import PlansList from "./components/plans-list";
import SubscribersTable from "./components/subscribers-table";
import PlanFormDialog from "./components/plan-form-dialog";
import PlanDeleteDialog from "./components/plan-delete-dialog";

type MembershipPlan = {
  _id: string;
  name: string;
  nameEn?: string;
  price: number;
  durationDays: number;
  tier?: string;
  isActive: boolean;
  features?: string[];
  subscribers?: number;
};


const tierOrder: Record<string, number> = { basic: 0, silver: 1, gold: 2, platinum: 3 };

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("plans");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<MembershipPlan | null>(null);
  const [subPage, setSubPage] = useState(1);

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["admin-memberships"],
    queryFn: getAllMembershipPlans,
    retry: false,
  });

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscribers", subPage],
    queryFn: () => getMembershipSubscribers(subPage, 10),
    retry: false,
    enabled: tab === "subscribers",
  });

  const plans: MembershipPlan[] = [
    ...(plansData?.plans ?? plansData?.data ?? []),
  ].sort((a, b) => (tierOrder[a.tier ?? "basic"] ?? 0) - (tierOrder[b.tier ?? "basic"] ?? 0));

  const subscribers = subsData?.subscribers ?? subsData?.data ?? [];
  const totalSubs = subsData?.total ?? 0;

  const createMut = useMutation({
    mutationFn: createMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast.success("✅ تم إنشاء الخطة");
      closeModal();
    },
    onError: () => toast.error("فشل إنشاء الخطة"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateMembershipPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast.success("✅ تم تحديث الخطة");
      closeModal();
    },
    onError: () => toast.error("فشل تحديث الخطة"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteMembershipPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast.success("تم حذف الخطة");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("فشل حذف الخطة");
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditData(plan);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleSave = (form: any) => {
    if (!form.name.trim()) {
      toast.error("يرجى إدخال اسم الخطة");
      return;
    }
    const payload = {
      ...form,
      features: form.features.split("\n").map((f: string) => f.trim()).filter(Boolean),
    };
    if (editData) {
      updateMut.mutate({ id: editData._id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMut.mutate(deleteId);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/30 bg-card/45 p-4 shadow-sm shadow-black/10 lg:flex-row lg:items-center lg:justify-between font-arabic" dir="rtl">
          <div className="min-w-0 text-right">
            <h2 className="text-base font-bold text-white tracking-tight">إدارة الخطط والاشتراكات</h2>
            <p className="text-xs text-muted-foreground mt-0.5">إدارة مستويات الاشتراك ومتابعة المشتركين.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            <TabsList className="h-10 w-full rounded-xl border border-border/40 bg-secondary/30 p-1 sm:w-fit">
              <TabsTrigger value="plans" className="min-w-28 rounded-lg px-4 text-xs data-active:bg-card data-[state=active]:bg-card gap-1.5">
                <Package className="w-3.5 h-3.5" /> الخطط
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="min-w-32 rounded-lg px-4 text-xs data-active:bg-card data-[state=active]:bg-card gap-1.5">
                <Users className="w-3.5 h-3.5" /> المشتركون
                <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] px-1 py-0 shadow-none">
                  {totalSubs}
                </Badge>
              </TabsTrigger>
            </TabsList>
            {tab === "plans" && (
              <Button onClick={openCreate} size="sm" className="h-10 gap-2 rounded-xl bg-primary px-4 text-white shadow-lg shadow-primary/25 hover:bg-primary/90">
                <Plus className="w-3.5 h-3.5" /> خطة جديدة
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="plans" className="m-0 focus-visible:outline-none">
          <PlansList
            plans={plans}
            isLoading={plansLoading}
            onEdit={openEdit}
            onDeleteClick={setDeleteId}
          />
        </TabsContent>

        <TabsContent value="subscribers" className="m-0 focus-visible:outline-none" dir="rtl">
          <SubscribersTable
            subscribers={subscribers}
            isLoading={subsLoading}
            total={totalSubs}
            page={subPage}
            setPage={setSubPage}
          />
        </TabsContent>
      </Tabs>

      <PlanFormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        editData={editData}
        onSave={handleSave}
        isPending={isPending}
      />

      <PlanDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMut.isPending}
      />
    </div>
  );
}
