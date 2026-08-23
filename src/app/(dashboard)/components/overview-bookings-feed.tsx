"use client";

import { Clock, ArrowLeft, Calendar, PlayCircle, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { orderAmount } from "@/lib/order-amount";

interface OverviewBookingsFeedProps {
  bookingsResponse: any;
  bookingsLoading: boolean;
}

export function OverviewBookingsFeed({ bookingsResponse, bookingsLoading }: OverviewBookingsFeedProps) {
  const recentBookings = bookingsResponse?.bookings ?? bookingsResponse?.data ?? [];

  return (
    <Card variant="feed" className="min-h-[400px]">
      <div className="absolute top-0 start-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-emerald-500" />
      <div className="flex items-center justify-between p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
              أحدث طلبات الحجز
            </h3>
            <p className="text-xs text-muted-foreground mt-1">تحديث حي ومستمر للطلبات على المنصة</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-success border border-emerald-500/30 pulse-live shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">مباشر</span>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-3 overflow-y-auto max-h-[300px]">
        {bookingsLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/30 skeleton shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-secondary/30 rounded skeleton" />
                  <div className="h-2 w-16 bg-secondary/30 rounded skeleton" />
                </div>
              </div>
              <div className="h-4 w-12 bg-secondary/30 rounded skeleton" />
            </div>
          ))
        ) : recentBookings.length > 0 ? (
          recentBookings.slice(0, 5).map((booking: any, i: number) => {
            const amount = orderAmount(booking);
            const status = booking.status || "pending";
            const isPending = status === "pending";
            
            return (
              <div
                key={booking._id || i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all border border-border/10 hover:border-border/30 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    status === "pending" 
                      ? "bg-amber-500/10 border-amber-500/20 text-warning animate-pulse" 
                      : status === "accepted" || status === "in-progress" || status === "in_progress"
                      ? "bg-blue-500/10 border-blue-500/20 text-info"
                      : status === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-success"
                      : status === "cancelled"
                      ? "bg-rose-500/10 border-rose-500/20 text-danger"
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}>
                    {status === "pending" ? <Clock className="w-4 h-4" /> 
                    : status === "accepted" || status === "in-progress" || status === "in_progress" ? <PlayCircle className="w-4 h-4" />
                    : status === "completed" ? <CheckCircle2 className="w-4 h-4" />
                    : status === "cancelled" ? <XCircle className="w-4 h-4" />
                    : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-foreground truncate">
                      {booking.service?.name || "خدمة مساعدة طريق"}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5 flex items-center gap-1.5">
                      <span>{booking.user?.fullName || "زبون كارهيرو"}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border" />
                      <span className="tabular-nums" dir="ltr">{booking.bookingNumber || booking.orderNumber || `#${booking._id?.substring(0, 6)}`}</span>
                    </p>
                  </div>
                </div>
                
                <div className="text-end shrink-0 pe-1 flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-white tabular-nums">
                    {amount.toLocaleString("ar-SA")} ل.س
                  </span>
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="لا توجد طلبات حجز نشطة"
            description="لم يتم تسجيل أي طلبات حجز جديدة على المنصة في الوقت الحالي."
            icon={Calendar}
            className="py-12 justify-center"
          />
        )}
      </div>
      <div className="p-6 pt-4 mt-auto border-t border-border/10 bg-secondary/5">
        <Link href="/orders" className="block w-full">
          <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 rounded-lg gap-1.5 transition-colors group">
            عرض كل الطلبات
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
