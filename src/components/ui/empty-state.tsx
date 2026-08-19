import { ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  iconClassName?: string;
  children?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
  iconClassName,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in", className)}>
      <div className={cn("w-12 h-12 rounded-2xl bg-secondary/30 border border-border/40 flex items-center justify-center text-muted-foreground/60 shadow-inner", iconClassName)}>
        <Icon className="w-6 h-6 text-primary/80" />
      </div>
      <div className="space-y-1 max-w-[280px]">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground/80 leading-relaxed">{description}</p>}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="h-8 text-xs gap-1.5 border-border/60 hover:bg-secondary">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
