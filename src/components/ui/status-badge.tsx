"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد الانتظار", className: "badge-warning" },
  accepted: { label: "مقبول", className: "badge-info" },
  provider_assigned: { label: "تم تعيين مزود", className: "badge-info" },
  provider_en_route: { label: "المزود بالطريق", className: "badge-info" },
  provider_arrived: { label: "وصل المزود", className: "badge-info" },
  active: { label: "نشط", className: "badge-info" },
  in_progress: { label: "جاري التنفيذ", className: "badge-info" },
  completed: { label: "مكتمل", className: "badge-success" },
  cancelled: { label: "ملغي", className: "badge-danger" },
  rejected: { label: "مرفوض", className: "badge-danger" },
  approved: { label: "معتمد", className: "badge-success" },
  offline: { label: "غير متصل", className: "badge-neutral" },
  online: { label: "متصل", className: "badge-success" },
  busy: { label: "مشغول", className: "badge-warning" },
  paid: { label: "مدفوع", className: "badge-success" },
  unpaid: { label: "غير مدفوع", className: "badge-warning" },
  failed: { label: "فشل الدفع", className: "badge-danger" },
  refunded: { label: "مسترد", className: "badge-info" },
  true: { label: "نشط", className: "badge-success" },
  false: { label: "محظور", className: "badge-danger" },
  expired: { label: "منتهي", className: "badge-danger" },
  credit: { label: "إيداع", className: "badge-success" },
  debit: { label: "سحب", className: "badge-danger" },
};

interface StatusBadgeProps {
  status: string | boolean;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = String(status).toLowerCase();
  const config = statusMap[key] || { label: key, className: "badge-neutral" };
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
