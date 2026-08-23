"use client";

import { Calendar, User, Wrench, Package, MapPin, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Booking } from "@/domain/entities/booking.types";
import { orderAmount, orderDiscount, orderGrossAmount } from "@/lib/order-amount";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingDetailsDialog({ booking, onClose }: BookingDetailsDialogProps) {
  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            تفاصيل الحجز — {booking?.bookingNumber}
          </DialogTitle>
        </DialogHeader>
        {booking && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "العميل", value: booking.user?.fullName, icon: User },
                { label: "المزود", value: booking.provider?.businessName ?? "لم يُعيَّن", icon: Wrench },
                { label: "الخدمة", value: booking.service?.name, icon: Package },
                { label: "الموقع", value: (booking as any).address ?? "غير محدد", icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</p>
                  <p className="text-xs font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Visual Step-Timeline */}
            <div className="bg-secondary/15 border border-border/25 rounded-xl p-4 space-y-3.5">
              <p className="text-xs font-bold text-muted-foreground/70">حالة ومسار تتبع الطلب</p>
              
              <div className="flex items-center justify-between relative pt-2">
                {/* Connecting Line */}
                <div className="absolute top-[18px] start-4 end-4 h-0.5 bg-secondary/80 z-0" />
                <div 
                  className="absolute top-[18px] start-4 h-0.5 bg-primary transition-all duration-500 z-0" 
                  style={{ 
                    width: booking.status === "cancelled" 
                      ? "0%" 
                      : booking.status === "pending" 
                        ? "0%" 
                        : booking.status === "confirmed" 
                          ? "33%" 
                          : booking.status === "in_progress" 
                            ? "66%" 
                            : "100%" 
                  }} 
                />

                {/* Steps */}
                {[
                  { key: "pending", label: "تقديم الطلب" },
                  { key: "confirmed", label: "تأكيد الحجز" },
                  { key: "in_progress", label: "قيد التنفيذ" },
                  { key: "completed", label: "اكتمال الخدمة" },
                ].map((step, idx) => {
                  const statusOrder: Record<string, number> = { pending: 0, confirmed: 1, in_progress: 2, completed: 3 };
                  const currentOrder = statusOrder[booking.status] ?? 0;
                  const isCancelled = booking.status === "cancelled";
                  const isDone = !isCancelled && idx <= currentOrder;
                  const isCurrent = !isCancelled && idx === currentOrder;

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                      <div className={cn(
                        "w-5.5 h-5.5 rounded-full flex items-center justify-center border text-xs font-bold transition-all",
                        isCancelled && idx === 0
                          ? "bg-rose-500/10 border-rose-500 text-danger shadow-sm"
                          : isDone
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                            : "bg-background border-border/50 text-muted-foreground/60"
                      )}>
                        {isCancelled && idx === 0 ? (
                          <X className="w-2.5 h-2.5" />
                        ) : isDone && !isCurrent ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-bold text-center",
                        isCancelled && idx === 0
                          ? "text-danger font-extrabold"
                          : isDone
                            ? "text-white"
                            : "text-muted-foreground/40"
                      )}>
                        {isCancelled && idx === 3 ? "ملغي" : step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {booking.notes && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-warning mb-1 font-bold">ملاحظات العميل</p>
                <p className="text-xs text-foreground/85 leading-relaxed">{booking.notes}</p>
              </div>
            )}
            
            {/* المستحقّ هو الرقم البارز — وهو ما يراه العميل والفنّي. والخصم
                يُعرض فوقه حين يوجد بدل أن يختفي الفرق بلا تفسير. */}
            <div className="rounded-xl border border-border/20 bg-secondary/20 p-3.5 space-y-2">
              {orderDiscount(booking) > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">الإجمالي قبل الخصم</span>
                    <span className="text-xs text-foreground/70 tabular-nums">
                      {orderGrossAmount(booking).toLocaleString("ar-SA")} ل.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">خصم نقاط الولاء</span>
                    <span className="text-xs text-success tabular-nums">
                      −{orderDiscount(booking).toLocaleString("ar-SA")} ل.س
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">المستحقّ على العميل</span>
                <span className="text-base font-bold text-primary tabular-nums">
                  {orderAmount(booking).toLocaleString("ar-SA")} ل.س
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
