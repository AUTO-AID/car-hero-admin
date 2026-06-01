"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { BarChart2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type FinanceChartTransaction = {
  type?: string;
  ownerType?: string;
  referenceType?: string;
  amount?: number;
  status?: string;
  createdAt?: string | Date;
};

interface FinanceChartsProps {
  type: "overview" | "flow";
  transactions?: FinanceChartTransaction[];
}

const tooltipStyle = {
  backgroundColor: "rgba(13, 9, 22, 0.97)",
  borderColor: "rgba(143,92,177,0.35)",
  borderWidth: 1,
  padding: [12, 16] as [number, number],
  textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
};

const formatDay = (value: string | Date | undefined) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "غير محدد";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function FinanceCharts({ type, transactions = [] }: FinanceChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const series = useMemo(() => {
    const grouped = transactions.reduce<Record<string, { day: string; revenue: number; commissions: number; payouts: number }>>(
      (acc, tx) => {
        if (tx.status && tx.status !== "completed") return acc;
        const day = formatDay(tx.createdAt);
        const amount = Number(tx.amount ?? 0);
        const txType = String(tx.type ?? "").toLowerCase();
        const ownerType = String(tx.ownerType ?? "").toLowerCase();
        const referenceType = String(tx.referenceType ?? "").toLowerCase();
        if (!acc[day]) acc[day] = { day, revenue: 0, commissions: 0, payouts: 0 };

        const isUserOrderPayment = txType === "debit" && ownerType === "user" && referenceType === "order";
        const isProviderOrderEarning = txType === "credit" && ownerType === "provider" && referenceType === "order";
        const isPayout = txType === "debit" && ownerType === "provider" && ["payout", "withdrawal"].includes(referenceType);

        if (isUserOrderPayment) acc[day].revenue += amount;
        if (isProviderOrderEarning) acc[day].commissions -= amount;
        if (isUserOrderPayment) acc[day].commissions += amount;
        if (isPayout) acc[day].payouts += amount;
        return acc;
      },
      {},
    );

    return Object.values(grouped)
      .map((item) => ({ ...item, commissions: Math.max(item.commissions, 0) }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [transactions]);

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      ...tooltipStyle,
      trigger: "axis",
      formatter: (params: any[]) => {
        const rows = params
          .map(
            (p) => `<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:5px">
              <span style="display:flex;align-items:center;gap:6px;color:#94a3b8">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>${p.seriesName}
              </span>
              <b style="color:#f5f5f7">${Number(p.value || 0).toLocaleString("ar-SY")} ل.س</b>
            </div>`,
          )
          .join("");
        return `<div style="min-width:180px"><b style="color:#f5f5f7;display:block;margin-bottom:8px">${params[0]?.axisValue || ""}</b>${rows}</div>`;
      },
    },
    legend: {
      data: type === "overview" ? ["إيرادات الطلبات", "عمولة المنصة", "مدفوعات المزودين"] : ["عمولة المنصة", "مدفوعات المزودين"],
      right: 0,
      top: 0,
      textStyle: { color: "#94a3b8", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" },
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
    },
    grid: { top: 42, right: 10, bottom: 20, left: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: series.map((d) => d.day),
      axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v) },
      splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series:
      type === "overview"
        ? [
            { name: "إيرادات الطلبات", type: "line", smooth: 0.45, showSymbol: false, data: series.map((d) => d.revenue), lineStyle: { color: "#a57ed8", width: 3 }, itemStyle: { color: "#a57ed8" } },
            { name: "عمولة المنصة", type: "line", smooth: 0.45, showSymbol: false, data: series.map((d) => d.commissions), lineStyle: { color: "#10b981", width: 2.5 }, itemStyle: { color: "#10b981" } },
            { name: "مدفوعات المزودين", type: "bar", data: series.map((d) => d.payouts), barMaxWidth: 18, itemStyle: { color: "#f97316", borderRadius: [4, 4, 0, 0] } },
          ]
        : [
            { name: "عمولة المنصة", type: "bar", stack: "flow", data: series.map((d) => d.commissions), barMaxWidth: 22, itemStyle: { color: "#10b981" } },
            { name: "مدفوعات المزودين", type: "bar", stack: "flow", data: series.map((d) => d.payouts), barMaxWidth: 22, itemStyle: { color: "#f97316", borderRadius: [4, 4, 0, 0] } },
          ],
  };

  const title = type === "overview" ? "إيرادات وعمولات ومدفوعات المنصة" : "التدفق المالي: عمولات مقابل مدفوعات";
  const total = series.reduce((sum, item) => sum + (type === "overview" ? item.revenue : item.commissions + item.payouts), 0);

  return (
    <Card className="p-6 bg-card border-border/40 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h3 className="font-semibold text-white text-sm tracking-tight flex items-center gap-2">
            {type === "overview" ? <TrendingUp className="w-4 h-4 text-violet-400" /> : <BarChart2 className="w-4 h-4 text-emerald-400" />}
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">مبني على العمليات المطابقة للفلاتر الزمنية الحالية.</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold">
          {total.toLocaleString("ar-SY")} ل.س
        </span>
      </div>
      {isMounted ? (
        series.length ? (
          <ReactECharts option={option} style={{ height: 320, width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
        ) : (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">لا توجد عمليات مالية ضمن النطاق الحالي</div>
        )
      ) : (
        <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">جاري التحميل...</div>
      )}
    </Card>
  );
}
