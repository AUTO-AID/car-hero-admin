import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-4 animate-fade-in py-12">
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div className="absolute w-12 h-12 rounded-full bg-primary/20 blur-md animate-pulse" />
        <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground tracking-wider animate-pulse">
        جاري تحميل الصفحة...
      </p>
    </div>
  );
}
