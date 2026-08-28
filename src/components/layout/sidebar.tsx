"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/application/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Wrench, Package, Calendar,
  Settings, CreditCard, Star, Bell, Crown, ShieldCheck,
  LogOut, Wallet, Zap, X, Menu, FileText, BarChart3,
  ChevronLeft, PanelLeftClose, PanelLeftOpen, MapPinned,
  ChevronDown, Brain
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useCallback, memo } from "react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  color: string;
  /**
   * Live count for the item. Must come from a query — never a literal.
   * Three items previously carried fixed strings ("12", "3", "5") that never
   * changed with system state; a frozen counter in an operations console
   * teaches the operator to distrust every other number on screen.
   */
  badge?: string;
};

type NavGroup = { group: string; items: NavItem[] };

const navItems: NavGroup[] = [
  {
    group: "الرئيسية",
    items: [
      { href: "/", icon: LayoutDashboard, label: "لوحة القيادة", color: "text-primary" },
    ],
  },
  {
    group: "التحليلات",
    items: [
      { href: "/operations-intelligence", icon: Brain, label: "ذكاء العمليات", color: "text-primary" },
      { href: "/logs", icon: FileText, label: "سجل النشاطات", color: "text-primary" },
    ],
  },
  // `badge` is intentionally unset: it must carry a live count, never a
  // literal. Wire it to a query before re-adding it to any item.
  {
    group: "العمليات",
    items: [
      { href: "/orders", icon: Package, label: "الطلبات", color: "text-primary" },
      { href: "/bookings", icon: Calendar, label: "الحجوزات", color: "text-primary" },
      { href: "/providers-map", icon: MapPinned, label: "الخريطة المباشرة", color: "text-primary" },
      { href: "/services", icon: Zap, label: "الخدمات", color: "text-primary" },
    ],
  },
  {
    group: "الأعضاء",
    items: [
      { href: "/providers", icon: Wrench, label: "المزودون", color: "text-primary" },
      { href: "/users", icon: Users, label: "العملاء", color: "text-primary" },
    ],
  },
  {
    group: "المالية والنظام",
    items: [
      { href: "/finance", icon: Wallet, label: "المحفظة", color: "text-primary" },
      { href: "/subscriptions", icon: Crown, label: "الاشتراكات", color: "text-primary" },
      { href: "/admins", icon: ShieldCheck, label: "المسؤولون", color: "text-primary" },
      { href: "/settings", icon: Settings, label: "الإعدادات", color: "text-primary" },
      { href: "/reviews", icon: Star, label: "التقييمات", color: "text-primary" },
      { href: "/notifications", icon: Bell, label: "الإشعارات", color: "text-primary" },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
}

type NavContentProps = {
  isMobile?: boolean;
  collapsed: boolean;
  onCollapse?: (v: boolean) => void;
  pathname: string;
  admin: ReturnType<typeof useAuth>["admin"];
  logout: ReturnType<typeof useAuth>["logout"];
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (groupName: string) => void;
};

/**
 * Defined at module scope on purpose.
 *
 * This used to live inside `Sidebar`, which made it a *new component type* on
 * every render. `Sidebar` re-renders on every navigation (`usePathname`), so
 * React could never reconcile the old tree with the new one: it unmounted the
 * whole sidebar — logo image, all fifteen links, the avatar — and rebuilt it
 * from scratch each time a page was opened. That teardown is the jank you feel
 * on every click, and it is invisible in the profiler as "render time" because
 * the cost is DOM destruction, not React work.
 */
const NavContent = memo(function NavContent({
  isMobile = false,
  collapsed,
  onCollapse,
  pathname,
  admin,
  logout,
  collapsedGroups,
  toggleGroup,
}: NavContentProps) {
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* ── Logo ── */}
      <div className={cn(
        "flex items-center h-[var(--header-height)] border-b border-border/30 shrink-0 transition-all duration-300",
        collapsed && !isMobile ? "px-4 justify-center" : "px-4 gap-3"
      )}>
        <div className="relative flex-shrink-0">
          <img
            src="/logo_carHero.png"
            alt="Car Hero"
            className={cn(
              "object-contain drop-shadow-[0_5px_18px_rgba(212,175,55,0.22)] transition-all duration-300",
              collapsed && !isMobile ? "h-9 w-11" : "h-10 w-[126px]"
            )}
          />
          {/* Live dot */}
          <span className="absolute -top-0.5 -end-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-card" />
          </span>
        </div>

        {(!collapsed || isMobile) && (
          <>
            <p className="flex-1 min-w-0 text-xs text-muted-foreground/60 font-semibold tracking-wide">
              ADMIN CONTROL
            </p>

            {/* Collapse toggle — desktop only */}
            {onCollapse && !isMobile && (
              <button
                onClick={() => onCollapse(!collapsed)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-secondary/80 transition-all"
                title="طي القائمة"
                aria-label="طي القائمة"
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {/* Expand button when collapsed */}
        {collapsed && !isMobile && onCollapse && (
          <button
            onClick={() => onCollapse(false)}
            className="absolute -end-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border/80 flex items-center justify-center shadow-md hover:bg-secondary transition-all opacity-0 group-hover:opacity-100"
            title="توسيع القائمة"
            aria-label="توسيع القائمة"
          >
            <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-3 space-y-4",
        collapsed && !isMobile ? "px-2" : "px-3"
      )}>
        {navItems.map((group) => {
          const isCollapsible = group.items.length >= 3;
          const isGroupCollapsed = collapsedGroups[group.group];

          return (
            <div key={group.group}>
              {(!collapsed || isMobile) && (
                <div 
                  className={cn(
                    "flex items-center justify-between px-3 mb-1.5",
                    isCollapsible ? "cursor-pointer group/header hover:text-foreground" : ""
                  )}
                  onClick={() => isCollapsible && toggleGroup(group.group)}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground/60 group-hover/header:text-foreground transition-colors">
                    {group.group}
                  </p>
                  {isCollapsible && (
                    <ChevronDown className={cn(
                      "w-3 h-3 text-muted-foreground/60 transition-transform",
                      isGroupCollapsed ? "-rotate-90" : ""
                    )} />
                  )}
                </div>
              )}
              {collapsed && !isMobile && (
                <div className="h-px bg-border/30 mb-2 mx-1" />
              )}
              <ul className={cn(
                "space-y-0.5 transition-all duration-200 overflow-hidden",
                isGroupCollapsed && (!collapsed || isMobile) ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
              )}>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        // Pull the route's code and data before the click, so a
                        // production navigation is a render rather than a fetch.
                        prefetch
                        className={cn(
                          "sidebar-item relative flex items-center gap-3 py-2.5 text-sm font-semibold rounded-xl transition-all",
                          collapsed && !isMobile ? "px-2.5 justify-center" : "px-3",
                          active
                            ? "sidebar-item-active text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={collapsed && !isMobile ? item.label : undefined}
                      >
                        <item.icon className={cn(
                          "shrink-0 transition-colors",
                          collapsed && !isMobile ? "w-4 h-4" : "w-4 h-4",
                          active ? item.color : "text-muted-foreground/55",
                          "group-hover:text-foreground"
                        )} />

                        {(!collapsed || isMobile) && (
                          <>
                            <span className="flex-1 relative z-10">{item.label}</span>
                            {item.badge && (
                              <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-bold text-primary">
                                {item.badge}
                              </span>
                            )}
                            {active && !item.badge && (
                              <ChevronLeft className="w-3 h-3 text-primary/50 relative z-10" />
                            )}
                          </>
                        )}

                        {/* Tooltip for collapsed mode */}
                        {collapsed && !isMobile && (
                          <span className="sidebar-tooltip flex items-center gap-2">
                            {item.label}
                            {item.badge && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1 text-xs font-bold text-primary">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ── Admin Profile ── */}
      <div className={cn(
        "p-3 border-t border-border/25 shrink-0",
      )}>
        {collapsed && !isMobile ? (
          /* Collapsed — show avatar only */
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-9 w-9 border border-primary/25 shadow-sm cursor-pointer hover:border-primary/50 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xs font-bold">
                {admin?.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded */
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-secondary/35 hover:bg-secondary/65 transition-all duration-200 cursor-pointer border border-border/20 hover:border-border/45 group">
            <Avatar className="h-8 w-8 border border-primary/20 shadow-sm shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-xs font-bold">
                {admin?.name?.charAt(0)?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-none">
                {admin?.name || "المسؤول"}
              </p>
              <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                {admin?.role === 'superadmin' ? 'مدير عام' : admin?.role === 'admin' ? 'مسؤول' : 'مستخدم'}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
});

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  }, []);

  // Stable object so `memo` on NavContent actually holds between navigations:
  // a fresh inline props object would defeat it on every render.
  const navProps = { collapsed, onCollapse, pathname, admin, logout, collapsedGroups, toggleGroup };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="فتح القائمة"
        className="fixed top-4 start-4 z-[60] lg:hidden bg-card/95 border border-border/50 rounded-xl w-10 h-10 flex items-center justify-center shadow-lg text-foreground hover:bg-secondary transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-background/90 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[58] flex flex-col bg-card border-l border-border/40 transition-transform duration-200 w-[260px] lg:hidden",
          mobileOpen ? "translate-x-0 shadow-xl shadow-black/30" : "translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="إغلاق القائمة"
          className="absolute top-4 end-4 w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <NavContent isMobile {...navProps} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed inset-y-0 right-0 z-50 flex-col bg-[linear-gradient(180deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_48%,hsl(225_14%_5%)_100%)] border-l border-primary/15 transition-[width] duration-200 group",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}>
        {/* Subtle gradient at top */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/4 to-transparent pointer-events-none" />
        <NavContent {...navProps} />
      </aside>
    </>
  );
}
