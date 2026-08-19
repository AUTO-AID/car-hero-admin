import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  type?: "bar" | "horizontal-bar" | "line" | "funnel";
  className?: string;
}

export function ChartSkeleton({ type = "bar", className = "" }: ChartSkeletonProps) {
  if (type === "horizontal-bar") {
    return (
      <div className={cn("w-full h-full flex flex-col gap-4 py-4 px-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 w-full">
            {/* Label skeleton */}
            <div className="w-14 h-3 bg-secondary/30 rounded skeleton shrink-0" />
            {/* Bar skeleton */}
            <div 
              className="h-3 bg-secondary/30 rounded skeleton"
              style={{
                width: `${Math.max(20, 100 - i * 18 - Math.random() * 10)}%`,
              }}
            />
            {/* Value skeleton */}
            <div className="w-8 h-3 bg-secondary/30 rounded skeleton shrink-0 ms-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className={cn("w-full h-full flex flex-col justify-end gap-2 px-2 pt-8 pb-4 relative overflow-hidden", className)}>
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6">
          <div className="w-full h-32 relative">
            <div className="absolute bottom-6 end-[10%] w-3 h-3 bg-primary/20 rounded-full skeleton" />
            <div className="absolute bottom-16 end-[30%] w-3 h-3 bg-primary/20 rounded-full skeleton" />
            <div className="absolute bottom-10 end-[50%] w-3 h-3 bg-primary/20 rounded-full skeleton" />
            <div className="absolute bottom-24 end-[70%] w-3 h-3 bg-primary/20 rounded-full skeleton" />
            <div className="absolute bottom-14 end-[90%] w-3 h-3 bg-primary/20 rounded-full skeleton" />
            <div className="w-full h-full border-b border-dashed border-border/10 flex flex-col justify-between">
              <div className="w-full border-b border-dashed border-border/5 h-0" />
              <div className="w-full border-b border-dashed border-border/5 h-0" />
              <div className="w-full border-b border-dashed border-border/5 h-0" />
            </div>
          </div>
        </div>
        <div className="flex justify-between px-4 w-full border-t border-border/10 pt-2 z-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-2 w-8 bg-secondary/20 rounded skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (type === "funnel") {
    return (
      <div className={cn("w-full h-full flex flex-col items-center justify-center gap-3 py-6 px-12", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="h-9 bg-secondary/30 rounded-lg skeleton flex items-center justify-center"
            style={{
              width: `${100 - i * 16}%`,
              opacity: 1 - i * 0.15,
            }}
          >
            <div className="w-16 h-2 bg-background/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col justify-end gap-2 px-2 pt-8 pb-4", className)}>
      <div className="flex items-end justify-between h-full gap-2 px-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="w-full bg-secondary/30 rounded-t-lg skeleton"
            style={{ 
              height: `${Math.max(20, 100 - i * 12 - Math.random() * 15)}%`,
            }} 
          />
        ))}
      </div>
      <div className="flex justify-between px-4 w-full border-t border-border/10 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-2 w-8 bg-secondary/20 rounded skeleton" />
        ))}
      </div>
    </div>
  );
}
