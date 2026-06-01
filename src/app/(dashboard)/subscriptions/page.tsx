"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Package, Plus, RotateCcw, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMembershipPlan, deleteMembershipPlan, getAllMembershipPlans, getMembershipStats, getMembershipSubscribers, updateMembershipPlan } from "@/infrastructure/services/subscriptions.service";
import PlanDeleteDialog from "./components/plan-delete-dialog";
import PlanFormDialog, { type MembershipPlan } from "./components/plan-form-dialog";
import PlansList from "./components/plans-list";
import SubscribersTable from "./components/subscribers-table";
import SubscriptionAnalytics from "./components/subscription-analytics";

const emptyFilters = { search: "", status: "all", plan: "all", dateFrom: "", dateTo: "", sortBy: "createdAt", sortOrder: "desc" as "asc" | "desc" };
const body = (value: any) => value?.data?.data ?? value?.data ?? value ?? {};
const lines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);

export default function SubscriptionsPage() {
  const client = useQueryClient();
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const [editData, setEditData] = useState<MembershipPlan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const plansQuery = useQuery({ queryKey: ["subscription-plans"], queryFn: getAllMembershipPlans });
  const statsQuery = useQuery({ queryKey: ["subscription-stats"], queryFn: getMembershipStats });
  const subscribersQuery = useQuery({ queryKey: ["subscription-users", page, filters], queryFn: () => getMembershipSubscribers(page, 12, filters) });
  const plans: MembershipPlan[] = body(plansQuery.data).plans || [];
  const result = body(subscribersQuery.data);
  const subscribers = result.subscribers || [];
  const pagination = result.pagination || { total: 0, pages: 1 };
  const refresh = () => { client.invalidateQueries({ queryKey: ["subscription-plans"] }); client.invalidateQueries({ queryKey: ["subscription-stats"] }); client.invalidateQueries({ queryKey: ["subscription-users"] }); };
  const save = useMutation({ mutationFn: ({ id, data }: any) => id ? updateMembershipPlan(id, data) : createMembershipPlan(data), onSuccess: () => { refresh(); setFormOpen(false); toast.success("تم حفظ خطة الاشتراك"); }, onError: () => toast.error("تعذر حفظ الخطة، تحقق من الحقول") });
  const disable = useMutation({ mutationFn: deleteMembershipPlan, onSuccess: () => { refresh(); setDeleteId(null); toast.success("تم تعطيل الخطة مع الاحتفاظ بسجلات المشتركين"); }, onError: () => toast.error("تعذر تعطيل الخطة") });
  const setFilter = (key: keyof typeof filters, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const exportCsv = () => {
    const rows = subscribers.map((sub: any) => [sub.user?.fullName, sub.user?.phoneNumber, sub.plan?.nameAr || sub.plan?.name, sub.status, sub.amountPaid, sub.autoRenew ? "نعم" : "لا", sub.startDate, sub.endDate]);
    const csv = [["المشترك", "الهاتف", "الخطة", "الحالة", "المبلغ", "تجديد تلقائي", "البداية", "النهاية"], ...rows].map((row: unknown[]) => row.map((v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "subscriptions.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-5" dir="rtl">
    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between"><div><h2 className="text-lg font-bold">إدارة الاشتراكات</h2><p className="text-xs text-muted-foreground">خطط الاشتراك، المشتركين، الإيرادات وحالات التجديد.</p></div><Button className="gap-2" onClick={() => { setEditData(null); setFormOpen(true); }}><Plus className="w-4 h-4" />خطة جديدة</Button></div>
    <SubscriptionAnalytics stats={body(statsQuery.data)} />
    <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="overview"><Package className="w-3.5 h-3.5 ml-1" />الخطط</TabsTrigger><TabsTrigger value="subscribers"><Users className="w-3.5 h-3.5 ml-1" />المشتركون</TabsTrigger></TabsList>
      <TabsContent value="overview"><PlansList plans={plans} isLoading={plansQuery.isLoading} onEdit={(plan) => { setEditData(plan); setFormOpen(true); }} onDeleteClick={setDeleteId} /></TabsContent>
      <TabsContent value="subscribers" className="space-y-3">
        <Card className="p-3 grid gap-2 md:grid-cols-4 xl:grid-cols-8 bg-card border-border/40">
          <div className="relative md:col-span-2"><Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" /><Input value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="بحث بالاسم، الهاتف أو الخطة..." className="pr-9" /></div>
          <Select value={filters.status} onValueChange={(v) => setFilter("status", v || "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="active">نشط</SelectItem><SelectItem value="expired">منتهي</SelectItem><SelectItem value="cancelled">ملغي</SelectItem><SelectItem value="pending">معلق</SelectItem></SelectContent></Select>
          <Select value={filters.plan} onValueChange={(v) => setFilter("plan", v || "all")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الخطط</SelectItem>{plans.map((plan) => <SelectItem key={plan._id} value={plan._id}>{plan.nameAr}</SelectItem>)}</SelectContent></Select>
          <Input type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} /><Input type="date" value={filters.dateTo} onChange={(e) => setFilter("dateTo", e.target.value)} />
          <Button variant="outline" className="gap-1" onClick={() => { setFilters(emptyFilters); setPage(1); }}><RotateCcw className="w-3.5 h-3.5" />مسح</Button><Button variant="outline" className="gap-1" disabled={!subscribers.length} onClick={exportCsv}><Download className="w-3.5 h-3.5" />تصدير</Button>
        </Card>
        <SubscribersTable subscribers={subscribers} isLoading={subscribersQuery.isLoading} total={pagination.total} page={page} pages={pagination.pages} setPage={setPage} />
      </TabsContent>
    </Tabs>
    <PlanFormDialog open={formOpen} onOpenChange={setFormOpen} editData={editData} isPending={save.isPending} onSave={(form) => {
      if (!form.name.trim() || !form.nameAr.trim() || form.price < 0 || form.durationDays < 1) return toast.error("تحقق من الاسم والسعر والمدة");
      save.mutate({ id: editData?._id, data: { ...form, features: lines(form.features), featuresAr: lines(form.featuresAr) } });
    }} />
    <PlanDeleteDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} onConfirm={() => deleteId && disable.mutate(deleteId)} isPending={disable.isPending} />
  </div>;
}
