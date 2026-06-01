"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminRow } from "./admins-table";

const EMPTY = { name: "", email: "", password: "", permissions: [] as string[] };
interface Props { open: boolean; onOpenChange: (open: boolean) => void; editData: AdminRow | null; onSave: (form: typeof EMPTY) => void; isPending: boolean; allPermissions: string[]; permissionLabels: Record<string, string>; }
export default function AdminFormDialog({ open, onOpenChange, editData, onSave, isPending, allPermissions, permissionLabels }: Props) {
  const [form, setForm] = useState(EMPTY);
  useEffect(() => setForm(editData ? { name: editData.name, email: editData.email, password: "", permissions: editData.permissions ?? [] } : EMPTY), [editData, open]);
  const toggle = (permission: string) => setForm((value) => ({ ...value, permissions: value.permissions.includes(permission) ? value.permissions.filter((item) => item !== permission) : [...value.permissions, permission] }));
  const valid = editData || (form.name.trim() && form.email.trim() && form.password.length >= 8);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl" className="max-w-2xl"><DialogHeader><DialogTitle>{editData ? `صلاحيات ${editData.name}` : "إضافة مسؤول جديد"}</DialogTitle></DialogHeader>
    {!editData && <div className="grid gap-3 sm:grid-cols-2"><div><Label>الاسم الكامل</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div><Label>البريد الإلكتروني</Label><Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="sm:col-span-2"><Label>كلمة المرور</Label><Input type="password" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><p className="mt-1 text-[11px] text-muted-foreground">8 محارف على الأقل، مع حرف كبير وصغير ورقم.</p></div></div>}
    <div><Label>الصلاحيات الممنوحة</Label><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{allPermissions.map((permission) => <button type="button" key={permission} onClick={() => toggle(permission)} className={`border px-2 py-2 text-xs ${form.permissions.includes(permission) ? "border-primary bg-primary/15 text-primary" : "border-border/50 text-muted-foreground"}`}>{permissionLabels[permission]}</button>)}</div></div>
    <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button disabled={!valid || isPending} onClick={() => onSave(form)}>{isPending ? "جار الحفظ..." : "حفظ"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
