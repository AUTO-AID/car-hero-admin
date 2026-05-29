"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: Admin | null;
  onSave: (data: any) => void;
  isPending: boolean;
  allPermissions: string[];
  permissionLabels: Record<string, string>;
}

const EMPTY_FORM = { name: "", email: "", password: "", role: "ADMIN", permissions: [] as string[] };

export default function AdminFormDialog({
  open,
  onOpenChange,
  editData,
  onSave,
  isPending,
  allPermissions,
  permissionLabels,
}: AdminFormDialogProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        email: editData.email,
        password: "",
        role: editData.role,
        permissions: editData.permissions ?? [],
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [editData, open]);

  const togglePerm = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {editData ? `تعديل صلاحيات: ${editData.name}` : "إضافة مسؤول جديد"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!editData && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-right">
                  <Label className="text-xs text-muted-foreground">الاسم الكامل</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="أحمد محمد" className="bg-secondary/40 border-border/40 text-sm h-9" />
                </div>
                <div className="space-y-1.5 text-right">
                  <Label className="text-xs text-muted-foreground">البريد الإلكتروني</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@carhero.com" dir="ltr" className="bg-secondary/40 border-border/40 text-sm h-9" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <Label className="text-xs text-muted-foreground">كلمة المرور</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" dir="ltr" className="bg-secondary/40 border-border/40 text-sm h-9" />
              </div>
            </>
          )}

          <div className="space-y-2 text-right">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">الصلاحيات الممنوحة</Label>
            <div className="grid grid-cols-3 gap-2">
              {allPermissions.map((perm) => {
                const active = form.permissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePerm(perm)}
                    className={`text-[11px] font-medium px-2.5 py-2 rounded-xl border transition-all text-center ${
                      active
                        ? "bg-primary/15 text-primary border-primary/30 shadow-sm shadow-primary/10"
                        : "bg-secondary/30 text-muted-foreground border-border/40 hover:border-border/80"
                    }`}
                  >
                    {permissionLabels[perm]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-border/40">إلغاء</Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 min-w-[100px]">
            {isPending ? "جاري الحفظ..." : editData ? "حفظ الصلاحيات" : "إنشاء الحساب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
