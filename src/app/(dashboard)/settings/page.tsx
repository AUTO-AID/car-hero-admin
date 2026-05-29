"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSettings, updateMaintenanceMode } from "@/infrastructure/services/settings.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2, Save, Power, ShieldAlert, Percent, BellRing,
  Smartphone, Globe, Lock, Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");

  const { data: settingsData } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
    retry: false,
  });

  useEffect(() => {
    if (settingsData?.data) {
      queueMicrotask(() => {
        setMaintenance(settingsData.data.maintenanceMode ?? false);
        setMaintenanceMsg(settingsData.data.maintenanceMessage ?? "");
      });
    }
  }, [settingsData]);

  const maintenanceMut = useMutation({
    mutationFn: updateMaintenanceMode,
    onSuccess: () => toast.success(maintenance ? "✅ تم تفعيل وضع الصيانة" : "✅ تم إيقاف وضع الصيانة"),
    onError: () => toast.error("فشل تحديث إعدادات الصيانة"),
  });

  const handleSaveGeneral = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("✅ تم حفظ الإعدادات العامة"); }, 800);
  };

  const handleToggleMaintenance = (val: boolean) => {
    setMaintenance(val);
    maintenanceMut.mutate({ maintenanceMode: val, messageAr: maintenanceMsg });
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/30 bg-card/45 p-4 shadow-sm shadow-black/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" /> إعدادات النظام
          </h2>
          <p className="text-xs text-muted-foreground mt-1">إدارة التكوينات الأساسية، العمولات، وصيانة المنصة.</p>
        </div>
        <Button onClick={handleSaveGeneral} disabled={saving}
          className="h-10 rounded-xl bg-primary px-4 text-white gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 sm:min-w-[150px]">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : <><Save className="w-4 h-4" /> حفظ التغييرات</>}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full flex-col gap-5">
        <TabsList className="mb-1 flex h-auto w-full flex-wrap gap-1 rounded-xl border border-border/40 bg-secondary/30 p-1.5 sm:inline-flex sm:w-fit">
          {[
            { value: "general", icon: Globe, label: "عام" },
            { value: "finance", icon: Percent, label: "المالية" },
            { value: "security", icon: ShieldAlert, label: "الأمان" },
            { value: "notifications", icon: BellRing, label: "الإشعارات" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}
              className="min-h-10 flex-1 rounded-xl px-5 py-2.5 text-xs transition-all data-active:bg-card data-[state=active]:bg-card sm:flex-none sm:text-sm">
              <Icon className="w-3.5 h-3.5" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="m-0 focus-visible:outline-none space-y-5 animate-fade-in-up">
          <Card className="p-6 sm:p-8 bg-card border-border/40">
            <h3 className="text-sm font-bold text-white mb-6 border-b border-border/30 pb-4">معلومات المنصة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "اسم التطبيق (عربي)", value: "كار هيرو - CarHero", dir: "rtl" },
                { label: "اسم التطبيق (إنجليزي)", value: "CarHero App", dir: "ltr" },
                { label: "البريد الإلكتروني للدعم", value: "support@carhero.com", dir: "ltr" },
                { label: "رقم هاتف الطوارئ", value: "+963 999 123 456", dir: "ltr" },
              ].map(({ label, value, dir }) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
                  <Input defaultValue={value} dir={dir}
                    className="bg-secondary/30 border-border/40 h-10 focus-visible:ring-primary/20" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-card border-border/40">
            <h3 className="text-sm font-bold text-white mb-6 border-b border-border/30 pb-4">
              روابط التطبيق على المتاجر
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "رابط Android (Google Play)", placeholder: "https://play.google.com/store/..." },
                { label: "رابط iOS (App Store)", placeholder: "https://apps.apple.com/app/..." },
              ].map(({ label, placeholder }) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5" /> {label}
                  </Label>
                  <Input placeholder={placeholder} dir="ltr"
                    className="bg-secondary/30 border-border/40 h-10 text-xs text-muted-foreground focus-visible:ring-primary/20" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Finance */}
        <TabsContent value="finance" className="m-0 focus-visible:outline-none space-y-5 animate-fade-in-up">
          <Card className="p-6 sm:p-8 bg-card border-border/40">
            <h3 className="text-sm font-bold text-white mb-6 border-b border-border/30 pb-4">إعدادات العمولات والضرائب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "نسبة عمولة المنصة من كل طلب (%)", default: "15", hint: "النسبة المقتطعة من أرباح المزودين" },
                { label: "ضريبة القيمة المضافة VAT (%)", default: "5", hint: "تُضاف على المبلغ الإجمالي للعميل" },
                { label: "الحد الأدنى لطلب سحب الأرباح (ل.س)", default: "50000", hint: null },
                { label: "أيام الانتظار لتحويل الأرباح", default: "3", hint: "أيام عمل بعد اكتمال الطلب" },
              ].map(({ label, default: def, hint }) => (
                <div key={label} className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
                  <div className="relative">
                    <Input type="number" defaultValue={def} dir="ltr"
                      className="bg-secondary/30 border-border/40 h-10 focus-visible:ring-primary/20 pr-10" />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                  {hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="m-0 focus-visible:outline-none space-y-5 animate-fade-in-up">
          {/* Maintenance */}
          <Card className={`p-6 sm:p-8 relative overflow-hidden border-2 transition-all duration-300 ${maintenance ? "border-rose-500/30 bg-rose-500/[0.02]" : "border-border/40 bg-card"}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-sm font-bold text-rose-400 mb-6 border-b border-rose-500/20 pb-4 flex items-center gap-2">
              <Power className="w-4 h-4" /> وضع الصيانة
              {maintenance && (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide mr-auto">
                  مفعّل الآن
                </span>
              )}
            </h3>
            <div className="space-y-4 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <div>
                  <p className="font-bold text-white text-sm mb-1">تفعيل وضع الصيانة</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                    عند التفعيل، يُوقف التطبيق للعملاء والمزودين وتظهر رسالة صيانة. لا يتأثر وصول المسؤولين.
                  </p>
                </div>
                <Switch
                  checked={maintenance}
                  onCheckedChange={handleToggleMaintenance}
                  disabled={maintenanceMut.isPending}
                  className="data-[state=checked]:bg-rose-500 shrink-0"
                />
              </div>
              {maintenance && (
                <div className="space-y-2 animate-fade-in-up">
                  <Label className="text-xs font-semibold text-muted-foreground">رسالة الصيانة (ستظهر للمستخدمين)</Label>
                  <Input
                    value={maintenanceMsg}
                    onChange={(e) => setMaintenanceMsg(e.target.value)}
                    placeholder="التطبيق تحت الصيانة، سنعود قريباً..."
                    className="bg-secondary/30 border-rose-500/20 h-10 focus-visible:ring-rose-500/20"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Security Policies */}
          <Card className="p-6 sm:p-8 bg-card border-border/40">
            <h3 className="text-sm font-bold text-white mb-6 border-b border-border/30 pb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> سياسات الأمان
            </h3>
            <div className="space-y-3">
              {[
                { title: "فرض التحقق بخطوتين (2FA) للأدمن", desc: "يتطلب من جميع المسؤولين تفعيل التحقق المزدوج", default: true },
                { title: "تسجيل خروج تلقائي عند الخمول", desc: "إنهاء الجلسة بعد 30 دقيقة من عدم النشاط", default: true },
                { title: "تسجيل جميع إجراءات الأدمن (Audit Log)", desc: "حفظ سجل كامل بكل عملية تتم في لوحة التحكم", default: false },
              ].map((item) => (
                <div key={item.title}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/30 hover:bg-secondary/20 hover:border-border/60 transition-all">
                  <div className="flex-1 min-w-0 ml-4">
                    <p className="font-semibold text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} className="data-[state=checked]:bg-primary shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="m-0 focus-visible:outline-none space-y-5 animate-fade-in-up">
          <Card className="p-6 sm:p-8 bg-card border-border/40">
            <h3 className="text-sm font-bold text-white mb-6 border-b border-border/30 pb-4">
              إعدادات الإشعارات التلقائية (Firebase FCM)
            </h3>
            <div className="space-y-3">
              {[
                { title: "إشعارات الطلبات الجديدة", desc: "تنبيه المزودين عند وجود طلب قريب منهم", checked: true },
                { title: "إشعارات تغيير حالة الطلب", desc: "إرسال تحديثات للعميل عند قبول/انتهاء الطلب", checked: true },
                { title: "تذكير الحجوزات المجدولة", desc: "قبل 24 ساعة وساعة واحدة من الموعد", checked: true },
                { title: "إشعارات العروض الترويجية", desc: "السماح بإرسال إشعارات تسويقية للمستخدمين", checked: false },
                { title: "إشعارات انتهاء الاشتراك", desc: "تذكير المستخدمين قبل انتهاء خطة Premium بـ 3 أيام", checked: true },
              ].map((item) => (
                <div key={item.title}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-secondary/10 hover:bg-secondary/30 hover:border-border/60 transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0 ml-4">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.checked ? "text-primary" : "text-muted-foreground/30"}`} />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.checked} className="data-[state=checked]:bg-primary shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
