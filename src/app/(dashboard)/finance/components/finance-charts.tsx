"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart2 } from "lucide-react";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(13, 9, 22, 0.97)",
  borderColor: "rgba(143,92,177,0.35)",
  borderWidth: 1,
  padding: [12, 16] as [number, number],
  textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
};

const FINANCE_SERIES: Array<{ day: string; revenue: number; commissions: number; payouts: number }> = [];

const revenueChartOption = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE,
    trigger: "axis",
    axisPointer: { type: "cross", lineStyle: { color: "rgba(143,92,177,0.3)" }, crossStyle: { color: "rgba(255,255,255,0.08)" } },
    formatter: (params: any[]) => {
      return `<div style="min-width:180px">
        <div style="font-weight:700;color:#f5f5f7;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:8px;margin-bottom:8px">${params[0]?.axisValue}</div>
        ${params.map(p => `
          <div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:5px">
            <span style="display:flex;align-items:center;gap:6px;color:#94a3b8">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 6px ${p.color}"></span>${p.seriesName}
            </span>
            <b style="color:#f5f5f7;font-variant-numeric:tabular-nums">${(p.value || 0).toLocaleString("ar-EG")} ل.س</b>
          </div>
        `).join("")}
      </div>`;
    },
  },
  legend: {
    data: ["الإيرادات", "العمولات", "المدفوعات"],
    right: 0, top: 0,
    textStyle: { color: "#64748b", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" },
    icon: "circle", itemWidth: 8, itemHeight: 8,
  },
  grid: { top: 36, right: 10, bottom: 20, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: FINANCE_SERIES.map(d => d.day),
    axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v },
    splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } },
    axisLine: { show: false }, axisTick: { show: false },
  },
  series: [
    {
      name: "الإيرادات",
      type: "line",
      data: FINANCE_SERIES.map(d => d.revenue),
      smooth: 0.5,
      showSymbol: false,
      emphasis: { showSymbol: true },
      lineStyle: { color: "#a57ed8", width: 3, shadowColor: "rgba(165,126,216,0.5)", shadowBlur: 12 },
      itemStyle: { color: "#a57ed8", borderColor: "#0d0916", borderWidth: 2 },
      areaStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "rgba(165,126,216,0.25)" }, { offset: 1, color: "rgba(165,126,216,0)" }] },
      },
    },
    {
      name: "العمولات",
      type: "line",
      data: FINANCE_SERIES.map(d => d.commissions),
      smooth: 0.5,
      showSymbol: false,
      emphasis: { showSymbol: true },
      lineStyle: { color: "#10b981", width: 2.5, shadowColor: "rgba(16,185,129,0.4)", shadowBlur: 10 },
      itemStyle: { color: "#10b981", borderColor: "#0d0916", borderWidth: 2 },
      areaStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "rgba(16,185,129,0.15)" }, { offset: 1, color: "rgba(16,185,129,0)" }] },
      },
    },
    {
      name: "المدفوعات",
      type: "bar",
      data: FINANCE_SERIES.map(d => d.payouts),
      barWidth: "20%",
      barMaxWidth: 18,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "rgba(251,146,60,0.5)" }, { offset: 1, color: "rgba(251,146,60,0.05)" }] },
      },
    },
  ],
};

const flowChartOption = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE,
    trigger: "axis",
    axisPointer: { type: "shadow", shadowStyle: { color: "rgba(255,255,255,0.02)" } },
    formatter: (params: any[]) => {
      const [comm, payout] = params;
      return `<div style="min-width:160px">
        <b style="color:#f5f5f7;display:block;margin-bottom:8px">${comm?.axisValue}</b>
        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px;color:#94a3b8">
          <span><span style="width:8px;height:8px;border-radius:2px;background:#10b981;display:inline-block;margin-left:5px"></span>عمولات</span>
          <b style="color:#6ee7b7">${(comm?.value || 0).toLocaleString("ar-EG")} ل.س</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px;color:#94a3b8">
          <span><span style="width:8px;height:8px;border-radius:2px;background:#f97316;display:inline-block;margin-left:5px"></span>مدفوعات</span>
          <b style="color:#fdba74">${(payout?.value || 0).toLocaleString("ar-EG")} ل.س</b>
        </div>
      </div>`;
    },
  },
  legend: {
    data: ["عمولات مُجمَّعة", "مدفوعات للمزودين"],
    right: 0, top: 0,
    textStyle: { color: "#64748b", fontSize: 11, fontFamily: "IBM Plex Sans Arabic" },
    icon: "roundRect", itemWidth: 10, itemHeight: 6,
  },
  grid: { top: 36, right: 10, bottom: 20, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: FINANCE_SERIES.map(d => d.day),
    axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v },
    splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } },
    axisLine: { show: false }, axisTick: { show: false },
  },
  series: [
    {
      name: "عمولات مُجمَّعة",
      type: "bar",
      data: FINANCE_SERIES.map(d => d.commissions),
      stack: "finance",
      barWidth: "48%",
      barMaxWidth: 20,
      itemStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "#10b981" }, { offset: 1, color: "rgba(16,185,129,0.4)" }] },
        borderRadius: [0, 0, 0, 0],
      },
    },
    {
      name: "مدفوعات للمزودين",
      type: "bar",
      data: FINANCE_SERIES.map(d => d.payouts - d.commissions),
      stack: "finance",
      barWidth: "48%",
      barMaxWidth: 20,
      itemStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: "#f97316" }, { offset: 1, color: "rgba(249,115,22,0.4)" }] },
        borderRadius: [4, 4, 0, 0],
      },
    },
  ],
};

interface FinanceChartsProps {
  type: "overview" | "flow";
  transactions?: any[];
}

export default function FinanceCharts({ type, transactions = [] }: FinanceChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const grouped = transactions.reduce((acc, tx) => {
    const date = tx.createdAt ? new Date(tx.createdAt) : null;
    const day = date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "غير محدد";
    if (!acc[day]) acc[day] = { day, revenue: 0, commissions: 0, payouts: 0 };
    const amount = Number(tx.amount ?? 0);
    if (tx.type === "COMMISSION") acc[day].commissions += amount;
    if (tx.type === "WITHDRAWAL" || tx.type === "PAYOUT") acc[day].payouts += amount;
    acc[day].revenue += amount;
    return acc;
  }, {} as Record<string, { day: string; revenue: number; commissions: number; payouts: number }>);
  const financeSeries = (Object.values(grouped) as Array<{ day: string; revenue: number; commissions: number; payouts: number }>).sort((a, b) => a.day.localeCompare(b.day));
  const dynamicRevenueOption = {
    ...revenueChartOption,
    xAxis: { ...revenueChartOption.xAxis, data: financeSeries.map((d) => d.day) },
    series: [
      { ...revenueChartOption.series[0], data: financeSeries.map((d) => d.revenue) },
      { ...revenueChartOption.series[1], data: financeSeries.map((d) => d.commissions) },
      { ...revenueChartOption.series[2], data: financeSeries.map((d) => d.payouts) },
    ],
  };
  const dynamicFlowOption = {
    ...flowChartOption,
    xAxis: { ...flowChartOption.xAxis, data: financeSeries.map((d) => d.day) },
    series: [
      { ...flowChartOption.series[0], data: financeSeries.map((d) => d.commissions) },
      { ...flowChartOption.series[1], data: financeSeries.map((d) => Math.max(d.payouts - d.commissions, 0)) },
    ],
  };

  if (type === "overview") {
    return (
      <Card className="p-6 bg-card border-border/40 animate-fade-in-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white text-sm tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              إيرادات وعمولات ومدفوعات المنصة
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">آخر 7 أيام — مقارنة شاملة للتدفق المالي</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold">
              {financeSeries.reduce((s, d) => s + d.revenue, 0).toLocaleString()} ل.س
            </span>
          </div>
        </div>
        {isMounted ? (
          <ReactECharts
            option={dynamicRevenueOption}
            style={{ height: 320, width: "100%" }}
            opts={{ renderer: "canvas" }}
            notMerge={true} lazyUpdate={true}
          />
        ) : <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">جاري التحميل...</div>}
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border/40 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-white text-sm tracking-tight flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            التدفق المالي المُكدَّس — عمولات مقابل مدفوعات
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            مقارنة حصص العمولات والمبالغ المحولة للمزودين يومياً
          </p>
        </div>
      </div>
      {isMounted ? (
        <ReactECharts
          option={dynamicFlowOption}
          style={{ height: 320, width: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge={true} lazyUpdate={true}
        />
      ) : <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">جاري التحميل...</div>}
    </Card>
  );
}
