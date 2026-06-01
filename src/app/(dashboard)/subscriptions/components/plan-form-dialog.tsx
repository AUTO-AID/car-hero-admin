"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type MembershipPlan = {
  _id: string;
  name: string;
  nameAr: string;
  price: number;
  durationDays: number;
  tier?: string;
  isActive: boolean;
  features?: string[];
  featuresAr?: string[];
  subscribers?: number;
  activeSubscribers?: number;
  revenue?: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: MembershipPlan | null;
  onSave: (data: any) => void;
  isPending: boolean;
}

const emptyForm = { name: "", nameAr: "", price: 0, durationDays: 30, tier: "basic", features: "", featuresAr: "", isActive: true };

export default function PlanFormDialog({ open, onOpenChange, editData, onSave, isPending }: Props) {
  const [form, setForm] = useState({ ...emptyForm });
  useEffect(() => {
    setForm(editData ? {
      name: editData.name,
      nameAr: editData.nameAr,
      price: editData.price,
      durationDays: editData.durationDays,
      tier: editData.tier || "basic",
      features: (editData.features || []).join("\n"),
      featuresAr: (editData.featuresAr || []).join("\n"),
      isActive: editData.isActive,
    } : { ...emptyForm });
  }, [editData, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-xl max-w-xl" dir="rtl">
        <DialogHeader><DialogTitle className="text-white text-sm font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-primary" />{editData ? "تعديل خطة الاشتراك" : "إضافة خطة اشتراك"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الاسم بالعربية"><Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} /></Field>
          <Field label="الاسم بالإنجليزية"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" /></Field>
          <Field label="السعر (ل.س)"><Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} dir="ltr" /></Field>
          <Field label="المدة بالأيام"><Input type="number" min={1} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} dir="ltr" /></Field>
          <Field label="المستوى">
            <Select value={form.tier} onValueChange={(value) => setForm({ ...form, tier: value || "basic" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="basic">أساسي</SelectItem><SelectItem value="silver">فضي</SelectItem><SelectItem value="gold">ذهبي</SelectItem><SelectItem value="platinum">بلاتيني</SelectItem></SelectContent>
            </Select>
          </Field>
          <div className="flex items-center justify-between self-end h-8 border border-border/40 rounded-lg px-3"><span className="text-xs">متاحة للاشتراك</span><Switch checked={form.isActive} onCheckedChange={(value) => setForm({ ...form, isActive: value })} /></div>
          <Field label="المزايا بالعربية" className="sm:col-span-2"><textarea value={form.featuresAr} onChange={(e) => setForm({ ...form, featuresAr: e.target.value })} rows={3} className="w-full rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-xs outline-none" placeholder="ميزة في كل سطر" /></Field>
          <Field label="المزايا بالإنجليزية" className="sm:col-span-2"><textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={3} dir="ltr" className="w-full rounded-lg border border-border/40 bg-secondary/30 px-3 py-2 text-xs outline-none" placeholder="One feature per line" /></Field>
        </div>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button disabled={isPending} onClick={() => onSave(form)}>{isPending ? "جاري الحفظ..." : "حفظ الخطة"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-1.5 ${className}`}><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
