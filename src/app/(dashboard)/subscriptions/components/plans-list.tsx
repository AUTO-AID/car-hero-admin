"use client";

import { CheckCircle2, Crown, Edit2, Shield, Star, Trash2, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MembershipPlan } from "./plan-form-dialog";

const icons: Record<string, React.ElementType> = { basic: Shield, silver: Star, gold: Crown, platinum: Zap };
const colors: Record<string, string> = { basic: "text-slate-300", silver: "text-blue-300", gold: "text-amber-300", platinum: "text-violet-300" };

export default function PlansList({ plans, isLoading, onEdit, onDeleteClick }: { plans: MembershipPlan[]; isLoading: boolean; onEdit: (plan: MembershipPlan) => void; onDeleteClick: (id: string) => void }) {
  if (isLoading) return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-lg" />)}</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => {
        const tier = plan.tier || "basic"; const Icon = icons[tier] || Shield; const color = colors[tier] || colors.basic;
        return <Card key={plan._id} className="p-5 bg-card border-border/40 flex flex-col">
          <div className="flex items-center justify-between"><div className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div><Badge variant="outline" className={plan.isActive ? "badge-success" : "badge-neutral"}>{plan.isActive ? "نشطة" : "معطلة"}</Badge></div>
          <h3 className={`text-lg font-bold mt-4 ${color}`}>{plan.nameAr || plan.name}</h3>
          <p className="text-xs text-muted-foreground">{plan.name}</p>
          <p className="mt-3"><span className="text-2xl font-black text-white">{plan.price ? plan.price.toLocaleString("ar-SY") : "مجاني"}</span>{plan.price > 0 && <span className="text-xs text-muted-foreground"> ل.س / {plan.durationDays} يوم</span>}</p>
          <div className="flex gap-3 text-[11px] text-muted-foreground my-3"><span className="flex gap-1"><Users className="w-3 h-3" />{plan.activeSubscribers || 0} نشط</span><span>{plan.subscribers || 0} إجمالي</span><span>{Number(plan.revenue || 0).toLocaleString("ar-SY")} ل.س</span></div>
          <div className="flex-1 space-y-2 border-t border-border/20 pt-3">{(plan.featuresAr?.length ? plan.featuresAr : plan.features || []).map((feature, index) => <p key={index} className="text-xs flex gap-2 text-foreground/80"><CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${color}`} />{feature}</p>)}</div>
          <div className="flex gap-2 mt-4"><Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => onEdit(plan)}><Edit2 className="w-3.5 h-3.5" />تعديل</Button>{plan.isActive && <Button variant="outline" size="icon-sm" className="text-rose-400" onClick={() => onDeleteClick(plan._id)}><Trash2 className="w-3.5 h-3.5" /></Button>}</div>
        </Card>;
      })}
    </div>
  );
}
