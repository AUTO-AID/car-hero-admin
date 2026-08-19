"use client";

import { Bell, Search, RefreshCw, CalendarDays, ChevronRight, Command, Zap, Plus, Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getUnreadNotificationCount } from "@/infrastructure/services/notifications.service";
import { getOperationalAlerts, markOperationalAlertRead, type OperationalAlert } from "@/infrastructure/services/operations-intelligence.service";
import { queryKeys } from "@/infrastructure/query/query-keys";

const pageTitles: Record<string, { title: string; desc: string; emoji?: string; breadcrumbs?: { label: string; href: string }[] }> = {
  "/":              { title: "لوحة القيادة", desc: "نظرة عامة على أداء المنصة", emoji: "📊" },
  "/users":         { title: "إدارة العملاء", desc: "عرض وإدارة حسابات المستخدمين", emoji: "👥", breadcrumbs: [{ label: "الأعضاء", href: "/users" }] },
  "/providers":     { title: "إدارة المزودين", desc: "مراجعة وإدارة مزودي الخدمة", emoji: "🔧", breadcrumbs: [{ label: "الأعضاء", href: "/providers" }] },
  "/orders":        { title: "الطلبات", desc: "متابعة جميع طلبات الخدمة", emoji: "📦", breadcrumbs: [{ label: "العمليات", href: "/orders" }] },
  "/bookings":      { title: "الحجوزات", desc: "إدارة الحجوزات المجدولة", emoji: "📅", breadcrumbs: [{ label: "العمليات", href: "/bookings" }] },
  "/services":      { title: "الخدمات", desc: "إدارة كتالوج الخدمات", emoji: "⚡", breadcrumbs: [{ label: "العمليات", href: "/services" }] },
  "/finance":       { title: "المالية والمحفظة", desc: "المعاملات المالية وطلبات السحب", emoji: "💰", breadcrumbs: [{ label: "المالية", href: "/finance" }] },
  "/subscriptions": { title: "خطط الاشتراك", desc: "إدارة خطط Premium والمشتركين", emoji: "👑", breadcrumbs: [{ label: "المالية", href: "/subscriptions" }] },
  "/reviews":       { title: "التقييمات", desc: "مراجعة وإدارة تقييمات المستخدمين", emoji: "⭐", breadcrumbs: [{ label: "الجودة", href: "/reviews" }] },
  "/notifications": { title: "الإشعارات", desc: "إرسال وإدارة إشعارات Push", emoji: "🔔", breadcrumbs: [{ label: "الجودة", href: "/notifications" }] },
  "/admins":        { title: "فريق المسؤولين", desc: "إدارة حسابات وصلاحيات الأدمن", emoji: "🛡️", breadcrumbs: [{ label: "النظام", href: "/admins" }] },
  "/settings":      { title: "إعدادات النظام", desc: "التكوينات الأساسية والأمان", emoji: "⚙️", breadcrumbs: [{ label: "النظام", href: "/settings" }] },
  "/logs":          { title: "سجل النشاطات", desc: "مراقبة عمليات الأدمن وتتبع كل تعديل", emoji: "📋", breadcrumbs: [{ label: "النظام", href: "/logs" }] },
  "/operations-intelligence": { title: "ذكاء العمليات", desc: "متابعة ضغط الطلبات والتوصيات والتنبيهات التشغيلية", emoji: "🧠", breadcrumbs: [{ label: "التحليلات", href: "/operations-intelligence" }] },
};

// Quick search results
const QUICK_LINKS = [
  { label: "إضافة مزود جديد", href: "/providers", icon: Plus, category: "إجراء" },
  { label: "عرض الطلبات النشطة", href: "/orders", icon: Zap, category: "التنقل" },
  { label: "إشعار جماعي", href: "/notifications", icon: Bell, category: "إجراء" },
  { label: "ذكاء العمليات", href: "/operations-intelligence", icon: Brain, category: "متابعة" },
];

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ onRefresh, isRefreshing }: HeaderProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const page = pageTitles[pathname] || pageTitles["/"];
  const { data: unreadNotifications } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
  const notifCount = Number(unreadNotifications?.data?.count ?? unreadNotifications?.count ?? 0);
  const opsAlertParams = { page: 1, limit: 5, status: "unread" };
  const { data: operationsAlertsData } = useQuery({
    queryKey: queryKeys.operationsIntelligence.alerts(opsAlertParams),
    queryFn: () => getOperationalAlerts(opsAlertParams),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const operationsAlerts = (operationsAlertsData?.alerts ?? []) as OperationalAlert[];
  const operationsAlertCount = Number(operationsAlertsData?.stats?.unread ?? operationsAlerts.length ?? 0);
  const totalBellCount = notifCount + operationsAlertCount;
  const markOpsAlertReadMutation = useMutation({
    mutationFn: markOperationalAlertRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.operationsIntelligence.all }),
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const now = new Date().toLocaleDateString("ar-SA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const filteredLinks = QUICK_LINKS.filter(l =>
    !searchQuery || l.label.includes(searchQuery)
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/25 bg-background/65 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-[var(--header-height)] gap-4">

          {/* Left: Breadcrumb + Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Page emoji indicator */}
            {page.emoji && (
              <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/60 text-base shrink-0 border border-border/30">
                {page.emoji}
              </span>
            )}

            <div className="min-w-0">
              {/* Breadcrumb */}
              {page.breadcrumbs && (
                <nav aria-label="مسار التنقل" className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground/50 mb-0.5">
                  {/* الرابط كان 16 بكسل ارتفاعاً — دون حدّ WCAG 2.5.8 (24) */}
                  <Link href="/" className="inline-flex min-h-6 items-center px-1 -mx-1 rounded hover:text-primary transition-colors">الرئيسية</Link>
                  <ChevronRight aria-hidden="true" className="w-2.5 h-2.5 rotate-180" />
                  {page.breadcrumbs.map((b, i) => (
                    <span key={i} aria-current={i === page.breadcrumbs!.length - 1 ? "page" : undefined}>{b.label}</span>
                  ))}
                </nav>
              )}
              <h1 className="text-base font-bold text-white leading-none tracking-tight truncate">
                {page.title}
              </h1>
              <p className="text-xs text-muted-foreground/55 mt-0.5 hidden sm:block truncate">
                {page.desc}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">


            {/* Date badge */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground/55 bg-secondary/30 border border-border/25 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span>{now}</span>
            </div>

            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "flex items-center gap-2 h-8 bg-secondary/30 border border-border/30 rounded-lg px-3",
                "text-xs text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/60",
                "transition-all duration-200 group"
              )}
            >
              <Search className="w-3 h-3" />
              <span className="hidden md:inline">بحث سريع...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-mono bg-border/40 text-muted-foreground/40 border border-border/30 group-hover:border-border/60 transition-colors">
                <Command className="w-2 h-2" />K
              </kbd>
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Refresh */}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="h-8 w-8 rounded-lg hover:bg-secondary/60"
                title="تحديث البيانات"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isRefreshing && "animate-spin")} />
              </Button>
            )}

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAlertsOpen((prev) => !prev)}
                className="h-8 w-8 rounded-lg hover:bg-secondary/60 relative"
                title={`${totalBellCount} إشعارات جديدة`}
              >
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
              {totalBellCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -left-0.5 h-4 min-w-4 flex items-center justify-center",
                  "rounded-full bg-primary text-xs font-bold text-primary-foreground px-1",
                  "shadow-sm shadow-primary/40 pointer-events-none",
                  "animate-notification-bounce"
                )} style={{ animation: "notification-bounce 2s ease-in-out 1" }}>
                  {totalBellCount}
                </span>
              )}
              {alertsOpen && (
                <div className="absolute end-0 top-10 z-50 w-[340px] overflow-hidden rounded-xl border border-border/35 bg-card shadow-xl shadow-black/20">
                  <div className="flex items-center justify-between border-b border-border/30 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs font-black text-foreground">تنبيهات ذكاء العمليات</span>
                    </div>
                    <Link href="/operations-intelligence" onClick={() => setAlertsOpen(false)} className="text-xs font-bold text-primary hover:underline">
                      عرض الكل
                    </Link>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto p-2">
                    {operationsAlerts.length === 0 ? (
                      <div className="py-8 text-center text-xs font-bold text-muted-foreground">
                        لا توجد تنبيهات تشغيلية غير مقروءة
                      </div>
                    ) : (
                      operationsAlerts.map((alert) => (
                        <div key={alert._id || alert.id} className="rounded-lg border border-border/25 bg-background/35 p-3">
                          <Link href="/operations-intelligence" onClick={() => setAlertsOpen(false)} className="block">
                            <p className="line-clamp-1 text-xs font-black text-foreground">{alert.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-muted-foreground">{alert.message}</p>
                          </Link>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-muted-foreground">{alert.city || alert.severity}</span>
                            <button
                              type="button"
                              onClick={() => markOpsAlertReadMutation.mutate(alert._id || alert.id || "")}
                              className="inline-flex items-center gap-1 rounded-md border border-border/30 px-2 py-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              مقروء
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page progress indicator */}
        <div className="h-[1.5px] bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
      </header>

      {/* ── Command Search Modal ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Command bar */}
          <div
            className="command-bar relative w-full max-w-[520px] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
              <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <input
                autoFocus
                aria-label="بحث سريع عن صفحة أو إجراء"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن صفحة أو إجراء..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <kbd className="px-2 py-0.5 rounded text-xs font-mono bg-secondary text-muted-foreground/50 border border-border/30">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="p-2 max-h-[320px] overflow-y-auto">
              {filteredLinks.length > 0 ? (
                <>
                  <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/40">
                    الإجراءات السريعة
                  </p>
                  {filteredLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/70 transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                        <link.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-white transition-colors">
                        {link.label}
                      </span>
                      <span className="ms-auto text-xs text-muted-foreground/40 bg-secondary/60 px-2 py-0.5 rounded-md">
                        {link.category}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="py-10 text-center text-muted-foreground/40 text-sm">
                  لا توجد نتائج لـ &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-border/30 flex items-center gap-3 text-xs text-muted-foreground/35">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/40 font-mono">↵</kbd> تأكيد</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/40 font-mono">↑↓</kbd> تنقل</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border/40 font-mono">ESC</kbd> إغلاق</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
