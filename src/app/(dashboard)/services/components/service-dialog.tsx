"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Calculator, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Service } from "@/domain/entities/service.types";

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  editData: Service | null;
  onSave: (payload: any) => void;
  isPending: boolean;
  categoryMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }>;
}

const EMPTY_FORM = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  category: "car_wash",
  basePrice: 0,
  discountedPrice: 0,
  estimatedDuration: 30,
  sortOrder: 0,
  isEmergency: false,
  isActive: true,
};

export function ServiceDialog({ open, onClose, editData, onSave, isPending, categoryMeta }: ServiceDialogProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showEstimator, setShowEstimator] = useState(false);
  const [calcFuelRate, setCalcFuelRate] = useState(12500);
  const [calcDifficulty, setCalcDifficulty] = useState("1.0");

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || editData.nameAr || "",
        nameAr: editData.nameAr || editData.name || "",
        description: editData.description || "",
        descriptionAr: editData.descriptionAr || "",
        category: editData.category || "car_wash",
        basePrice: Number(editData.basePrice || 0),
        discountedPrice: Number(editData.discountedPrice || 0),
        estimatedDuration: Number(editData.estimatedDuration || 30),
        sortOrder: Number(editData.sortOrder || 0),
        isEmergency: Boolean(editData.isEmergency),
        isActive: editData.isActive !== false,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setShowEstimator(false);
  }, [editData, open]);

  const handleSave = () => {
    if (!form.nameAr.trim()) {
      toast.error("يرجى إدخال اسم الخدمة بالعربية");
      return;
    }
    if (!form.name.trim()) {
      toast.error("يرجى إدخال اسم الخدمة بالإنجليزية أو المعرف");
      return;
    }
    if (form.basePrice < 0 || form.discountedPrice < 0) {
      toast.error("السعر لا يمكن أن يكون سالباً");
      return;
    }
    if (form.discountedPrice > 0 && form.discountedPrice > form.basePrice) {
      toast.error("السعر المخفض يجب أن يكون أقل من السعر الأساسي");
      return;
    }
    if (form.estimatedDuration < 1) {
      toast.error("المدة المتوقعة يجب أن تكون دقيقة واحدة على الأقل");
      return;
    }
    onSave(form);
  };

  const fuelComponent = calcFuelRate * 1.5;
  const timeComponent = form.estimatedDuration * 1200 * Number(calcDifficulty);
  const rawEstimate = fuelComponent + timeComponent;
  const recommendedPrice = form.isEmergency ? Math.round(rawEstimate * 1.25) : Math.round(rawEstimate);

  const applyEstimatedPrice = () => {
    setForm({ ...form, basePrice: recommendedPrice });
    setShowEstimator(false);
    toast.success("تم تطبيق السعر التقديري المقترح");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl overflow-y-auto max-h-[85vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            {editData ? "تعديل بيانات الخدمة" : "إضافة خدمة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">اسم الخدمة بالعربية</Label>
              <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="bg-secondary/40 border-border/40 text-xs h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">اسم الخدمة بالإنجليزية / المعرف</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" className="bg-secondary/40 border-border/40 text-xs h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">التصنيف</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v || "car_wash" })}>
                <SelectTrigger className="h-9 bg-secondary/40 border-border/40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/40 rounded-xl">
                  {Object.entries(categoryMeta).map(([val, { label }]) => (
                    <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">ترتيب الظهور</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} dir="ltr" className="bg-secondary/40 border-border/40 text-xs h-9" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold flex items-center justify-between">
                السعر الأساسي
                <button type="button" onClick={() => setShowEstimator(!showEstimator)} className="text-[10px] text-primary font-black flex items-center gap-1 hover:underline">
                  <Calculator className="w-3 h-3" />
                  مساعد التسعير
                </button>
              </Label>
              <Input type="number" value={form.basePrice || ""} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} dir="ltr" className="bg-secondary/40 border-border/40 text-xs h-9 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">السعر المخفض</Label>
              <Input type="number" value={form.discountedPrice || ""} onChange={(e) => setForm({ ...form, discountedPrice: Number(e.target.value) })} dir="ltr" className="bg-secondary/40 border-border/40 text-xs h-9 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">المدة المتوقعة بالدقائق</Label>
              <Input type="number" value={form.estimatedDuration || ""} onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })} dir="ltr" className="bg-secondary/40 border-border/40 text-xs h-9 font-mono" />
            </div>
          </div>

          {showEstimator && (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-3.5 space-y-3.5 animate-fade-in-up">
              <div className="flex items-center gap-2 border-b border-primary/10 pb-1.5">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-white">مساعد التسعير التقديري</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={calcFuelRate} onChange={(e) => setCalcFuelRate(Number(e.target.value))} className="h-8 text-xs bg-background/50 border-border/40 font-mono" />
                <Select value={calcDifficulty} onValueChange={(v) => setCalcDifficulty(v || "1.0")}>
                  <SelectTrigger className="h-8 bg-background/50 border-border/40 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">منخفضة</SelectItem>
                    <SelectItem value="1.3">متوسطة</SelectItem>
                    <SelectItem value="1.6">مرتفعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2.5 rounded-lg bg-background/40 border border-border/20 text-xs font-bold text-white flex justify-between">
                <span>السعر المقترح</span>
                <span className="text-primary">{recommendedPrice.toLocaleString("ar-SA")} ل.س</span>
              </div>
              <Button type="button" size="sm" onClick={applyEstimatedPrice} className="w-full h-8 text-[11px] font-bold gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                تطبيق السعر المقترح
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">الوصف العربي</Label>
              <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">الوصف الإنجليزي</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/30">
              <div>
                <p className="text-xs font-medium text-foreground">خدمة طارئة</p>
                <p className="text-[10px] text-muted-foreground">تظهر ضمن خدمات المساعدة الفورية</p>
              </div>
              <Switch checked={form.isEmergency} onCheckedChange={(v) => setForm({ ...form, isEmergency: v })} className="data-[state=checked]:bg-rose-500 shrink-0" />
            </div>
            <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/30">
              <div>
                <p className="text-xs font-medium text-foreground">الخدمة نشطة</p>
                <p className="text-[10px] text-muted-foreground">تظهر للمستخدمين في الاختيارات</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} className="data-[state=checked]:bg-emerald-500 shrink-0" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2 pt-2 border-t border-border/25">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending} className="border-border/40 font-bold">إلغاء</Button>
          <Button size="sm" onClick={handleSave} disabled={isPending} className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/25 min-w-[120px] gap-2">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {editData ? "حفظ التغييرات" : "إضافة الخدمة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
