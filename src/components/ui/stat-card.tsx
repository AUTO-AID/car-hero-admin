import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  glowClass?: string;
  trend?: { 
    value: number; 
    label: string; 
    customValue?: string; 
    type?: "up" | "down" | "neutral";
  };
  loading?: boolean;
  className?: string;
  valueClassName?: string;
  critical?: boolean;
  sparkline?: number[];
  children?: ReactNode;
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  glowClass = "", trend, loading, className, valueClassName, critical, sparkline, children,
}: StatCardProps) {
  if (loading) {
    return (
      <Card variant="stat" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md mb-2" />
        <Skeleton className="h-3.5 w-24 rounded-md" />
      </Card>
    );
  }

  const isUp = trend?.type === "up" || (!trend?.type && (trend?.value ?? 0) > 0);
  const isNeutral = trend?.type === "neutral";

  return (
    <Card variant="stat" className={cn(
      "p-6",
      critical && "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)] bg-rose-500/[0.02]",
      glowClass,
      className
    )}>
      {critical && (
        <span className="absolute top-4 end-4 flex h-2.5 w-2.5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
      )}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={cn(
          "flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br shadow-sm border border-primary/10 transition-transform duration-300 group-hover:scale-110",
          "from-primary/18 to-primary/5"
        )}>
          <Icon className="w-5 h-5 text-primary" />
        </div>

        {trend ? (
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm",
            isNeutral
              ? "text-warning bg-amber-400/10 border border-amber-400/20"
              : isUp
                ? "text-success bg-emerald-400/10 border border-emerald-400/20"
                : "text-danger bg-rose-400/10 border border-rose-400/20"
          )}>
            {isNeutral ? (
              <Activity className="w-3.5 h-3.5" />
            ) : isUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.customValue || `${Math.abs(trend.value)}%`}</span>
          </div>
        ) : (
          <div className="h-[26px]" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <p className={cn("text-3xl font-bold text-foreground tabular-nums tracking-tight font-sans drop-shadow-sm", valueClassName)}>
          {value}
        </p>
        <p className="text-sm font-semibold text-muted-foreground/80">{title}</p>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 font-semibold">{subtitle}</p>
        )}
        
        {trend && (
          <p className="text-xs text-muted-foreground/60 mt-1.5 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">{trend.label}</p>
        )}
        
        {sparkline && sparkline.length > 0 && (
          <div className="absolute end-0 bottom-0 start-0 h-12 opacity-30 pointer-events-none">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-current text-primary" strokeWidth="2" fill="none">
              <path d={`M 0,${30 - (sparkline[0] / Math.max(...sparkline)) * 25} ` + sparkline.map((val, i) => `L ${(i / (sparkline.length - 1)) * 100},${30 - (val / Math.max(...sparkline)) * 25}`).join(" ")} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {children}
    </Card>
  );
}
