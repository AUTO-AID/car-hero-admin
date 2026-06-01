"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ProviderEditDialogProps {
  provider: any | null;
  onClose: () => void;
  onSave: (id: string, data: Record<string, unknown>) => void;
  isPending: boolean;
}

const initialForm = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  city: "",
  governorate: "",
  address: "",
  description: "",
  status: "offline",
  accountStatus: "active",
  isActive: true,
  emergency247: false,
  experienceYears: 0,
  techCount: 0,
  commissionRate: 10,
};

export function ProviderEditDialog({ provider, onClose, onSave, isPending }: ProviderEditDialogProps) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!provider) {
      setForm(initialForm);
      return;
    }

    setForm({
      businessName: provider.businessName || "",
      ownerName: provider.ownerName || "",
      phone: provider.phone || "",
      email: provider.email || "",
      city: provider.city || "",
      governorate: provider.governorate || "",
      address: provider.address || "",
      description: provider.description || "",
      status: provider.status || "offline",
      accountStatus: provider.accountStatus || (provider.isActive === false ? "suspended" : "active"),
      isActive: provider.isActive !== false,
      emergency247: Boolean(provider.emergency247 || provider.is_emergency),
      experienceYears: Number(provider.experienceYears || 0),
      techCount: Number(provider.techCount || 0),
      commissionRate: Number(provider.commissionRate ?? 10),
    });
  }, [provider]);

  const updateField = (key: keyof typeof form, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!provider?._id || !form.businessName.trim() || !form.phone.trim()) return;
    onSave(provider._id, {
      ...form,
      is_emergency: form.emergency247,
      accountStatus: form.isActive ? form.accountStatus : "suspended",
    });
  };

  return (
    <Dialog open={Boolean(provider)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-white">تعديل ملف المزود</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">اسم النشاط</Label>
            <Input value={form.businessName} onChange={(e) => updateField("businessName", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">اسم المالك</Label>
            <Input value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">الهاتف</Label>
            <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-10" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">البريد الإلكتروني</Label>
            <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} className="h-10" dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">المدينة</Label>
            <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">المحافظة</Label>
            <Input value={form.governorate} onChange={(e) => updateField("governorate", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">حالة الاتصال</Label>
            <Select value={form.status} onValueChange={(value) => updateField("status", value)}>
              <SelectTrigger className="w-full h-10 bg-background/60 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">متصل</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="offline">غير متصل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">حالة الحساب</Label>
            <Select value={form.accountStatus} onValueChange={(value) => updateField("accountStatus", value)}>
              <SelectTrigger className="w-full h-10 bg-background/60 border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
                <SelectItem value="pending">بانتظار المراجعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">سنوات الخبرة</Label>
            <Input type="number" min={0} value={form.experienceYears} onChange={(e) => updateField("experienceYears", Number(e.target.value))} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">عدد الفنيين</Label>
            <Input type="number" min={0} value={form.techCount} onChange={(e) => updateField("techCount", Number(e.target.value))} className="h-10" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">نسبة العمولة %</Label>
            <Input type="number" min={0} max={100} value={form.commissionRate} onChange={(e) => updateField("commissionRate", Number(e.target.value))} className="h-10" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 px-3 py-2">
            <Label className="text-xs">مزود طوارئ 24/7</Label>
            <Switch checked={form.emergency247} onCheckedChange={(value) => updateField("emergency247", value)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 px-3 py-2">
            <Label className="text-xs">الحساب مفعل</Label>
            <Switch checked={form.isActive} onCheckedChange={(value) => updateField("isActive", value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs">العنوان</Label>
            <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} className="h-10" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs">الوصف</Label>
            <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isPending || !form.businessName.trim() || !form.phone.trim()} className="gap-2">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            حفظ التعديلات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
