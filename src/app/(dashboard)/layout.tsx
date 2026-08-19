"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/application/contexts/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminNotificationProvider } from "@/components/providers/admin-notification-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !admin) router.replace("/login");
  }, [admin, isLoading, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse-glow" />
            <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
          </div>
          <p dir="auto" className="text-sm font-semibold text-muted-foreground tracking-wide">جاري إعداد بيئة العمل...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <AdminNotificationProvider>
      <div className="dashboard-shell min-h-screen bg-background flex overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        <div 
          className={cn(
            "flex-1 flex flex-col min-h-screen w-full transition-[margin] duration-200 ease-out",
            sidebarCollapsed ? "lg:mr-[var(--sidebar-collapsed-width)]" : "lg:mr-[var(--sidebar-width)]"
          )}
        >
          <Header />
          <main className="relative flex-1 p-6 sm:p-8 md:p-10 w-full max-w-[1600px] mx-auto overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminNotificationProvider>
  );
}
