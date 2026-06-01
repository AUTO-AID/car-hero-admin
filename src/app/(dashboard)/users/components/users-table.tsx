"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select";
import {
  Search, MoreHorizontal, UserCheck, UserX, Trash2,
  Eye, Users, Crown, Filter, Loader2, AlertCircle,
  SlidersHorizontal, WalletCards, Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const avatarColors = [
  "from-blue-500/20 to-blue-600/10 text-blue-400",
  "from-violet-500/20 to-violet-600/10 text-violet-400",
  "from-emerald-500/20 to-emerald-600/10 text-emerald-400",
  "from-orange-500/20 to-orange-600/10 text-orange-400",
  "from-pink-500/20 to-pink-600/10 text-pink-400",
];

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
  total: number;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (s: "all" | "active" | "inactive") => void;
  premiumFilter: "all" | "premium" | "standard";
  setPremiumFilter: (s: "all" | "premium" | "standard") => void;
  subscriptionFilter: "all" | "active" | "expired" | "cancelled" | "none";
  setSubscriptionFilter: (s: "all" | "active" | "expired" | "cancelled" | "none") => void;
  planFilter: string;
  setPlanFilter: (s: string) => void;
  minBalance: string;
  setMinBalance: (s: string) => void;
  maxBalance: string;
  setMaxBalance: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (s: "asc" | "desc") => void;
  page: number;
  setPage: (updater: number | ((p: number) => number)) => void;
  onViewUser: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDeleteUser: (id: string) => void;
  onExportUsers: () => void;
  mutatingUserId: string | null;
  errorMessage?: string;
}

export default function UsersTable({
  users,
  isLoading,
  total,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  premiumFilter,
  setPremiumFilter,
  subscriptionFilter,
  setSubscriptionFilter,
  planFilter,
  setPlanFilter,
  minBalance,
  setMinBalance,
  maxBalance,
  setMaxBalance,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  page,
  setPage,
  onViewUser,
  onToggleStatus,
  onDeleteUser,
  onExportUsers,
  mutatingUserId,
  errorMessage,
}: UsersTableProps) {
  const totalPages = Math.ceil(total / 10) || 1;
  const statusLabels: Record<string, string> = { all: "جميع الحالات", active: "نشط فقط", inactive: "غير نشط" };
  const premiumLabels: Record<string, string> = { all: "كل العملاء", premium: "مميز فقط", standard: "عادي فقط" };
  const subscriptionLabels: Record<string, string> = { all: "كل الاشتراكات", active: "اشتراك نشط", expired: "منتهي", cancelled: "ملغي", none: "بدون اشتراك" };
  const planLabels: Record<string, string> = { all: "كل الخطط", basic: "Basic", silver: "Silver", gold: "Gold", premium: "Premium", vip: "VIP" };
  const sortLabels: Record<string, string> = { newest: "الأحدث", name: "الاسم", balance: "الرصيد", loyalty: "نقاط الولاء", subscriptionEnd: "نهاية الاشتراك", lastLogin: "آخر دخول" };

  const resetAdvancedFilters = () => {
    setStatusFilter("all");
    setPremiumFilter("all");
    setSubscriptionFilter("all");
    setPlanFilter("all");
    setMinBalance("");
    setMaxBalance("");
    setSortBy("newest");
    setSortOrder("desc");
    setPage(1);
  };

  const renderSubscription = (user: any) => {
    const status = user.subscriptionStatus || "none";
    const label = user.subscriptionPlanNameAr || user.subscriptionPlanName || subscriptionLabels[status] || "بدون اشتراك";
    const classes: Record<string, string> = {
      active: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      expired: "border-amber-400/25 bg-amber-400/10 text-amber-300",
      cancelled: "border-rose-400/25 bg-rose-400/10 text-rose-300",
      none: "border-border/40 bg-secondary/30 text-muted-foreground",
    };

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${classes[status] || classes.none}`}>
          {label}
        </span>
        {user.subscriptionEndDate && (
          <span className="text-[9px] text-muted-foreground/60">
            حتى {new Date(user.subscriptionEndDate).toLocaleDateString("ar-SY")}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/40 overflow-hidden shadow-xl shadow-black/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border/30 gap-4 bg-secondary/15">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm tracking-tight">إدارة شؤون العملاء</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">البحث والتحكم في حسابات العملاء المسجلين في المنصة</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-background/80 border-border/40 text-xs h-9 pr-9 rounded-lg focus-visible:ring-primary placeholder:text-muted-foreground/40"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v: "all" | "active" | "inactive" | null) => { setStatusFilter(v || "all"); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-36 h-9 bg-background/80 border-border/40 text-xs rounded-lg">
              <Filter className="w-3 h-3 text-muted-foreground ml-1.5 shrink-0" />
              <span className="flex-1 text-left">{statusLabels[statusFilter]}</span>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/40 rounded-xl">
              <SelectItem value="all" className="text-xs">جميع الحالات</SelectItem>
              <SelectItem value="active" className="text-xs">نشط فقط</SelectItem>
              <SelectItem value="inactive" className="text-xs">غير نشط</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 p-4 border-b border-border/20 bg-background/20">
        <Select value={premiumFilter} onValueChange={(v: "all" | "premium" | "standard" | null) => { setPremiumFilter(v || "all"); setPage(1); }}>
          <SelectTrigger className="w-full h-9 bg-background/80 border-border/40 text-xs rounded-lg">
            <Crown className="w-3 h-3 text-amber-400 ml-1.5" />
            <span className="flex-1 text-left">{premiumLabels[premiumFilter]}</span>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/40 rounded-xl">
            <SelectItem value="all" className="text-xs">كل العملاء</SelectItem>
            <SelectItem value="premium" className="text-xs">مميز فقط</SelectItem>
            <SelectItem value="standard" className="text-xs">عادي فقط</SelectItem>
          </SelectContent>
        </Select>

        <Select value={subscriptionFilter} onValueChange={(v: "all" | "active" | "expired" | "cancelled" | "none" | null) => { setSubscriptionFilter(v || "all"); setPage(1); }}>
          <SelectTrigger className="w-full h-9 bg-background/80 border-border/40 text-xs rounded-lg">
            <WalletCards className="w-3 h-3 text-emerald-400 ml-1.5" />
            <span className="flex-1 text-left">{subscriptionLabels[subscriptionFilter]}</span>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/40 rounded-xl">
            <SelectItem value="all" className="text-xs">كل الاشتراكات</SelectItem>
            <SelectItem value="active" className="text-xs">اشتراك نشط</SelectItem>
            <SelectItem value="expired" className="text-xs">منتهي</SelectItem>
            <SelectItem value="cancelled" className="text-xs">ملغي</SelectItem>
            <SelectItem value="none" className="text-xs">بدون اشتراك</SelectItem>
          </SelectContent>
        </Select>

        <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v || "all"); setPage(1); }}>
          <SelectTrigger className="w-full h-9 bg-background/80 border-border/40 text-xs rounded-lg">
            <span className="flex-1 text-left">{planLabels[planFilter] || planFilter}</span>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/40 rounded-xl">
            <SelectItem value="all" className="text-xs">كل الخطط</SelectItem>
            <SelectItem value="basic" className="text-xs">Basic</SelectItem>
            <SelectItem value="silver" className="text-xs">Silver</SelectItem>
            <SelectItem value="gold" className="text-xs">Gold</SelectItem>
            <SelectItem value="premium" className="text-xs">Premium</SelectItem>
            <SelectItem value="vip" className="text-xs">VIP</SelectItem>
          </SelectContent>
        </Select>

        <Input
          inputMode="numeric"
          placeholder="أقل رصيد..."
          value={minBalance}
          onChange={(e) => { setMinBalance(e.target.value.replace(/[^\d.]/g, "")); setPage(1); }}
          className="bg-background/80 border-border/40 text-xs h-9 rounded-lg focus-visible:ring-primary placeholder:text-muted-foreground/40"
        />

        <Input
          inputMode="numeric"
          placeholder="أعلى رصيد..."
          value={maxBalance}
          onChange={(e) => { setMaxBalance(e.target.value.replace(/[^\d.]/g, "")); setPage(1); }}
          className="bg-background/80 border-border/40 text-xs h-9 rounded-lg focus-visible:ring-primary placeholder:text-muted-foreground/40"
        />

        <div className="flex gap-2 xl:col-span-2">
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v || "newest"); setPage(1); }}>
            <SelectTrigger className="flex-1 h-9 bg-background/80 border-border/40 text-xs rounded-lg">
              <SlidersHorizontal className="w-3 h-3 text-muted-foreground ml-1.5" />
              <span className="flex-1 text-left">{sortLabels[sortBy]}</span>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/40 rounded-xl">
              <SelectItem value="newest" className="text-xs">الأحدث</SelectItem>
              <SelectItem value="name" className="text-xs">الاسم</SelectItem>
              <SelectItem value="balance" className="text-xs">الرصيد</SelectItem>
              <SelectItem value="loyalty" className="text-xs">نقاط الولاء</SelectItem>
              <SelectItem value="subscriptionEnd" className="text-xs">نهاية الاشتراك</SelectItem>
              <SelectItem value="lastLogin" className="text-xs">آخر دخول</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v: "asc" | "desc" | null) => { setSortOrder(v || "desc"); setPage(1); }}>
            <SelectTrigger className="w-24 h-9 bg-background/80 border-border/40 text-xs rounded-lg">
              <span>{sortOrder === "asc" ? "تصاعدي" : "تنازلي"}</span>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/40 rounded-xl">
              <SelectItem value="desc" className="text-xs">تنازلي</SelectItem>
              <SelectItem value="asc" className="text-xs">تصاعدي</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm" onClick={resetAdvancedFilters} className="h-9 rounded-lg border-border/40 text-[10px]">
            تصفير
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onExportUsers} disabled={isLoading || users.length === 0} className="h-9 rounded-lg border-border/40 text-[10px]">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="border-b border-rose-400/20 bg-rose-500/10 px-5 py-3 text-xs font-semibold text-rose-300">
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-border/20 bg-secondary/5 text-muted-foreground">
              {["العميل", "رقم الهاتف", "الحالة", "الاشتراك", "الرصيد", "نقاط الولاء", "آخر دخول", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/10">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-xs text-muted-foreground font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-muted-foreground/40" />
                    <span>لم يتم العثور على أي عملاء يطابقون خيارات البحث.</span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user: any, i: number) => {
                const id = user._id || user.id;
                const isMutating = mutatingUserId === id;
                return (
                  <tr
                    key={id || i}
                    className="border-b border-border/10 hover:bg-secondary/20 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8.5 w-8.5 border border-border/30 shadow-sm shrink-0">
                          <AvatarFallback className={`bg-gradient-to-br ${avatarColors[i % avatarColors.length]} text-[11px] font-black`}>
                            {user.fullName ? user.fullName.charAt(0) : "ع"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{user.fullName || "عميل غير مسمى"}</p>
                          {user.isPremium && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400 mt-0.5 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.2 rounded-md">
                              <Crown className="w-2.5 h-2.5 animate-pulse" /> مميز
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground/80 font-mono tracking-wider" dir="ltr">
                        {user.phoneNumber || user.phone || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={user.isActive} />
                        {isMutating && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{renderSubscription(user)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-black text-white tabular-nums">
                        {Number(user.walletBalance ?? 0).toLocaleString("ar-SA")}
                        <span className="text-[10px] text-muted-foreground/60 font-medium mr-1">ل.س</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-black text-amber-400/90 tabular-nums">
                        {Number(user.loyaltyPoints ?? 0).toLocaleString("ar-SA")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-muted-foreground/70">
                      {user.lastLoginAt
                        ? formatDistanceToNow(new Date(user.lastLoginAt), { locale: ar, addSuffix: true })
                        : "غير مسجل"}
                    </td>
                    <td className="px-5 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-secondary/60 text-muted-foreground/80">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border/50 w-44 rounded-xl shadow-lg">
                          <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onClick={() => onViewUser(id)}>
                            <Eye className="w-3.5 h-3.5" /> عرض تفاصيل الحساب
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-xs cursor-pointer font-semibold"
                            onClick={() => onToggleStatus(id, !user.isActive)}
                            disabled={isMutating}
                          >
                            {user.isActive ? (
                              <><UserX className="w-3.5 h-3.5 text-rose-400" /> تعطيل الحساب</>
                            ) : (
                              <><UserCheck className="w-3.5 h-3.5 text-emerald-400" /> تفعيل الحساب</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/20" />
                          <DropdownMenuItem
                            className="gap-2 text-xs text-rose-400 cursor-pointer font-bold"
                            onClick={() => onDeleteUser(id)}
                            disabled={isMutating}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> حذف الحساب
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-border/20 bg-secondary/5">
        <p className="text-[11px] text-muted-foreground/60">
          يتم عرض <span className="font-bold text-foreground">{users.length}</span> من أصل{" "}
          <span className="font-bold text-white">{total}</span> عميل مسجل
        </p>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-7 text-[10px] font-bold border-border/30 rounded-lg px-2.5 transition-all hover:bg-secondary"
          >
            السابق
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              if (totalPages > 5 && Math.abs(page - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="text-[10px] text-muted-foreground/30 px-1">...</span>;
                }
                return null;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 p-0 text-xs rounded-lg font-bold transition-all ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground font-black shadow-md shadow-primary/10"
                      : "border-border/30 hover:border-border/80 text-muted-foreground hover:text-white"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || users.length < 10}
            className="h-7 text-[10px] font-bold border-border/30 rounded-lg px-2.5 transition-all hover:bg-secondary"
          >
            التالي
          </Button>
        </div>
      </div>
    </Card>
  );
}
