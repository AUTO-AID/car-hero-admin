import { LucideIcon } from "lucide-react";

interface ChartHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  /**
   * Mark a chart whose figures are placeholders, not real data.
   *
   * Two charts on the overview shipped with invented numbers — a revenue
   * trend reading 1.5M–4.2M SYP and an order funnel of 100/80/60/45 — with
   * nothing on screen to say so. In an operations console a chart is a
   * decision aid; an unlabelled fabricated one is worse than an empty state,
   * because the operator acts on it. Setting this renders a visible chip and
   * announces the same thing to assistive tech.
   */
  sampleData?: boolean;
}

export function ChartHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  sampleData = false,
}: ChartHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
      <div>
        <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2 flex-wrap">
          <Icon className="w-4 h-4 text-primary" />
          {title}
          {sampleData && (
            <span
              className="inline-flex items-center rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning"
              title="هذه الأرقام تجريبية ولا تعكس بيانات فعلية"
            >
              بيانات تجريبية
            </span>
          )}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
