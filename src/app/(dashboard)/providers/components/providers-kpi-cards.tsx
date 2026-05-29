import { Card } from "@/components/ui/card";
import { 
  Users, CheckCircle, AlertTriangle, Star, 
  MessageSquare, Trophy, Wrench, ShieldCheck, 
  Building2, FolderOpen 
} from "lucide-react";

const iconMap: Record<string, any> = {
  users: Users, 
  check: CheckCircle, 
  alert: AlertTriangle, 
  star: Star,
  message: MessageSquare, 
  trophy: Trophy, 
  wrench: Wrench,
  shield: ShieldCheck, 
  city: Building2, 
  folder: FolderOpen,
};

const colorMap: Record<string, string> = {
  blue: "#3b82f6", 
  green: "#10b981", 
  red: "#ef4444", 
  orange: "#f59e0b",
  purple: "#a57ed8", 
  cyan: "#06b6d4", 
  pink: "#ec4899", 
  lime: "#84cc16",
  indigo: "#6366f1", 
  amber: "#f59e0b",
};

interface ProvidersKpiCardsProps {
  kpis?: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
    sub?: string;
  }>;
  isLoading?: boolean;
}

export function ProvidersKpiCards({ kpis = [], isLoading = false }: ProvidersKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="p-4 bg-card border-border/40 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-secondary/50 mb-3" />
            <div className="h-6 w-16 bg-secondary/50 rounded mb-2" />
            <div className="h-3 w-24 bg-secondary/40 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <Card className="p-5 bg-card border-border/40 text-sm text-muted-foreground">
        لا توجد بيانات KPI متاحة من الخادم حالياً.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon] || Users;
        const clr = colorMap[kpi.color] || "#a57ed8";
        return (
          <Card key={kpi.label} className="stat-card card-hover p-4 bg-card border-border/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-all duration-300" style={{ background: clr }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top left, ${clr}08, transparent 70%)` }} />
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${clr}15` }}>
                <Icon className="w-4 h-4" style={{ color: clr }} />
              </div>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">{kpi.value}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{kpi.label}</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">{kpi.sub}</p>
          </Card>
        );
      })}
    </div>
  );
}
