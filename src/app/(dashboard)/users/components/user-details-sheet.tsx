"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarClock, CarFront, Crown, Phone, Shield, WalletCards } from "lucide-react";

interface UserDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  isLoading?: boolean;
}

function formatCurrency(value: number | undefined) {
  return `${Number(value ?? 0).toLocaleString("ar-SA")} ل.س`;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "غير متوفر";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "غير متوفر" : date.toLocaleDateString("ar-SY");
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
        <Icon className="h-3.5 w-3.5 text-primary/70" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

export function UserDetailsSheet({ open, onOpenChange, user, isLoading }: UserDetailsSheetProps) {
  const subscriptionStatus = user?.subscriptionStatus || "none";
  const subscriptionLabel =
    user?.subscriptionPlanNameAr ||
    user?.subscriptionPlanName ||
    (subscriptionStatus === "none" ? "بدون اشتراك" : subscriptionStatus);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border/40 bg-background sm:max-w-lg">
        <SheetHeader className="border-b border-border/20 px-5 py-5">
          <SheetTitle className="text-base font-black">تفاصيل العميل</SheetTitle>
          <SheetDescription>بيانات الحساب والمحفظة والاشتراك من قاعدة البيانات</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 p-5">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-lg" />
                ))}
              </div>
            </>
          ) : user ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/50 p-4">
                <Avatar className="h-12 w-12 border border-border/40">
                  <AvatarFallback className="bg-primary/10 text-sm font-black text-primary">
                    {user.fullName?.charAt(0) || "ع"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-black text-white">{user.fullName || "عميل غير مسمى"}</h3>
                    {user.isPremium && (
                      <Badge className="border-amber-400/25 bg-amber-400/10 text-amber-300" variant="outline">
                        <Crown className="h-3 w-3" /> مميز
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground" dir="ltr">
                    <Phone className="h-3 w-3" />
                    {user.phoneNumber || user.phone || "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem label="حالة الحساب" value={user.isActive ? "نشط" : "معطل"} icon={Shield} />
                <DetailItem label="آخر دخول" value={formatDate(user.lastLoginAt)} icon={CalendarClock} />
                <DetailItem label="الرصيد المتاح" value={formatCurrency(user.walletBalance)} icon={WalletCards} />
                <DetailItem label="الرصيد المعلق" value={formatCurrency(user.walletPendingBalance)} icon={WalletCards} />
                <DetailItem label="نقاط الولاء" value={Number(user.loyaltyPoints ?? 0).toLocaleString("ar-SA")} icon={Crown} />
                <DetailItem label="عدد المركبات" value={Number(user.vehiclesCount ?? user.vehicles?.length ?? 0).toLocaleString("ar-SA")} icon={CarFront} />
                <DetailItem label="إجمالي الطلبات" value={Number(user.totalOrders ?? 0).toLocaleString("ar-SA")} icon={CalendarClock} />
                <DetailItem label="الطلبات المكتملة" value={Number(user.completedOrders ?? 0).toLocaleString("ar-SA")} icon={CalendarClock} />
                <DetailItem label="إجمالي الإنفاق" value={formatCurrency(user.totalSpent)} icon={WalletCards} />
                <DetailItem label="آخر طلب" value={formatDate(user.lastOrderAt)} icon={CalendarClock} />
              </div>

              <div className="rounded-xl border border-border/30 bg-secondary/15 p-4">
                <div className="mb-2 text-xs font-bold text-muted-foreground">الاشتراك الحالي</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      subscriptionStatus === "active"
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                        : "border-border/40 bg-secondary/30 text-muted-foreground"
                    }
                  >
                    {subscriptionLabel}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    ينتهي: {formatDate(user.subscriptionEndDate)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border/30 bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
              تعذر تحميل بيانات العميل.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
