import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-secondary/50 border border-border/40 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-foreground">الصفحة غير موجودة</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التحقق من الرابط والمحاولة مرة أخرى.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center"
            )}
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
