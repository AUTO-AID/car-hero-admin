/**
 * Labels, number/date formatting and tone classes for the operations-
 * intelligence view. These lived in page.tsx, so the cards that use them could
 * not be extracted alongside.
 */

export const levelLabels: Record<string, string> = {
  healthy: "مستقر",
  watch: "مراقبة",
  pressured: "ضغط",
  critical: "حرج",
};

export const statusLabels: Record<string, string> = {
  new: "جديدة",
  acknowledged: "تمت المراجعة",
  in_progress: "قيد المعالجة",
  resolved: "تم الحل",
  dismissed: "متجاهلة",
  unread: "غير مقروء",
  read: "مقروء",
};

export const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

export const workloadLabels: Record<string, string> = {
  overloaded: "مضغوط",
  risky: "خطر",
  strategic: "استراتيجي",
  champion: "قوي",
  underused: "غير مستغل",
  normal: "طبيعي",
};

export const slaLabels: Record<string, string> = {
  on_track: "ضمن الوقت",
  due_soon: "قريب من التأخير",
  overdue: "متأخر",
};

export function idOf(item: { _id?: string; id?: string }) {
  return item._id || item.id || "";
}

export function formatNumber(value?: number) {
  return Number(value || 0).toLocaleString("ar-EG");
}

export function evidenceNumber(evidence: Record<string, unknown> | undefined, key: string) {
  const value = evidence?.[key];
  return typeof value === "number" ? value : Number(value || 0);
}

export function levelClass(level?: string) {
  return {
    healthy: "text-success bg-emerald-500/10 border-emerald-500/25",
    watch: "text-warning bg-amber-500/10 border-amber-500/25",
    pressured: "text-warning bg-orange-500/10 border-orange-500/25",
    critical: "text-danger bg-rose-500/10 border-rose-500/25",
  }[level || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function priorityClass(priority?: string) {
  return {
    low: "text-info bg-sky-500/10 border-sky-500/25",
    medium: "text-warning bg-amber-500/10 border-amber-500/25",
    high: "text-warning bg-orange-500/10 border-orange-500/25",
    critical: "text-danger bg-rose-500/10 border-rose-500/25",
  }[priority || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function workloadClass(level?: string) {
  return {
    overloaded: "text-warning bg-orange-500/10 border-orange-500/25",
    risky: "text-danger bg-rose-500/10 border-rose-500/25",
    strategic: "text-info bg-violet-500/10 border-violet-500/25",
    champion: "text-success bg-emerald-500/10 border-emerald-500/25",
    underused: "text-info bg-sky-500/10 border-sky-500/25",
    normal: "text-muted-foreground bg-secondary/40 border-border/40",
  }[level || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function slaClass(status?: string) {
  return {
    on_track: "text-success bg-emerald-500/10 border-emerald-500/25",
    due_soon: "text-warning bg-amber-500/10 border-amber-500/25",
    overdue: "text-danger bg-rose-500/10 border-rose-500/25",
  }[status || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function formatDateTime(value?: string) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير محدد";
  return date.toLocaleString("ar-SY", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
