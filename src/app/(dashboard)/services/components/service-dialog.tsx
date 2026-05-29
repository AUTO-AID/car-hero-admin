"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Calculator, ArrowLeftRight } from "lucide-react";
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
  category: "CAR_WASH",
  basePrice: 0,
  estimatedDuration: 30,
  isEmergency: false,
  isActive: true,
};

export function ServiceDialog({ open, onClose, editData, onSave, isPending, categoryMeta }: ServiceDialogProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showEstimator, setShowEstimator] = useState(false);
  const [calcFuelRate, CalcFuelRate] = useState(12500); // SYP/Liter
  const [calcDifficulty, setCalcDifficulty] = useState("1.0"); // 1.0 | 1.3 | 1.6

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        nameAr: editData.nameAr ?? editData.name,
        category: editData.category,
        basePrice: editData.basePrice,
        estimatedDuration: editData.estimatedDuration,
        isEmergency: (editData as any).isEmergency ?? false,
        isActive: editData.isActive,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setShowEstimator(false);
  }, [editData, open]);

  const handleSave = () => {
    if (!form.nameAr.trim() || form.basePrice <= 0) {
      toast.error("يرجى تعبئة اسم الخدمة وتحديد السعر الأساسي");
      return;
    }
    onSave({ ...form, name: form.nameAr });
  };

  // Estimator Calculations
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-md overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            {editData ? "تعديل بيانات الخدمة" : "إضافة فئة خدمة جديدة"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">اسم الخدمة (عربي)</Label>
              <Input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                placeholder="تبديل بطارية السيارة"
                className="bg-secondary/40 border-border/40 text-xs h-9"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">التصنيف</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v || "CAR_WASH" })}>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold flex items-center justify-between">
                السعر الأساسي (ل.س)
                <button 
                  type="button" 
                  onClick={() => setShowEstimator(!showEstimator)} 
                  className="text-[10px] text-primary font-black flex items-center gap-1 hover:underline"
                >
                  <Calculator className="w-3 h-3" />
                  مساعد التسعير
                </button>
              </Label>
              <Input
                type="number"
                value={form.basePrice || ""}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                placeholder="40000"
                dir="ltr"
                className="bg-secondary/40 border-border/40 text-xs h-9 font-bold font-mono"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-bold">المدة المتوقعة (دقيقة)</Label>
              <Input
                type="number"
                value={form.estimatedDuration || ""}
                onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })}
                placeholder="30"
                dir="ltr"
                className="bg-secondary/40 border-border/40 text-xs h-9 font-mono"
              />
            </div>
          </div>

          {/* Pricing estimation calculator */}
          {showEstimator && (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-3.5 space-y-3.5 animate-fade-in-up">
              <div className="flex items-center gap-2 border-b border-primary/10 pb-1.5">
                <Calculator className="w-4.5 h-4.5 text-primary" />
                <span className="text-xs font-bold text-white">مساعد التسعير التقديري</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-medium">سعر لتر الوقود (ل.س)</label>
                  <Input 
                    type="number" 
                    value={calcFuelRate} 
                    onChange={(e) => CalcFuelRate(Number(e.target.value))} 
                    className="h-8 text-xs bg-background/50 border-border/40 font-mono" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-medium">عامل صعوبة العمل</label>
                  <Select value={calcDifficulty} onValueChange={(v) => setCalcDifficulty(v || "1.0")}>
                    <SelectTrigger className="h-8 bg-background/50 border-border/40 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border/40 rounded-xl">
                      <SelectItem value="1.0" className="text-xs">منخفضة (1.0)</SelectItem>
                      <SelectItem value="1.3" className="text-xs">متوسطة (1.3)</SelectItem>
                      <SelectItem value="1.6" className="text-xs">مرتفعة (1.6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-background/40 border border-border/20 space-y-1 text-[10px] text-muted-foreground font-medium">
                <div className="flex justify-between">
                  <span>مكون الوقود الأساسي (حجم المحروقات):</span>
                  <span className="text-foreground font-semibold">{(calcFuelRate * 1.5).toLocaleString("ar-SA")} ل.س</span>
                </div>
                <div className="flex justify-between">
                  <span>مكون زمن الخدمة (المدة * الصعوبة):</span>
                  <span className="text-foreground font-semibold">{(form.estimatedDuration * 1200 * Number(calcDifficulty)).toLocaleString("ar-SA")} ل.س</span>
                </div>
                {form.isEmergency && (
                  <div className="flex justify-between text-rose-400">
                    <span>علاوة الخدمة الطارئة (+25%):</span>
                    <span className="font-semibold">+{(Math.round(rawEstimate * 0.25)).toLocaleString("ar-SA")} ل.س</span>
                  </div>
                )}
                <div className="h-px bg-border/20 my-1.5" />
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>السعر المقترح الموصى به:</span>
                  <span className="text-primary font-black">{recommendedPrice.toLocaleString("ar-SA")} ل.س</span>
                </div>
              </div>

              <Button 
                type="button" 
                size="sm" 
                onClick={applyEstimatedPrice}
                className="w-full h-8 text-[11px] font-bold bg-primary text-white hover:bg-primary/95 rounded-lg gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                تطبيق السعر المقترح
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/30">
            <div>
              <p className="text-xs font-medium text-foreground">خدمة إسعافية / طارئة</p>
              <p className="text-[10px] text-muted-foreground">تُدرج في قسم طلبات المساعدة الفورية للعملاء</p>
            </div>
            <Switch
              checked={form.isEmergency}
              onCheckedChange={(v) => setForm({ ...form, isEmergency: v })}
              className="data-[state=checked]:bg-rose-500 shrink-0"
            />
          </div>

          <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/30">
            <div>
              <p className="text-xs font-medium text-foreground">الخدمة نشطة ومفعلة</p>
              <p className="text-[10px] text-muted-foreground">تظهر للمستخدمين في واجهة الاختيارات</p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              className="data-[state=checked]:bg-emerald-500 shrink-0"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2 mt-2 pt-2 border-t border-border/25">
          <Button variant="outline" size="sm" onClick={onClose} className="border-border/40 font-bold">إلغاء</Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/25 min-w-[100px]"
          >
            {isPending ? "جاري الحفظ..." : editData ? "حفظ التغييرات" : "إضافة الفئة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
