"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Shield, Star, Crown, Zap, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

type MembershipSubscriber = {
  _id: string;
  user?: { fullName?: string };
  plan?: { name?: string; tier?: string };
  startDate: string | number | Date;
  endDate: string | number | Date;
  isActive: boolean;
};

interface SubscribersTableProps {
  subscribers: MembershipSubscriber[];
  isLoading: boolean;
  total: number;
  page: number;
  setPage: (updater: number | ((p: number) => number)) => void;
}

const planIcons: Record<string, React.ElementType> = { basic: Shield, silver: Star, gold: Crown, platinum: Zap };
const planColors: Record<string, { color: string; bg: string }> = {
  basic:    { color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20" },
  silver:   { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  gold:     { color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  platinum: { color: "text-primary",    bg: "bg-primary/10 border-primary/20" },
};

export default function SubscribersTable({
  subscribers,
  isLoading,
  total,
  page,
  setPage,
}: SubscribersTableProps) {
  return (
    <Card className="bg-card border-border/40 overflow-hidden">
      <div className="p-5 border-b border-border/30 bg-secondary/10 flex items-center justify-between">
        <h3 className="font-semibold text-white text-sm">قائمة المشتركين</h3>
        <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/40 text-[10px] tabular-nums">
          {total} مشترك
        </Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-border/20">
              {["المشترك", "الخطة", "تاريخ البداية", "تاريخ الانتهاء", "الحالة"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-20" /></td>)}
                  </tr>
                ))
              : subscribers.map((sub: MembershipSubscriber, i: number) => {
                  const tier = sub.plan?.tier ?? "basic";
                  const meta = planColors[tier] ?? planColors.basic;
                  const Icon = planIcons[tier] ?? Shield;
                  return (
                    <tr key={sub._id} className="table-row-hover animate-fade-in" style={{ animationDelay: `${i * 25}ms` }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-border/30">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-[10px] font-bold">
                              {sub.user?.fullName?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-foreground">{sub.user?.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border ${meta.bg} ${meta.color}`}>
                          <Icon className="w-3 h-3" />
                          {sub.plan?.name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(sub.startDate), { locale: ar, addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium ${new Date(sub.endDate) < new Date() ? "text-rose-400" : "text-emerald-400"}`}>
                          {formatDistanceToNow(new Date(sub.endDate), { locale: ar, addSuffix: true })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={`text-[9px] ${sub.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                          {sub.isActive ? "نشط" : "منتهي"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-border/20 bg-secondary/10">
        <p className="text-[11px] text-muted-foreground/60">إجمالي <span className="font-bold text-foreground">{total}</span> مشترك</p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1} className="h-7 text-[11px] border-border/30 rounded-lg px-3">السابق</Button>
          <span className="text-[11px] text-muted-foreground/60 px-2 tabular-nums">صفحة {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}
            disabled={subscribers.length < 10} className="h-7 text-[11px] border-border/30 rounded-lg px-3">التالي</Button>
        </div>
      </div>
    </Card>
  );
}
