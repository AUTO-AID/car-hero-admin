"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Crown, Zap, Edit2, Trash2, Users, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

interface PlansListProps {
  plans: MembershipPlan[];
  isLoading: boolean;
  onEdit: (plan: MembershipPlan) => void;
  onDeleteClick: (id: string) => void;
}

const planIcons: Record<string, React.ElementType> = { basic: Shield, silver: Star, gold: Crown, platinum: Zap };
const planColors: Record<string, { color: string; bg: string }> = {
  basic:    { color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20" },
  silver:   { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  gold:     { color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  platinum: { color: "text-primary",    bg: "bg-primary/10 border-primary/20" },
};

export default function PlansList({
  plans,
  isLoading,
  onEdit,
  onDeleteClick,
}: PlansListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 bg-card border-border/40 space-y-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="h-8 w-24" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-4 w-full" />)}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 stagger">
      {plans.map((plan, i) => {
        const tier = plan.tier ?? "basic";
        const meta = planColors[tier] ?? planColors.basic;
        const Icon = planIcons[tier] ?? Shield;
        const isPremium = tier === "gold" || tier === "platinum";

        return (
          <Card key={plan._id}
            className="relative flex flex-col p-6 bg-card border-border/40 hover:border-primary/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {isPremium && (
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tier === "platinum" ? "from-primary via-purple-400 to-pink-500" : "from-amber-400 via-yellow-400 to-amber-500"} rounded-t-xl`} />
            )}

            <div className="flex items-center justify-between mb-5">
              <div className={`p-3 rounded-xl border ${meta.bg} ${meta.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${plan.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-secondary/50 text-muted-foreground border-border/40"}`}>
                  {plan.isActive ? "نشطة" : "معطّلة"}
                </Badge>
              </div>
            </div>

            <div className="mb-5">
              <h3 className={`text-xl font-bold mb-2 ${meta.color}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                {plan.price === 0 ? (
                  <span className="text-3xl font-extrabold text-white tracking-tight">مجاني</span>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">{plan.price.toLocaleString("ar-SA")}</span>
                    <span className="text-sm text-muted-foreground">ل.س</span>
                    <span className="text-xs text-muted-foreground/60">/ {plan.durationDays} يوم</span>
                  </>
                )}
              </div>
              {plan.subscribers !== undefined && (
                <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {plan.subscribers} مشترك
                </p>
              )}
            </div>

            <div className="flex-1 space-y-2.5 mb-6">
              {(plan.features ?? []).map((f: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${meta.color} opacity-80`} />
                  <span className="text-[12px] text-foreground/80 leading-tight">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(plan)}
                className="flex-1 h-9 gap-2 border-border/40 hover:border-primary/30 hover:bg-secondary/50 transition-all font-semibold">
                <Edit2 className="w-4 h-4 text-muted-foreground" /> تعديل الخطة
              </Button>
              {plan.tier !== "basic" && (
                <Button variant="outline" size="sm" onClick={() => onDeleteClick(plan._id)}
                  className="h-9 w-9 p-0 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
