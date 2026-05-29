"use client";

import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(13, 9, 22, 0.97)",
  borderColor: "rgba(143,92,177,0.35)",
  borderWidth: 1,
  padding: [12, 16] as [number, number],
  textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
  extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.5); border-radius: 12px;",
};

const userSignupsOption = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE,
    trigger: "axis",
    axisPointer: { type: "line", lineStyle: { color: "rgba(143,92,177,0.3)" } },
    formatter: (params: any[]) => {
      const p = params[0];
      return `<div style="min-width:130px">
        <b style="color:#f5f5f7;display:block;margin-bottom:6px">${p.axisValue}</b>
        <div style="display:flex;justify-content:space-between;gap:12px;color:#94a3b8">
          <span>تسجيلات جديدة</span>
          <b style="color:#a57ed8">${p.value.toLocaleString("ar-EG")} عميل</b>
        </div>
      </div>`;
    },
  },
  grid: { top: 25, right: 10, bottom: 20, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4", "الأسبوع 5", "الأسبوع 6"],
    axisLabel: { color: "#64748b", fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLabel: { color: "#64748b", fontSize: 10 },
    splitLine: { lineStyle: { color: "rgba(143,92,177,0.06)", type: "dashed" } },
    axisLine: { show: false },
    axisTick: { show: false },
  },
  series: [
    {
      name: "تسجيلات جديدة",
      type: "line",
      data: [15, 24, 30, 22, 45, 38],
      smooth: 0.45,
      showSymbol: false,
      emphasis: { showSymbol: true },
      lineStyle: { color: "#a57ed8", width: 3, shadowColor: "rgba(165,126,216,0.4)", shadowBlur: 10 },
      itemStyle: { color: "#a57ed8", borderColor: "#0d0916", borderWidth: 2 },
      areaStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(165,126,216,0.25)" }, { offset: 1, color: "rgba(165,126,216,0)" }] },
      },
    },
  ],
};

const userLoyaltyOption = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE,
    trigger: "item",
    formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 8px ${p.color}60"></span>
      <span style="color:#cbd5e1">${p.name}</span>
      <b style="color:#fff;margin-right:6px">${p.value.toLocaleString("ar-EG")}</b>
      <span style="color:#64748b;font-size:11px">(${p.percent}%)</span>
    </div>`,
  },
  legend: { show: false },
  series: [
    {
      type: "pie",
      radius: ["55%", "78%"],
      center: ["50%", "50%"],
      data: [
        { name: "المستوى الذهبي", value: 3, itemStyle: { color: "#f59e0b", borderColor: "#0d0916", borderWidth: 3 } },
        { name: "المستوى الفضي", value: 5, itemStyle: { color: "#3b82f6", borderColor: "#0d0916", borderWidth: 3 } },
        { name: "المستوى البرونزي", value: 4, itemStyle: { color: "#a57ed8", borderColor: "#0d0916", borderWidth: 3 } },
      ],
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 16, shadowColor: "rgba(143,92,177,0.3)" }, scale: true, scaleSize: 6 },
    },
  ],
};

interface UsersChartsProps {
  users?: any[];
}

export default function UsersCharts({ users = [] }: UsersChartsProps) {
  const signupBuckets = users.reduce((acc, user) => {
    const date = user.createdAt ? new Date(user.createdAt) : null;
    const label = date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      : "غير محدد";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const signupLabels = Object.keys(signupBuckets).sort();
  const loyaltyBuckets = users.reduce((acc, user) => {
    const level = user.loyaltyLevel ?? "غير محدد";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const loyaltyData = Object.entries(loyaltyBuckets).map(([level, value], index) => ({
    name: `Level ${level}`,
    value,
    itemStyle: { color: ["#f59e0b", "#3b82f6", "#a57ed8", "#10b981", "#ef4444"][index % 5], borderColor: "#0d0916", borderWidth: 3 },
  }));
  const dynamicSignupsOption = {
    ...userSignupsOption,
    xAxis: { ...userSignupsOption.xAxis, data: signupLabels },
    series: [{ ...userSignupsOption.series[0], data: signupLabels.map((label) => signupBuckets[label]) }],
  };
  const dynamicLoyaltyOption = {
    ...userLoyaltyOption,
    series: [{ ...userLoyaltyOption.series[0], data: loyaltyData }],
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2 p-5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-4 relative z-10">
          <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">معدل انضمام العملاء الأسبوعي</h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">عدد الحسابات الجديدة المسجلة أسبوعياً</p>
        </div>
        <div className="h-52 relative z-10">
          <ReactECharts option={dynamicSignupsOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
        </div>
      </Card>
      <Card className="p-5 bg-card/60 backdrop-blur-xl border-border/40 flex flex-col justify-between group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="mb-4 relative z-10">
          <h3 className="font-bold text-white text-sm tracking-tight">مستويات ولاء العملاء</h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">توزيع العملاء حسب الفئات (ذهبي، فضي، برونزي)</p>
        </div>
        <div className="h-32 relative z-10 flex items-center justify-center">
          <ReactECharts option={dynamicLoyaltyOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-2 relative z-10">
          {loyaltyData.slice(0, 3).map((item: any) => (
            <div key={item.name} className="flex flex-col items-center p-2 rounded-lg bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors">
              <span className="text-[9px] text-muted-foreground/80 mb-0.5">{item.name}</span>
              <span className="text-xs font-bold text-white tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
