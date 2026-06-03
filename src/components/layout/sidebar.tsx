"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/application/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Wrench, Package, Calendar,
  Settings, CreditCard, Star, Bell, Crown, ShieldCheck,
  LogOut, Car, Wallet, Zap, X, Menu, FileText, BarChart3,
  ChevronLeft, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

const navItems = [
  {
    group: "الرئيسية",
    items: [
      { href: "/", icon: LayoutDashboard, label: "لوحة القيادة", color: "text-violet-400" },
    ],
  },
  {
    group: "إدارة الأعضاء",
    items: [
      { href: "/users", icon: Users, label: "العملاء", color: "text-blue-400" },
      { href: "/providers", icon: Wrench, label: "المزودون", color: "text-violet-400" },
    ],
  },
  {
    group: "العمليات",
    items: [
      { href: "/orders", icon: Package, label: "الطلبات", color: "text-orange-400" },
      { href: "/bookings", icon: Calendar, label: "الحجوزات", color: "text-cyan-400" },
      { href: "/services", icon: Zap, label: "الخدمات", color: "text-yellow-400" },
    ],
  },
  {
    group: "المالية",
    items: [
      { href: "/finance", icon: Wallet, label: "المحفظة", color: "text-emerald-400" },
      { href: "/subscriptions", icon: Crown, label: "الاشتراكات", color: "text-amber-400" },
    ],
  },
  {
    group: "الجودة",
    items: [
      { href: "/reviews", icon: Star, label: "التقييمات", color: "text-yellow-400" },
      { href: "/notifications", icon: Bell, label: "الإشعارات", color: "text-pink-400" },
    ],
  },
  {
    group: "النظام",
    items: [
      { href: "/admins", icon: ShieldCheck, label: "المسؤولون", color: "text-red-400" },
      { href: "/settings", icon: Settings, label: "الإعدادات", color: "text-slate-400" },
      { href: "/logs", icon: FileText, label: "سجل النشاطات", color: "text-indigo-400" },
      { href: "/ai-recommendations", icon: BarChart3, label: "تحليلات الذكاء الاصطناعي", color: "text-rose-400" },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (v: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* ── Logo ── */}
      <div className={cn(
        "flex items-center h-[var(--header-height)] border-b border-border/30 shrink-0 transition-all duration-300",
        collapsed && !isMobile ? "px-4 justify-center" : "px-4 gap-3"
      )}>
        {/* Logo mark */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-primary/15 border border-primary/25 shadow-lg shadow-primary/10">
            <Car className="w-[17px] h-[17px] text-primary" />
          </div>
          {/* Live dot */}
          <span className="absolute -top-0.5 -left-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-card" />
          </span>
        </div>

        {(!collapsed || isMobile) && (
          <>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-[14px] text-white leading-none tracking-tight">
                Car<span className="text-primary">Hero</span>
              </h2>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium tracking-wide">
                Admin Panel
              </p>
            </div>

            {/* Collapse toggle — desktop only */}
            {onCollapse && !isMobile && (
              <button
                onClick={() => onCollapse(!collapsed)}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/80 transition-all"
                title="طي القائمة"
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
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border/80 flex items-center justify-center shadow-md hover:bg-secondary transition-all opacity-0 group-hover:opacity-100"
            title="توسيع القائمة"
          >
            <PanelLeftClose className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-3 space-y-4",
        collapsed && !isMobile ? "px-2" : "px-3"
      )}>
        {navItems.map((group) => (
          <div key={group.group}>
            {(!collapsed || isMobile) && (
              <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground/35">
                {group.group}
              </p>
            )}
            {collapsed && !isMobile && (
              <div className="h-px bg-border/30 mb-2 mx-1" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "sidebar-item relative flex items-center gap-3 py-2.5 text-[13px] font-medium rounded-xl transition-all",
                        collapsed && !isMobile ? "px-2.5 justify-center" : "px-3",
                        active
                          ? "sidebar-item-active text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title={collapsed && !isMobile ? item.label : undefined}
                    >
                      <item.icon className={cn(
                        "shrink-0 transition-colors",
                        collapsed && !isMobile ? "w-[18px] h-[18px]" : "w-[15px] h-[15px]",
                        active ? item.color : "text-muted-foreground/55",
                        "group-hover:text-foreground"
                      )} />

                      {(!collapsed || isMobile) && (
                        <>
                          <span className="flex-1 relative z-10">{item.label}</span>
                          {active && (
                            <ChevronLeft className="w-3 h-3 text-primary/50 relative z-10" />
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {collapsed && !isMobile && (
                        <span className="sidebar-tooltip">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
              title="تسجيل الخروج"
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
              <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                {admin?.role === 'superadmin' ? 'مدير عام' : admin?.role === 'admin' ? 'مسؤول' : 'مستخدم'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-muted-foreground/35 hover:text-destructive hover:bg-destructive/10 transition-all"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 right-4 z-[60] lg:hidden bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-2.5 shadow-xl text-foreground hover:bg-secondary transition-all"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[58] flex flex-col bg-card/98 backdrop-blur-xl border-l border-border/40 transition-all duration-300 w-[260px] lg:hidden",
          mobileOpen ? "translate-x-0 shadow-2xl shadow-black/40" : "translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <NavContent isMobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed inset-y-0 right-0 z-50 flex-col bg-card/75 backdrop-blur-xl border-l border-border/35 transition-all duration-300 group",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}>
        {/* Subtle gradient at top */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/4 to-transparent pointer-events-none" />
        <NavContent />
      </aside>
    </>
  );
}
