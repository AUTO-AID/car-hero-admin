"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Crown } from "lucide-react";

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

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: MembershipPlan | null;
  onSave: (data: any) => void;
  isPending: boolean;
}

const EMPTY_FORM = { name: "", nameEn: "", price: 0, durationDays: 30, features: "", isActive: true };

export default function PlanFormDialog({
  open,
  onOpenChange,
  editData,
  onSave,
  isPending,
}: PlanFormDialogProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        nameEn: editData.nameEn ?? "",
        price: editData.price,
        durationDays: editData.durationDays,
        features: (editData.features ?? []).join("\n"),
        isActive: editData.isActive,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [editData, open]);

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            {editData ? `تعديل خطة: ${editData.name}` : "إضافة خطة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 text-right">
              <Label className="text-xs text-muted-foreground">اسم الخطة (عربي)</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="الفضية" className="bg-secondary/40 border-border/40 text-sm h-9" />
            </div>
            <div className="space-y-1.5 text-right">
              <Label className="text-xs text-muted-foreground">السعر (ل.س)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="499" dir="ltr" className="bg-secondary/40 border-border/40 text-sm h-9" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <Label className="text-xs text-muted-foreground">مدة الاشتراك (بالأيام)</Label>
            <Input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              placeholder="30" dir="ltr" className="bg-secondary/40 border-border/40 text-sm h-9" />
          </div>
          <div className="space-y-1.5 text-right">
            <Label className="text-xs text-muted-foreground">المزايا (سطر لكل ميزة)</Label>
            <textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder={"5 حجوزات شهرياً\nخصم 10% على الخدمات\nدعم مميز"}
              rows={4}
              className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 text-right"
            />
          </div>
          <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/30">
            <p className="text-xs font-medium text-foreground">الخطة نشطة للمستخدمين</p>
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              className="data-[state=checked]:bg-emerald-500" />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-border/40">إلغاء</Button>
          <Button size="sm" onClick={handleSubmit} disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 min-w-[100px]">
            {isPending ? "جاري الحفظ..." : editData ? "حفظ التعديلات" : "إنشاء الخطة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
