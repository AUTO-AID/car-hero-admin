"use client";

import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Search, ShieldCheck, SlidersHorizontal, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/application/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createAdmin, deleteAdmin, listAdmins, resetAdminPassword,
  toggleAdminStatus, updateAdminPermissions,
} from "@/infrastructure/services/admins.service";
import AdminDeleteDialog from "./components/admin-delete-dialog";
import AdminFormDialog from "./components/admin-form-dialog";
import AdminsTable, { AdminRow } from "./components/admins-table";

export const permissionLabels: Record<string, string> = {
  "*": "وصول كامل",
  "admin.profile": "الملف الشخصي",
  "admins.read": "عرض المسؤولين",
  "admins.create": "إضافة مسؤول",
  "admins.update": "تعديل المسؤولين",
  "admins.delete": "حذف المسؤولين",
  "analytics.read": "التحليلات",
  "audit.read": "سجل النشاطات",
  "finance.read": "المالية",
  "providers.read": "عرض المزودين",
  "providers.approve": "اعتماد المزودين",
  "providers.reject": "رفض المزودين",
  "providers.update": "تعديل المزودين",
  "users.read": "عرض العملاء",
  "users.update": "تعديل العملاء",
  "users.status": "حالة العملاء",
  "users.delete": "حذف العملاء",
  "services.read": "عرض الخدمات",
  "services.create": "إضافة الخدمات",
  "services.update": "تعديل الخدمات",
  "services.delete": "حذف الخدمات",
  "subscriptions.read": "عرض الاشتراكات",
  "subscriptions.create": "إضافة الاشتراكات",
  "subscriptions.update": "تعديل الاشتراكات",
  "subscriptions.delete": "حذف الاشتراكات",
  "settings.read": "عرض الإعدادات",
  "settings.update": "تعديل الإعدادات",
};

const ALL_PERMISSIONS = Object.keys(permissionLabels);
const errorMessage = (error: any, fallback: string) => error?.response?.data?.message ?? fallback;

export default function AdminsPage() {
  const { admin: currentAdmin } = useAuth();
  const queryClient = useQueryClient();
  const permissions = currentAdmin?.permissions ?? [];
  const has = (permission: string) => permissions.includes("*") || permissions.includes("all") || permissions.includes(permission);
  const canRead = has("admins.read");
  const canCreate = has("admins.create");
  const canUpdate = has("admins.update");
  const canDelete = has("admins.delete");
  const currentAdminId = currentAdmin?._id ?? currentAdmin?.id;

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [permission, setPermission] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<AdminRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [passwordAdmin, setPasswordAdmin] = useState<AdminRow | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const filters = { search: deferredSearch.trim() || undefined, status, permission: permission === "all" ? undefined : permission };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-list", filters],
    queryFn: () => listAdmins(filters),
    enabled: canRead,
    retry: false,
  });
  const admins: AdminRow[] = data?.admins ?? [];
  const stats = data?.stats ?? { total: 0, active: 0, inactive: 0, managers: 0 };
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-list"] });

  const createMut = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => { refresh(); setModalOpen(false); toast.success("تم إنشاء حساب المسؤول"); },
    onError: (error) => toast.error(errorMessage(error, "تعذر إنشاء الحساب")),
  });
  const permissionsMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: string[] }) => updateAdminPermissions(id, values),
    onSuccess: () => { refresh(); setModalOpen(false); toast.success("تم تحديث الصلاحيات"); },
    onError: (error) => toast.error(errorMessage(error, "تعذر تحديث الصلاحيات")),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleAdminStatus(id, isActive),
    onSuccess: () => { refresh(); toast.success("تم تحديث حالة الحساب"); },
    onError: (error) => toast.error(errorMessage(error, "تعذر تحديث الحالة")),
  });
  const deleteMut = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => { refresh(); setDeleteId(null); toast.success("تم حذف الحساب"); },
    onError: (error) => toast.error(errorMessage(error, "تعذر حذف الحساب")),
  });
  const passwordMut = useMutation({
    mutationFn: () => resetAdminPassword(passwordAdmin!._id, newPassword),
    onSuccess: () => { setPasswordAdmin(null); setNewPassword(""); toast.success("تم تعيين كلمة المرور الجديدة وإنهاء جلسات الحساب السابقة"); },
    onError: (error) => toast.error(errorMessage(error, "تعذر إعادة تعيين كلمة المرور")),
  });

  if (!canRead) return <AccessDenied />;

  return (
    <div className="space-y-5 font-arabic" dir="rtl">
      <div className="flex flex-col gap-4 border-b border-border/30 bg-secondary/15 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-primary" /> فريق الإدارة</h2>
          <p className="mt-1 text-xs text-muted-foreground">إدارة الحسابات والصلاحيات وحالة الوصول إلى لوحة التحكم</p>
        </div>
        {canCreate && <Button onClick={() => { setEditData(null); setModalOpen(true); }} className="gap-2"><UserCog className="h-4 w-4" /> إضافة مسؤول</Button>}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["إجمالي المسؤولين", stats.total, "text-primary"],
          ["حسابات نشطة", stats.active, "text-emerald-400"],
          ["حسابات معطلة", stats.inactive, "text-rose-400"],
          ["مديرو الفريق", stats.managers, "text-amber-400"],
        ].map(([label, value, color]) => <Card key={String(label)} className="p-4 text-center"><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{label}</p></Card>)}
      </div>

      <div className="flex flex-col gap-2 border-y border-border/20 bg-secondary/5 p-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد الإلكتروني" className="pr-9" /></div>
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}><SelectTrigger className="sm:w-40"><SlidersHorizontal className="h-3.5 w-3.5" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="active">نشط</SelectItem><SelectItem value="inactive">معطل</SelectItem></SelectContent></Select>
        <Select value={permission} onValueChange={(value) => setPermission(value ?? "all")}><SelectTrigger className="sm:w-48"><SelectValue placeholder="كل الصلاحيات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الصلاحيات</SelectItem>{ALL_PERMISSIONS.map((item) => <SelectItem value={item} key={item}>{permissionLabels[item]}</SelectItem>)}</SelectContent></Select>
      </div>

      <AdminsTable admins={admins} isLoading={isLoading} isError={isError} currentAdminId={currentAdminId} canUpdate={canUpdate} canDelete={canDelete} permissionLabels={permissionLabels} onEdit={(row) => { setEditData(row); setModalOpen(true); }} onPassword={setPasswordAdmin} onDeleteClick={setDeleteId} onToggleStatus={(id, isActive) => toggleMut.mutate({ id, isActive })} />
      <AdminFormDialog open={modalOpen} onOpenChange={setModalOpen} editData={editData} onSave={(form) => editData ? permissionsMut.mutate({ id: editData._id, values: form.permissions }) : createMut.mutate(form)} isPending={createMut.isPending || permissionsMut.isPending} allPermissions={ALL_PERMISSIONS} permissionLabels={permissionLabels} />
      <AdminDeleteDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} onConfirm={() => deleteId && deleteMut.mutate(deleteId)} isPending={deleteMut.isPending} />
      <Dialog open={!!passwordAdmin} onOpenChange={(open) => { if (!open) { setPasswordAdmin(null); setNewPassword(""); } }}><DialogContent dir="rtl"><DialogHeader><DialogTitle>إعادة تعيين كلمة المرور</DialogTitle></DialogHeader><p className="text-xs text-muted-foreground">سيتم إنهاء جلسات {passwordAdmin?.name} السابقة. أدخل كلمة مرور من 8 محارف تتضمن حرفا كبيرا وصغيرا ورقما.</p><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} dir="ltr" /><DialogFooter><Button variant="outline" onClick={() => setPasswordAdmin(null)}>إلغاء</Button><Button disabled={passwordMut.isPending || newPassword.length < 8} onClick={() => passwordMut.mutate()}>حفظ</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

function AccessDenied() {
  return <div className="flex min-h-[400px] flex-col items-center justify-center text-center" dir="rtl"><AlertCircle className="mb-3 h-8 w-8 text-rose-400" /><h3 className="font-bold text-white">صلاحية غير كافية</h3><p className="mt-1 text-sm text-muted-foreground">تحتاج إلى صلاحية عرض المسؤولين للوصول إلى هذه الصفحة.</p></div>;
}
