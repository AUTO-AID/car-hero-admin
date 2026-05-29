"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OverviewBookingsFeedProps {
  bookingsResponse: any;
  bookingsLoading: boolean;
}

export function OverviewBookingsFeed({ bookingsResponse, bookingsLoading }: OverviewBookingsFeedProps) {
  const recentBookings = bookingsResponse?.bookings ?? bookingsResponse?.data ?? [];

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/40 shadow-xl shadow-black/20 overflow-hidden flex flex-col group relative">
      <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-emerald-500" />
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/30">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
            أحدث طلبات الحجز
          </h3>
          <p className="text-[12px] text-muted-foreground mt-1">تحديث حي ومستمر للطلبات على المنصة</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-black uppercase">مباشر</span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[300px]">
        {bookingsLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/40 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-secondary/40 rounded" />
                  <div className="h-2 w-16 bg-secondary/40 rounded" />
                </div>
              </div>
              <div className="h-4 w-12 bg-secondary/40 rounded" />
            </div>
          ))
        ) : recentBookings.length > 0 ? (
          recentBookings.slice(0, 5).map((booking: any, i: number) => {
            const amount = booking.payableAmount ?? booking.totalAmount ?? 0;
            const status = booking.status || "pending";
            const isPending = status === "pending";
            
            return (
              <div
                key={booking._id || i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all border border-border/10 hover:border-border/30 cursor-pointer animate-fade-in-up"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isPending 
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse" 
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-foreground truncate">
                      {booking.service?.name || "خدمة مساعدة طريق"}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5 flex items-center gap-1.5">
                      <span>{booking.user?.fullName || "زبون كارهيرو"}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span className="tabular-nums" dir="ltr">{booking.bookingNumber || booking.orderNumber || `#${booking._id?.substring(0, 6)}`}</span>
                    </p>
                  </div>
                </div>
                
                <div className="text-left shrink-0 pl-1 flex flex-col items-end gap-1">
                  <span className="text-xs font-black text-white tabular-nums">
                    {amount.toLocaleString("ar-SA")} ل.س
                  </span>
                  <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                    status === "completed" 
                      ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                      : status === "cancelled" 
                        ? "text-rose-400 bg-rose-400/10 border border-rose-400/20"
                        : status === "in_progress" 
                          ? "text-blue-400 bg-blue-400/10 border border-blue-400/20 animate-pulse"
                          : "text-amber-400 bg-amber-400/10 border border-amber-400/20"
                  }`}>
                    {status === "completed" ? "مكتمل" : status === "cancelled" ? "ملغي" : status === "in_progress" ? "جاري" : "انتظار"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs font-medium">
            لا يوجد طلبات حجز نشطة حالياً.
          </div>
        )}
      </div>
    </Card>
  );
}
