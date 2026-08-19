"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, Check, X, ShieldAlert, CreditCard, Banknote, Power, Activity, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: "قيد الانتظار", className: "badge-warning", icon: Clock },
  accepted: { label: "مقبول", className: "badge-info", icon: CheckCircle2 },
  provider_assigned: { label: "تم تعيين مزود", className: "badge-info", icon: CheckCircle2 },
  provider_en_route: { label: "المزود بالطريق", className: "badge-info", icon: PlayCircle },
  provider_arrived: { label: "وصل المزود", className: "badge-info", icon: MapPin },
  active: { label: "نشط", className: "badge-info", icon: Activity },
  in_progress: { label: "جاري التنفيذ", className: "badge-info", icon: PlayCircle },
  completed: { label: "مكتمل", className: "badge-success", icon: CheckCircle2 },
  cancelled: { label: "ملغي", className: "badge-danger", icon: XCircle },
  rejected: { label: "مرفوض", className: "badge-danger", icon: XCircle },
  approved: { label: "معتمد", className: "badge-success", icon: CheckCircle2 },
  offline: { label: "غير متصل", className: "badge-neutral", icon: Power },
  online: { label: "متصل", className: "badge-success", icon: Power },
  busy: { label: "مشغول", className: "badge-warning", icon: AlertCircle },
  paid: { label: "مدفوع", className: "badge-success", icon: Banknote },
  unpaid: { label: "غير مدفوع", className: "badge-warning", icon: CreditCard },
  failed: { label: "فشل الدفع", className: "badge-danger", icon: XCircle },
  refunded: { label: "مسترد", className: "badge-info", icon: Banknote },
  true: { label: "نشط", className: "badge-success", icon: Check },
  false: { label: "محظور", className: "badge-danger", icon: ShieldAlert },
  expired: { label: "منتهي", className: "badge-danger", icon: Clock },
  credit: { label: "إيداع", className: "badge-success", icon: Banknote },
  debit: { label: "سحب", className: "badge-danger", icon: Banknote },
};

interface StatusBadgeProps {
  status: string | boolean;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = String(status).toLowerCase();
  const config = statusMap[key] || { label: key, className: "badge-neutral", icon: AlertCircle };
  const Icon = config.icon;
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 w-fit", config.className, className)}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
}
