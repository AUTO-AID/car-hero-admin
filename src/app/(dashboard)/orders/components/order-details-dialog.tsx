"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  User,
  Wrench,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderRecord } from "@/infrastructure/services/bookings.service";
import { orderAmount } from "@/lib/order-amount";

/** Payable amount with the same fallback chain the page uses. */
function amount(order: OrderRecord) {
  return orderAmount(order);
}

/**
 * Order details dialog — pulled out of page.tsx, which ran to 891 lines.
 * It depends only on OrderRecord, so it moves cleanly.
 */
export function OrderDetailsDialog({ order, onClose }: { order: OrderRecord | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            معلومات الطلب {order?.orderNumber}
          </DialogTitle>
        </DialogHeader>
        {order && (
          <Tabs defaultValue="details" className="w-full mt-2">
            <TabsList className="bg-card border border-border/50 w-full justify-start rounded-lg mb-4 h-auto p-1">
              <TabsTrigger value="details" className="text-xs px-4 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">التفاصيل</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs px-4 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">الدفع والحالة</TabsTrigger>
              <TabsTrigger value="tracking" className="text-xs px-4 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">التتبع</TabsTrigger>
              {(order.userNotes || order.cancellationReason) && (
                 <TabsTrigger value="notes" className="text-xs px-4 py-1.5 text-warning/80 data-[state=active]:bg-amber-500/15 data-[state=active]:text-warning">ملاحظات</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="mt-0 space-y-4 outline-none animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "العميل", value: order.user?.fullName || "غير معروف", icon: User },
                  { label: "المزود", value: order.provider?.businessName || "لم يعين", icon: Wrench },
                  { label: "الخدمة", value: order.service?.name || order.serviceName || "غير محدد", icon: Package },
                  { label: "الموقع", value: order.address || "غير محدد", icon: MapPin },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-border/30 bg-secondary/20 p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {label}
                    </p>
                    <p className="text-xs font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payment" className="mt-0 outline-none animate-in fade-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">حالة الطلب</p>
                  <StatusBadge status={order.status} />
                </div>
                <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">الدفع</p>
                  <StatusBadge status={order.paymentStatus ?? "pending"} />
                </div>
                <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">طريقة الدفع</p>
                  <p className="text-xs font-bold text-white">{order.paymentMethod || "-"}</p>
                </div>
                <div className="rounded-xl border border-border/30 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground mb-1">المبلغ</p>
                  <p className="text-xs font-bold text-primary">{amount(order).toLocaleString("ar-SA")} ل.س</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="mt-0 outline-none animate-in fade-in duration-300">
              <div className="rounded-xl border border-border/30 bg-secondary/10 p-4">
                <p className="text-xs font-bold text-muted-foreground mb-4">سجل التواريخ</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between border-b border-border/10 pb-2">
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> تاريخ الإنشاء</span>
                    <span className="font-semibold text-foreground">{order.createdAt ? format(new Date(order.createdAt), "yyyy-MM-dd HH:mm") : "-"}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/10 pb-2">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-info" /> وقت الجدولة</span>
                    <span className="font-semibold text-foreground">{order.scheduledAt ? format(new Date(order.scheduledAt), "yyyy-MM-dd HH:mm") : "لا"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-warning" /> وقت البدء</span>
                    <span className="font-semibold text-foreground">{order.startedAt ? format(new Date(order.startedAt), "yyyy-MM-dd HH:mm") : "-"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-success" /> وقت الاكتمال</span>
                    <span className="font-semibold text-foreground">{order.completedAt ? format(new Date(order.completedAt), "yyyy-MM-dd HH:mm") : "-"}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 outline-none animate-in fade-in duration-300">
              {(order.userNotes || order.cancellationReason) && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs text-warning font-bold mb-2">ملاحظات مسجلة</p>
                  <p className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap">{order.userNotes || order.cancellationReason}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
