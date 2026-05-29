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
  children?: ReactNode;
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor = "text-primary", iconBg = "from-primary/15 to-primary/5",
  glowClass = "", trend, loading, children,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="p-5 bg-card border-border/40 overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md mb-2" />
        <Skeleton className="h-3.5 w-24 rounded-md" />
      </Card>
    );
  }

  // Extract color name to generate a subtle background glow for the card
  const colorNameMatch = iconColor.match(/text-([a-z]+)-/);
  const colorName = colorNameMatch ? colorNameMatch[1] : 'primary';

  const isUp = trend?.type === "up" || (!trend?.type && (trend?.value ?? 0) > 0);
  const isNeutral = trend?.type === "neutral";

  return (
    <Card className={cn(
      "stat-card card-hover p-5 border-border/40 overflow-hidden relative group",
      glowClass
    )}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Background glow behind icon */}
      <div className={cn(
        `absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity duration-500 group-hover:opacity-30`,
        `bg-${colorName}-500`
      )} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={cn(
          "flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br shadow-sm border border-white/5 transition-transform duration-300 group-hover:scale-110",
          iconBg
        )}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>

        {trend && (
          <div className={cn(
            "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm",
            isNeutral
              ? "text-amber-400 bg-amber-400/10 border border-amber-400/20"
              : isUp
                ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                : "text-rose-400 bg-rose-400/10 border border-rose-400/20"
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
        )}
      </div>

      <div className="space-y-1 relative z-10">
        <p className="text-3xl font-black text-white tabular-nums tracking-tight font-sans drop-shadow-sm">
          {value}
        </p>
        <p className="text-[13px] font-semibold text-muted-foreground/80">{title}</p>
        
        {subtitle && (
          <p className="text-[11px] text-muted-foreground/50 font-medium">{subtitle}</p>
        )}
        
        {trend && (
          <p className="text-[10px] text-muted-foreground/40 mt-1.5 font-medium">{trend.label}</p>
        )}
      </div>

      {children}
    </Card>
  );
}
