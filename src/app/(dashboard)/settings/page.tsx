"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Globe, Landmark, Loader2, Power, Save, Settings2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectDisplayValue, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSettings, getSettings, updateMaintenanceMode, updateSettings } from "@/infrastructure/services/settings.service";

const DEFAULTS: AppSettings = { appName: "", appVersion: "", contactEmail: "", contactPhone: "", commissionRate: 0.1, minWithdrawalAmount: 0, defaultCurrency: "SYP", maintenanceMode: false, maintenanceMessage: "", maintenanceMessageAr: "" };
const currencyLabels: Record<AppSettings["defaultCurrency"], string> = {
  SYP: "ليرة سورية (SYP)",
  SAR: "ريال سعودي (SAR)",
  USD: "دولار أمريكي (USD)",
};
const message = (error: any, fallback: string) => error?.response?.data?.message ?? fallback;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULTS);
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin-settings"], queryFn: getSettings, retry: false });
  useEffect(() => { if (data) setForm(data); }, [data]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-settings"] });

  const saveMut = useMutation({
    mutationFn: () => updateSettings({ appName: form.appName, contactEmail: form.contactEmail, contactPhone: form.contactPhone, commissionRate: form.commissionRate, minWithdrawalAmount: form.minWithdrawalAmount, defaultCurrency: form.defaultCurrency }),
    onSuccess: () => { refresh(); toast.success("تم حفظ إعدادات النظام"); },
    onError: (error) => toast.error(message(error, "تعذر حفظ الإعدادات")),
  });
  const maintenanceMut = useMutation({
    mutationFn: () => updateMaintenanceMode({ maintenanceMode: form.maintenanceMode, message: form.maintenanceMessage, messageAr: form.maintenanceMessageAr }),
    onSuccess: () => { refresh(); toast.success("تم حفظ إعدادات الصيانة"); },
    onError: (error) => toast.error(message(error, "تعذر حفظ وضع الصيانة")),
  });

  if (isLoading) return <div className="flex min-h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (isError) return <div className="flex min-h-72 flex-col items-center justify-center text-center" dir="rtl"><AlertCircle className="mb-3 h-8 w-8 text-danger" /><p className="font-bold text-foreground">تعذر تحميل الإعدادات</p><p className="mt-1 text-sm text-muted-foreground">تحقق من الاتصال أو من صلاحية عرض الإعدادات.</p></div>;
  const valid = form.appName.trim() && form.contactEmail.includes("@") && form.commissionRate >= 0 && form.commissionRate <= 1 && form.minWithdrawalAmount >= 0;

  return <div className="space-y-5 font-arabic" dir="rtl">
    <div className="flex flex-col gap-4 border-b border-border/30 bg-secondary/15 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="flex items-center gap-2 text-sm font-bold text-foreground"><Settings2 className="h-4 w-4 text-primary" /> إعدادات النظام</h2><p className="mt-1 text-xs text-muted-foreground">إعدادات محفوظة في قاعدة البيانات ومتصلة بمسارات التشغيل الفعلية</p></div>
      <Button onClick={() => saveMut.mutate()} disabled={!valid || saveMut.isPending} className="gap-2">{saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ التغييرات</Button>
    </div>

    <Tabs defaultValue="general">
      <TabsList><TabsTrigger value="general"><Globe className="h-4 w-4" /> المنصة</TabsTrigger><TabsTrigger value="finance"><Landmark className="h-4 w-4" /> المالية</TabsTrigger><TabsTrigger value="security"><ShieldCheck className="h-4 w-4" /> الصيانة</TabsTrigger></TabsList>
      <TabsContent value="general"><Card className="mt-4 grid gap-4 p-6 sm:grid-cols-2"><Field label="اسم المنصة"><Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} /></Field><Field label="إصدار التطبيق"><Input value={form.appVersion} disabled dir="ltr" /></Field><Field label="بريد الدعم"><Input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} dir="ltr" /></Field><Field label="هاتف الدعم"><Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} dir="ltr" /></Field></Card></TabsContent>
      <TabsContent value="finance"><Card className="mt-4 grid gap-4 p-6 sm:grid-cols-2"><Field label="عمولة المنصة (%)" hint="تطبق على تحويل أرباح الطلبات الجديدة للمزودين."><Input type="number" min="0" max="100" value={form.commissionRate * 100} onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) / 100 })} dir="ltr" /></Field><Field label="الحد الأدنى لطلب السحب" hint="يرفض النظام أي طلب سحب أقل من هذه القيمة."><Input type="number" min="0" value={form.minWithdrawalAmount} onChange={(e) => setForm({ ...form, minWithdrawalAmount: Number(e.target.value) })} dir="ltr" /></Field><Field label="عملة النظام"><Select value={form.defaultCurrency} onValueChange={(value) => value && setForm({ ...form, defaultCurrency: value as AppSettings["defaultCurrency"] })}><SelectTrigger><SelectDisplayValue value={currencyLabels[form.defaultCurrency] ?? form.defaultCurrency} /></SelectTrigger><SelectContent><SelectItem value="SYP">ليرة سورية (SYP)</SelectItem><SelectItem value="SAR">ريال سعودي (SAR)</SelectItem><SelectItem value="USD">دولار أمريكي (USD)</SelectItem></SelectContent></Select></Field></Card></TabsContent>
      <TabsContent value="security"><Card className={`mt-4 space-y-4 p-5 ${form.maintenanceMode ? "border-rose-500/40" : ""}`}><div className="flex items-center justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold text-foreground"><Power className="h-4 w-4 text-danger" /> وضع الصيانة</p><p className="mt-1 text-xs text-muted-foreground">يمنع العمليات المحمية للعملاء والمزودين، مع استمرار وصول المسؤولين.</p></div><Switch checked={form.maintenanceMode} onCheckedChange={(maintenanceMode) => setForm({ ...form, maintenanceMode })} /></div><Field label="رسالة الصيانة بالعربية"><Input value={form.maintenanceMessageAr} maxLength={300} onChange={(e) => setForm({ ...form, maintenanceMessageAr: e.target.value })} /></Field><Field label="رسالة الصيانة بالإنجليزية"><Input value={form.maintenanceMessage} maxLength={300} onChange={(e) => setForm({ ...form, maintenanceMessage: e.target.value })} dir="ltr" /></Field><Button onClick={() => maintenanceMut.mutate()} disabled={maintenanceMut.isPending} variant={form.maintenanceMode ? "destructive" : "default"}>{maintenanceMut.isPending ? "جار الحفظ..." : "حفظ وضع الصيانة"}</Button></Card></TabsContent>
    </Tabs>
  </div>;
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>; }
