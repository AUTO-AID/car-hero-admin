"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserCog, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/application/contexts/auth-context";
import {
  listAdmins,
  createAdmin,
  updateAdminPermissions,
  toggleAdminStatus,
  deleteAdmin,
} from "@/infrastructure/services/admins.service";
import AdminsTable from "./components/admins-table";
import AdminFormDialog from "./components/admin-form-dialog";
import AdminDeleteDialog from "./components/admin-delete-dialog";


const permissionLabels: Record<string, string> = {
  all: "الوصول الكامل", finance: "المالية", wallet: "المحفظة",
  orders: "الطلبات", bookings: "الحجوزات", providers: "المزودون",
  users: "العملاء", reviews: "التقييمات", notifications: "الإشعارات",
  services: "الخدمات", settings: "الإعدادات",
};

const ALL_PERMISSIONS = Object.keys(permissionLabels).filter((k) => k !== "all");

export default function AdminsPage() {
  const { admin: currentAdmin } = useAuth();
  const queryClient = useQueryClient();

  const canManageAdmins = currentAdmin?.role === "ADMIN";

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-list"],
    queryFn: listAdmins,
    retry: false,
    enabled: canManageAdmins,
  });

  const admins: any[] = data?.admins ?? data?.data ?? [];

  const createMut = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      toast.success("✅ تم إنشاء حساب المسؤول");
      closeModal();
    },
    onError: () => toast.error("فشل إنشاء الحساب"),
  });

  const updatePermsMut = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      updateAdminPermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      toast.success("✅ تم تحديث الصلاحيات");
      closeModal();
    },
    onError: () => toast.error("فشل تحديث الصلاحيات"),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      toast.success("تم تحديث حالة الحساب");
    },
    onError: () => toast.error("فشل تحديث الحالة"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-list"] });
      toast.success("تم حذف الحساب");
      setDeleteId(null);
    },
    onError: () => {
      toast.error("فشل حذف الحساب");
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (adm: any) => {
    setEditData(adm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleSave = (form: any) => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("يرجى تعبئة الاسم والبريد الإلكتروني");
      return;
    }
    if (!editData && !form.password.trim()) {
      toast.error("يرجى إدخال كلمة المرور للحساب الجديد");
      return;
    }
    if (editData) {
      updatePermsMut.mutate({ id: editData._id, permissions: form.permissions });
    } else {
      createMut.mutate({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        permissions: form.permissions,
      } as any);
    }
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleMut.mutate({ id, isActive });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMut.mutate(deleteId);
    }
  };

  const isPending = createMut.isPending || updatePermsMut.isPending;

  if (!canManageAdmins) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center font-arabic" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">صلاحية غير كافية</h3>
        <p className="text-sm text-muted-foreground max-w-xs">هذه الصفحة مخصصة لحسابات الإدارة النشطة فقط.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20 px-5 py-4 rounded-2xl border border-border/30">
        <div className="text-right">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 justify-end">
            فريق الإدارة <ShieldCheck className="w-5 h-5 text-primary" />
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            التحكم في صلاحيات الوصول للوحة التحكم.
            <span className="text-primary font-medium mr-2">{admins.length} مسؤول</span>
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 px-5 w-full sm:w-auto">
          <UserCog className="w-4 h-4" /> إضافة مسؤول
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
        {[
          { label: "إجمالي المسؤولين", value: admins.length, color: "text-primary" },
          { label: "حسابات نشطة", value: admins.filter((a) => a.isActive).length, color: "text-emerald-400" },
          { label: "حسابات معطّلة", value: admins.filter((a) => !a.isActive).length, color: "text-rose-400" },
          { label: "????? ??????? ?????", value: admins.length, color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 bg-card border-border/40 text-center">
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table/Cards */}
      <AdminsTable
        admins={admins}
        isLoading={isLoading}
        onEdit={openEdit}
        onDeleteClick={setDeleteId}
        onToggleStatus={handleToggleStatus}
        permissionLabels={permissionLabels}
      />

      <AdminFormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        editData={editData}
        onSave={handleSave}
        isPending={isPending}
        allPermissions={ALL_PERMISSIONS}
        permissionLabels={permissionLabels}
      />

      <AdminDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMut.isPending}
      />
    </div>
  );
}
