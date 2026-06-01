"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarClock, CheckCircle2, History, RotateCcw, Search, Send, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { getNotificationCampaigns, getNotificationStats, sendNotificationCampaign } from "@/infrastructure/services/notifications.service";

const defaultFilters = { search: "", audience: "all", status: "all", type: "all" };
const unwrap = (value: any) => value?.data?.data ?? value?.data ?? value ?? {};
const audienceLabels: Record<string, string> = { all: "الجميع", users: "العملاء", premium: "مشتركو Premium", providers: "المزودون" };
const statusLabels: Record<string, string> = { sent: "مرسلة", scheduled: "مجدولة", failed: "فشلت" };

export default function NotificationsPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [form, setForm] = useState({ audience: "all", type: "info", title: "", body: "", mode: "now", scheduledAt: "" });
  const statsQuery = useQuery({ queryKey: ["notification-stats"], queryFn: getNotificationStats });
  const campaignsQuery = useQuery({ queryKey: ["notification-campaigns", page, filters], queryFn: () => getNotificationCampaigns(page, 10, filters) });
  const stats = unwrap(statsQuery.data); const result = unwrap(campaignsQuery.data); const campaigns = result.campaigns || []; const pagination = result.pagination || { total: 0, pages: 1 };
  const send = useMutation({
    mutationFn: sendNotificationCampaign,
    onSuccess: (response) => { client.invalidateQueries({ queryKey: ["notification"] }); const data = unwrap(response); toast.success(data.deliveryStatus === "scheduled" ? `تمت جدولة الحملة لـ ${data.recipients} مستهدف` : `تم إرسال الحملة إلى ${data.recipients} مستهدف`); setForm((current) => ({ ...current, title: "", body: "", scheduledAt: "" })); },
    onError: () => toast.error("تعذر إنشاء حملة الإشعارات"),
  });
  const submit = () => {
    if (!form.title.trim() || !form.body.trim()) return toast.error("أدخل عنوان الإشعار ومحتواه");
    if (form.body.length > 500) return toast.error("نص الإشعار أطول من الحد المسموح");
    if (form.mode === "scheduled" && (!form.scheduledAt || new Date(form.scheduledAt) <= new Date())) return toast.error("اختر موعدًا مستقبليًا صالحًا");
    send.mutate({ audience: form.audience, type: form.type, title: form.title, body: form.body, scheduledAt: form.mode === "scheduled" ? new Date(form.scheduledAt).toISOString() : undefined });
  };
  const setFilter = (key: keyof typeof filters, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  return <div className="space-y-5" dir="rtl">
    <div><h2 className="text-lg font-bold">إدارة الإشعارات داخل التطبيق</h2><p className="text-xs text-muted-foreground">إنشاء حملات فورية أو مجدولة ومراجعة التسليم والقراءة. يتم التسليم داخل التطبيق وعبر WebSocket.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="إجمالي الإشعارات" value={Number(stats.notifications || 0).toLocaleString("ar-SY")} icon={Bell} iconColor="text-blue-400" iconBg="from-blue-500/15 to-blue-500/5" />
      <StatCard title="غير المقروءة" value={Number(stats.unread || 0).toLocaleString("ar-SY")} icon={Bell} iconColor="text-amber-400" iconBg="from-amber-500/15 to-amber-500/5" />
      <StatCard title="تم إرسالها" value={Number(stats.sent || 0).toLocaleString("ar-SY")} icon={CheckCircle2} iconColor="text-emerald-400" iconBg="from-emerald-500/15 to-emerald-500/5" />
      <StatCard title="مجدولة" value={Number(stats.scheduled || 0).toLocaleString("ar-SY")} icon={CalendarClock} iconColor="text-violet-400" iconBg="from-violet-500/15 to-violet-500/5" />
    </div>
    <div className="grid gap-5 xl:grid-cols-12">
      <Card className="xl:col-span-4 p-5 bg-card border-border/40 space-y-4">
        <h3 className="font-bold text-sm flex gap-2"><Send className="w-4 h-4 text-primary" />حملة إشعارات جديدة</h3>
        <Field label="الجمهور المستهدف"><Choice value={form.audience} set={(value) => setForm({ ...form, audience: value })} items={[["all", "الجميع"], ["users", "العملاء"], ["premium", "مشتركو Premium"], ["providers", "المزودون"]]} /></Field>
        <Field label="نوع الإشعار"><Choice value={form.type} set={(value) => setForm({ ...form, type: value })} items={[["info", "معلومة"], ["alert", "تنبيه"], ["system_alert", "تنبيه نظام"], ["reminder", "تذكير"]]} /></Field>
        <Field label="وقت الإرسال"><Choice value={form.mode} set={(value) => setForm({ ...form, mode: value })} items={[["now", "إرسال فوري"], ["scheduled", "جدولة الإرسال"]]} /></Field>
        {form.mode === "scheduled" && <Field label="موعد الإرسال"><Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} /></Field>}
        <Field label="العنوان"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} placeholder="عنوان واضح ومختصر" /></Field>
        <Field label="المحتوى"><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={500} rows={5} placeholder="اكتب رسالة الإشعار..." /><p className="text-[10px] text-muted-foreground text-left">{form.body.length}/500</p></Field>
        <Button className="w-full gap-2" disabled={send.isPending} onClick={submit}><Send className="w-4 h-4" />{send.isPending ? "جاري الحفظ..." : form.mode === "scheduled" ? "جدولة الحملة" : "إرسال الآن"}</Button>
      </Card>
      <Card className="xl:col-span-8 bg-card border-border/40 overflow-hidden">
        <div className="p-4 border-b border-border/20 flex items-center gap-2"><History className="w-4 h-4 text-primary" /><h3 className="text-sm font-bold">سجل حملات الإشعارات</h3></div>
        <div className="p-3 grid gap-2 md:grid-cols-6 border-b border-border/20"><div className="relative md:col-span-2"><Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" /><Input className="pr-9" placeholder="بحث بالعنوان أو المحتوى..." value={filters.search} onChange={(e) => setFilter("search", e.target.value)} /></div><Choice value={filters.audience} set={(v) => setFilter("audience", v)} items={[["all", "كل الجماهير"], ["users", "العملاء"], ["premium", "Premium"], ["providers", "المزودون"]]} /><Choice value={filters.status} set={(v) => setFilter("status", v)} items={[["all", "كل الحالات"], ["sent", "مرسلة"], ["scheduled", "مجدولة"], ["failed", "فشلت"]]} /><Choice value={filters.type} set={(v) => setFilter("type", v)} items={[["all", "كل الأنواع"], ["info", "معلومة"], ["alert", "تنبيه"], ["system_alert", "نظام"], ["reminder", "تذكير"]]} /><Button variant="outline" onClick={() => { setFilters(defaultFilters); setPage(1); }}><RotateCcw className="w-3.5 h-3.5" />مسح</Button></div>
        <div className="divide-y divide-border/10">{campaignsQuery.isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">جاري تحميل السجل...</p> : campaigns.length ? campaigns.map((campaign: any) => <div key={campaign._id} className="p-4"><div className="flex gap-3 justify-between"><div><p className="text-sm font-bold">{campaign.title}</p><p className="text-xs text-muted-foreground mt-1">{campaign.body}</p><div className="flex flex-wrap gap-2 mt-3"><Badge variant="outline">{audienceLabels[campaign.audience] || campaign.audience}</Badge><Badge variant="outline">{statusLabels[campaign.deliveryStatus] || campaign.deliveryStatus}</Badge><Badge variant="outline"><Users className="w-3 h-3" />{campaign.recipients} مستهدف</Badge><Badge variant="outline">قرأها {campaign.readCount}</Badge></div></div><span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(campaign.scheduledAt || campaign.sentAt || campaign.createdAt), { locale: ar, addSuffix: true })}</span></div></div>) : <p className="p-10 text-center text-sm text-muted-foreground">لا توجد حملات إدارية بعد</p>}</div>
        <div className="p-3 flex justify-between text-xs text-muted-foreground border-t border-border/20"><span>{pagination.total} حملة</span><div className="flex gap-2 items-center"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</Button><span>{page} / {pagination.pages}</span><Button size="sm" variant="outline" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>التالي</Button></div></div>
      </Card>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>; }
function Choice({ value, set, items }: { value: string; set: (value: string) => void; items: string[][] }) { return <Select value={value} onValueChange={(next) => set(next || items[0][0])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{items.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select>; }
