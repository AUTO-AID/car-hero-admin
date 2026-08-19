"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, Lightbulb } from "lucide-react";
import { chartTooltip, chartAxisLabel, chartSplitLine, chartSeries, token } from "@/lib/chart-tokens";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* ─── Shared ECharts Theme ─── */
/* Chart values read the design tokens at render time. They were module-scope
   literals: a dark-only tooltip ground and a twelve-hue ramp that included the
   marketing site's purple — neither followed the theme nor the admin palette. */
const TOOLTIP_STYLE = () => chartTooltip();
const axLabel = () => ({ ...chartAxisLabel(), fontSize: 10 });
const splitLn = () => chartSplitLine();

/* ─── Chart Colors ─── */
const CHART_COLORS = () => chartSeries();

/* ─── Gradient Bar Helper ─── */
const makeGradientBar = (color1: string, color2 = color1 + "80") => ({
  type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [{ offset: 0, color: color1 }, { offset: 1, color: color2 }],
});

const EMPTY_WORKING_HOURS = {
  fridayOpen: 0,
  fridayClosed: 0,
  allDay24h: 0,
  dayStats: [] as Array<{ day: string; open: number; closed: number; avg: number }>,
};

const CITY_DATA: Array<{ name: string; count: number; pct?: number }> = [];
const WORKING_HOURS = EMPTY_WORKING_HOURS;
const JSON_FIELDS: Array<{ field: string; nonNull: number; parsed: number; failed: number; avgItems: number }> = [];
const INSIGHTS: Array<{ priority: string; color?: string; text: string }> = [];
const totalProv = 0;
const emergencyProv = 0;
const normalProv = 0;
const verifiedProv = 0;
const unverifiedProv = 0;

interface ProvidersStatsProps {
  summary?: any;
  isLoading?: boolean;
}

// City chart
const cityChart = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE(),
    trigger: "axis",
    axisPointer: { type: "shadow", shadowStyle: { color: "rgba(143,92,177,0.04)" } },
    formatter: (params: any[]) => {
      const p = params[0];
      return `<div style="display:flex; flex-direction:column; gap:6px;">
        <div style="font-weight:700; color:${token("--foreground")}; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:6px; margin-bottom:4px;">${p.axisValue}</div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:20px;">
          <span style="display:flex; align-items:center; gap:6px; color:${token("--muted-foreground")}">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${token("--success")}; box-shadow:0 0 8px ${token("--success", 0.38)}"></span>مزودو الخدمة
          </span>
          <b style="color:${token("--success")}; font-variant-numeric:tabular-nums">${p.value.toLocaleString("ar-EG")} مزود</b>
        </div>
      </div>`;
    },
  },
  grid: { top: 10, right: 45, bottom: 45, left: 10, containLabel: true },
  xAxis: { type: "value", axisLabel: axLabel(), splitLine: splitLn(), axisLine: { show: false }, axisTick: { show: false } },
  yAxis: {
    type: "category",
    data: CITY_DATA.map(d => d.name).reverse(),
    axisLabel: { ...axLabel, fontSize: 11 },
    axisLine: { show: false }, axisTick: { show: false },
  },
  dataZoom: [
    {
      type: "slider",
      show: CITY_DATA.length > 6,
      orient: "vertical",
      start: 30,
      end: 100,
      width: 18,
      right: 10,
      borderColor: "rgba(143,92,177,0.06)",
      backgroundColor: "rgba(255,255,255,0.01)",
      fillerColor: "rgba(143,92,177,0.1)",
      textStyle: { color: token("--muted-foreground"), fontSize: 9, fontFamily: "IBM Plex Sans Arabic" },
      handleSize: "75%",
      handleStyle: { color: token("--primary"), borderWidth: 0, shadowBlur: 4, shadowColor: "rgba(0,0,0,0.5)" },
    }
  ],
  series: [{
    type: "bar",
    data: CITY_DATA.map((d, i) => ({
      value: d.count,
      itemStyle: {
        color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: CHART_COLORS()[i % CHART_COLORS().length] + "40" },
            { offset: 1, color: CHART_COLORS()[i % CHART_COLORS().length] },
          ],
        },
        borderRadius: [0, 6, 6, 0],
      },
    })).reverse(),
    barWidth: "48%",
    barMaxWidth: 24,
    label: { show: true, position: "right", color: token("--muted-foreground"), fontSize: 10, fontWeight: "bold", offset: [6, 0] },
    emphasis: { itemStyle: { shadowBlur: 16, shadowColor: "rgba(0,0,0,0.4)" } },
  }],
};

// Emergency Donut
const emergencyDonut = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE(),
    trigger: "item",
    formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 8px ${p.color}60"></span>
      <span style="color:${token("--foreground")}">${p.name}</span>
      <b style="color:#fff;margin-right:6px">${p.value.toLocaleString("ar-EG")}</b>
      <span style="color:${token("--muted-foreground")};font-size:11px">(${p.percent}%)</span>
    </div>`,
  },
  legend: { show: false },
  series: [{
    type: "pie",
    radius: ["55%", "80%"],
    center: ["50%", "50%"],
    data: [
      { name: "طوارئ", value: emergencyProv, itemStyle: { color: token("--danger"), borderColor: token("--card"), borderWidth: 3 } },
      { name: "عادي", value: normalProv, itemStyle: { color: token("--info"), borderColor: token("--card"), borderWidth: 3 } },
    ],
    label: { show: false },
    emphasis: { scale: true, scaleSize: 6, itemStyle: { shadowBlur: 20, shadowColor: "rgba(143,92,177,0.3)" } },
  }],
};

// Verified Donut
const verifiedDonut = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE(),
    trigger: "item",
    formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px">
      <span style="width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 8px ${p.color}60"></span>
      <span style="color:${token("--foreground")}">${p.name}</span>
      <b style="color:#fff;margin-right:6px">${p.value.toLocaleString("ar-EG")}</b>
      <span style="color:${token("--muted-foreground")};font-size:11px">(${p.percent}%)</span>
    </div>`,
  },
  legend: { show: false },
  series: [{
    type: "pie",
    radius: ["55%", "80%"],
    center: ["50%", "50%"],
    data: [
      { name: "موثق", value: verifiedProv, itemStyle: { color: token("--success"), borderColor: token("--card"), borderWidth: 3 } },
      { name: "غير موثق", value: unverifiedProv, itemStyle: { color: token("--muted-foreground"), borderColor: token("--card"), borderWidth: 3 } },
    ],
    label: { show: false },
    emphasis: { scale: true, scaleSize: 6, itemStyle: { shadowBlur: 20, shadowColor: "rgba(143,92,177,0.3)" } },
  }],
};

// Working days
const workingDaysChart = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE(),
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: any[]) => {
      const [open, closed] = params;
      const total = (open?.value || 0) + (closed?.value || 0);
      return `<div style="min-width:140px">
        <b style="color:${token("--foreground")};display:block;margin-bottom:8px">${open?.axisValue}</b>
        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px">
          <span style="color:${token("--muted-foreground")}"><span style="width:8px;height:8px;border-radius:2px;background:${token("--success")};display:inline-block;margin-left:4px"></span>مفتوح</span>
          <b style="color:${token("--success")}">${(open?.value || 0).toLocaleString("ar-EG")}</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px">
          <span style="color:${token("--muted-foreground")}"><span style="width:8px;height:8px;border-radius:2px;background:${token("--danger")};display:inline-block;margin-left:4px"></span>مغلق</span>
          <b style="color:${token("--danger")}">${(closed?.value || 0).toLocaleString("ar-EG")}</b>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;margin-top:6px">
          <span style="color:${token("--muted-foreground")}">المجموع</span>
          <b style="color:${token("--foreground")}">${total.toLocaleString("ar-EG")}</b>
        </div>
      </div>`;
    },
  },
  legend: {
    data: ["مفتوح", "مغلق"],
    textStyle: { color: token("--muted-foreground"), fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    top: 0, icon: "roundRect", itemWidth: 10, itemHeight: 6,
  },
  grid: { top: 30, right: 10, bottom: 20, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: WORKING_HOURS.dayStats.map(d => d.day),
    axisLabel: axLabel(),
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: { type: "value", axisLabel: axLabel(), splitLine: splitLn(), axisLine: { show: false }, axisTick: { show: false } },
  series: [
    {
      name: "مفتوح",
      type: "bar",
      stack: "total",
      data: WORKING_HOURS.dayStats.map(d => d.open),
      itemStyle: {
        color: makeGradientBar(token("--success"), "rgba(16,185,129,0.5)"),
      },
      barWidth: "48%",
      barMaxWidth: 35,
    },
    {
      name: "مغلق",
      type: "bar",
      stack: "total",
      data: WORKING_HOURS.dayStats.map(d => d.closed),
      itemStyle: {
        color: makeGradientBar(token("--danger"), "rgba(239,68,68,0.5)"),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: "48%",
      barMaxWidth: 35,
    },
  ],
};

// Avg hours
const avgHoursChart = {
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE(),
    trigger: "axis",
    axisPointer: { type: "shadow" },
    formatter: (params: any[]) => {
      const p = params[0];
      return `<div><b style="color:${token("--foreground")}">${p.axisValue}</b><br/>
        <span style="color:${token("--info")}">● متوسط ساعات العمل: </span><b style="color:${token("--info")}">${p.value} ساعة</b></div>`;
    },
  },
  grid: { top: 10, right: 10, bottom: 20, left: 10, containLabel: true },
  xAxis: {
    type: "category",
    data: WORKING_HOURS.dayStats.map(d => d.day),
    axisLabel: axLabel(),
    axisLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    max: 18,
    axisLabel: { ...axLabel, formatter: (v: number) => `${v}h` },
    splitLine: splitLn(),
    axisLine: { show: false }, axisTick: { show: false },
  },
  series: [{
    type: "bar",
    data: WORKING_HOURS.dayStats.map((d, i) => ({
      value: d.avg,
      itemStyle: {
        color: makeGradientBar(CHART_COLORS()[i % CHART_COLORS().length]),
        borderRadius: [6, 6, 0, 0],
      },
    })),
    barWidth: "48%",
    barMaxWidth: 35,
    label: { show: true, position: "top", color: token("--muted-foreground"), fontSize: 10, fontWeight: "bold", formatter: "{c}h" },
    emphasis: { itemStyle: { shadowBlur: 16, shadowColor: "rgba(0,0,0,0.4)" } },
  }],
};

// Radar
const performanceRadarOption = () => ({
  backgroundColor: "transparent",
  tooltip: {
    ...TOOLTIP_STYLE(),
    trigger: "item",
  },
  radar: {
    indicator: [
      { name: "التقييم", max: 5 },
      { name: "عدد الطلبات", max: 500 },
      { name: "سرعة الاستجابة", max: 10 },
      { name: "التوثيق", max: 100 },
      { name: "التنوع الخدمي", max: 8 },
      { name: "الانتشار الجغرافي", max: 14 },
    ],
    center: ["50%", "55%"],
    radius: "62%",
    axisName: { color: token("--muted-foreground"), fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    splitLine: { lineStyle: { color: "rgba(143,92,177,0.12)", type: "dashed" } },
    splitArea: { areaStyle: { color: ["rgba(143,92,177,0.02)", "rgba(143,92,177,0.05)"] } },
    axisLine: { lineStyle: { color: "rgba(143,92,177,0.15)" } },
  },
  series: [
    {
      name: "المزودون المتميزون",
      type: "radar",
      data: [{
        name: "متميزون",
        value: [4.8, 340, 9.2, 95, 7, 12],
        symbol: "circle", symbolSize: 5,
        itemStyle: { color: token("--primary") },
        lineStyle: { color: token("--primary"), width: 2.5, shadowColor: "rgba(165,126,216,0.5)", shadowBlur: 8 },
        areaStyle: {
          color: { type: "radial", x: 0.5, y: 0.5, r: 0.5,
            colorStops: [{ offset: 0, color: "rgba(165,126,216,0.4)" }, { offset: 1, color: "rgba(165,126,216,0.05)" }] },
        },
      }],
    },
    {
      name: "المزودون العاديون",
      type: "radar",
      data: [{
        name: "عاديون",
        value: [3.5, 95, 6.5, 65, 3, 5],
        symbol: "circle", symbolSize: 5,
        itemStyle: { color: token("--success") },
        lineStyle: { color: token("--success"), width: 2, shadowColor: "rgba(16,185,129,0.4)", shadowBlur: 6 },
        areaStyle: {
          color: { type: "radial", x: 0.5, y: 0.5, r: 0.5,
            colorStops: [{ offset: 0, color: "rgba(16,185,129,0.25)" }, { offset: 1, color: "rgba(16,185,129,0.03)" }] },
        },
      }],
    },
  ],
});

// Gauge
const approvalGaugeOption = () => ({
  backgroundColor: "transparent",
  tooltip: { ...TOOLTIP_STYLE(), trigger: "item" },
  series: [{
    type: "gauge",
    center: ["50%", "60%"],
    radius: "80%",
    startAngle: 200,
    endAngle: -20,
    min: 0, max: 100,
    progress: {
      show: true,
      roundCap: true,
      width: 14,
      itemStyle: {
        color: {
          type: "linear", x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: token("--primary") }, { offset: 1, color: token("--primary") }],
        },
      },
    },
    pointer: { show: false },
    axisLine: { roundCap: true, lineStyle: { width: 14, color: [[1, "rgba(255,255,255,0.05)"]] } },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    data: [{ value: 70, name: "نسبة الاعتماد" }],
    title: { offsetCenter: [0, "25%"], color: token("--muted-foreground"), fontSize: 10, fontFamily: "IBM Plex Sans Arabic" },
    detail: {
      valueAnimation: true,
      offsetCenter: [0, "-5%"],
      fontSize: 28,
      fontWeight: "bold",
      formatter: "{value}%",
      color: token("--primary"),
      fontFamily: "Inter",
    },
  }],
});

export function ProvidersStats({ summary, isLoading = false }: ProvidersStatsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cityData = summary?.CITY_DATA ?? [];
  const workingHours = summary?.WORKING_HOURS ?? EMPTY_WORKING_HOURS;
  const jsonFields = summary?.JSON_FIELDS ?? [];
  const insights = summary?.INSIGHTS ?? [];
  const totals = summary?.SUMMARY ?? {};
  const totalProviders = totals.totalProviders ?? cityData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
  const emergencyProviders = totals.emergencyProviders ?? 0;
  const normalProviders = Math.max(totalProviders - emergencyProviders, 0);
  const verifiedProviders = totals.verifiedProviders ?? 0;
  const unverifiedProviders = Math.max(totalProviders - verifiedProviders, 0);
  const approvedProviders = totals.approvedProviders ?? verifiedProviders;

  const cityChartOption = {
    ...cityChart,
    yAxis: { ...cityChart.yAxis, data: cityData.map((d: any) => d.name).reverse() },
    dataZoom: [{ ...cityChart.dataZoom[0], show: cityData.length > 6 }],
    series: [{
      ...cityChart.series[0],
      data: cityData.map((d: any, i: number) => ({
        value: d.count,
        itemStyle: {
          color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: CHART_COLORS()[i % CHART_COLORS().length] + "40" },
              { offset: 1, color: CHART_COLORS()[i % CHART_COLORS().length] },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })).reverse(),
    }],
  };

  const emergencyDonutOption = {
    ...emergencyDonut,
    series: [{
      ...emergencyDonut.series[0],
      data: [
        { name: "طوارئ", value: emergencyProviders, itemStyle: { color: token("--danger"), borderColor: token("--card"), borderWidth: 3 } },
        { name: "عادي", value: normalProviders, itemStyle: { color: token("--info"), borderColor: token("--card"), borderWidth: 3 } },
      ],
    }],
  };

  const verifiedDonutOption = {
    ...verifiedDonut,
    series: [{
      ...verifiedDonut.series[0],
      data: [
        { name: "موثق", value: verifiedProviders, itemStyle: { color: token("--success"), borderColor: token("--card"), borderWidth: 3 } },
        { name: "غير موثق", value: unverifiedProviders, itemStyle: { color: token("--muted-foreground"), borderColor: token("--card"), borderWidth: 3 } },
      ],
    }],
  };

  const workingDaysOption = {
    ...workingDaysChart,
    xAxis: { ...workingDaysChart.xAxis, data: workingHours.dayStats.map((d: any) => d.day) },
    series: [
      { ...workingDaysChart.series[0], data: workingHours.dayStats.map((d: any) => d.open) },
      { ...workingDaysChart.series[1], data: workingHours.dayStats.map((d: any) => d.closed) },
    ],
  };

  const avgHoursOption = {
    ...avgHoursChart,
    xAxis: { ...avgHoursChart.xAxis, data: workingHours.dayStats.map((d: any) => d.day) },
    series: [{
      ...avgHoursChart.series[0],
      data: workingHours.dayStats.map((d: any, i: number) => ({
        value: d.avg,
        itemStyle: {
          color: makeGradientBar(CHART_COLORS()[i % CHART_COLORS().length]),
          borderRadius: [6, 6, 0, 0],
        },
      })),
    }],
  };

  const approvalGauge = {
    ...approvalGaugeOption(),
    series: [{
      ...approvalGaugeOption().series[0],
      data: [{ value: totalProviders > 0 ? Math.round((approvedProviders / totalProviders) * 100) : 0, name: "نسبة الاعتماد" }],
    }],
  };

  const performanceRadar = {
    ...performanceRadarOption(),
    series: [{
      ...performanceRadarOption().series[0],
      data: [{
        ...performanceRadarOption().series[0].data[0],
        value: [
          totals.averageRating ?? 0,
          totals.averageOrdersPerProvider ?? 0,
          totals.averageResponseTimeHours ?? 0,
          totalProviders > 0 ? Math.round((verifiedProviders / totalProviders) * 100) : 0,
          totals.categoriesCount ?? 0,
          totals.citiesCount ?? 0,
        ],
      }],
    }],
  };

  if (isLoading) {
    return <Card className="p-6 bg-card border-border/40 text-sm text-muted-foreground">جاري تحميل تحليلات المزودين من الخادم...</Card>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Section 1: Geographic Distribution & General Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-semibold text-white text-sm tracking-tight">المزودين حسب المدينة</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{cityData.length.toLocaleString("ar-EG")} مدينة مسجلة — بيانات مباشرة</p>
          </div>
          <div className="relative z-10">
            {isMounted && <ReactECharts option={cityChartOption} style={{ height: 320 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="mb-4 relative z-10">
              <h3 className="font-semibold text-white text-sm tracking-tight">توزيع مزودي الطوارئ</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Donut — تأثيرات ظل</p>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              {isMounted && <ReactECharts option={emergencyDonutOption} style={{ height: 180 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: token("--danger"), boxShadow: `0 0 6px ${token("--danger", 0.38)}` }} />
                  <span className="text-xs text-muted-foreground/70">طوارئ</span>
                  <span className="text-xs font-bold text-white tabular-nums">{emergencyProviders.toLocaleString("ar-EG")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: token("--info"), boxShadow: `0 0 6px ${token("--info", 0.38)}` }} />
                  <span className="text-xs text-muted-foreground/70">عادي</span>
                  <span className="text-xs font-bold text-white tabular-nums">{normalProviders.toLocaleString("ar-EG")}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="mb-4 relative z-10">
              <h3 className="font-semibold text-white text-sm tracking-tight">حالة التوثيق</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Donut — نسبة الموثقين</p>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              {isMounted && <ReactECharts option={verifiedDonutOption} style={{ height: 180 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: token("--success"), boxShadow: `0 0 6px ${token("--success", 0.38)}` }} />
                  <span className="text-xs text-muted-foreground/70">موثق</span>
                  <span className="text-xs font-bold text-white tabular-nums">{verifiedProviders.toLocaleString("ar-EG")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: token("--muted-foreground"), boxShadow: `0 0 6px ${token("--muted-foreground", 0.38)}` }} />
                  <span className="text-xs text-muted-foreground/70">غير موثق</span>
                  <span className="text-xs font-bold text-white tabular-nums">{unverifiedProviders.toLocaleString("ar-EG")}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 2: Detailed Performance & Approval */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-semibold text-white text-sm tracking-tight">مؤشرات أداء المزودين</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">متوسطات فعلية محسوبة من قاعدة البيانات</p>
          </div>
          <div className="relative z-10">
            {isMounted && <ReactECharts option={performanceRadar} style={{ height: 260 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
          </div>
        </Card>

        <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="mb-4 relative z-10">
            <h3 className="font-semibold text-white text-sm tracking-tight">معدل اعتماد المزودين</h3>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Gauge Chart — نسبة الاعتماد</p>
          </div>
          <div className="relative z-10">
            {isMounted && <ReactECharts option={approvalGauge} style={{ height: 260 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
          </div>
        </Card>
      </div>

      {/* Section 3: Working Hours */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">ساعات وأوقات العمل</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4 bg-card/60 border-border/40 flex items-center gap-6 hover:border-border/70 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/30 bg-emerald-500/10">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-success tabular-nums">{workingHours.fridayOpen.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">مفتوح الجمعة</p>
            </div>
          </Card>

          <Card className="p-4 bg-card/60 border-border/40 flex items-center gap-6 hover:border-border/70 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-rose-500/30 bg-rose-500/10">
              <Clock className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-xl font-bold text-danger tabular-nums">{workingHours.fridayClosed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">مغلق الجمعة</p>
            </div>
          </Card>

          <Card className="p-4 bg-card/60 border-border/40 flex items-center gap-6 hover:border-border/70 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/30 bg-blue-500/10">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xl font-bold text-info tabular-nums">{workingHours.allDay24h.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">24 ساعة طوال الأسبوع</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="mb-4 relative z-10">
              <h3 className="font-semibold text-white text-sm tracking-tight">مفتوح مقابل مغلق حسب اليوم</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Stacked Bar — محسّن بتدرجات</p>
            </div>
            <div className="relative z-10">
              {isMounted && <ReactECharts option={workingDaysOption} style={{ height: 280 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
            </div>
          </Card>

          <Card className="p-6 bg-card/70 backdrop-blur-xl border border-border/40 hover:border-border/70 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="mb-4 relative z-10">
              <h3 className="font-semibold text-white text-sm tracking-tight">متوسط ساعات العمل اليومية</h3>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Bar — تدرج لوني بالساعات</p>
            </div>
            <div className="relative z-10">
              {isMounted && <ReactECharts option={avgHoursOption} style={{ height: 280 }} opts={{ renderer: "canvas" }} notMerge lazyUpdate />}
            </div>
          </Card>
        </div>
      </div>

      {/* Section 4: Data Quality & Fields Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">تحليل جودة حقول البيانات</h2>
        </div>
        
        <Card className="p-6 bg-card border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {jsonFields.map((f: any) => (
              <div key={f.field} className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30 hover:border-border/60">
                <span className="text-xs text-info font-mono">{f.field}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${f.failed > 0 ? "text-warning" : "text-success"}`}>
                    {f.parsed}/{f.nonNull}
                  </span>
                  <span className="text-xs text-muted-foreground/50 font-mono">avg:{f.avgItems}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Section 5: Analytical Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">التوصيات والملاحظات التحليلية</h2>
        </div>
        
        <Card className="p-6 bg-card border-border/40">
          <div className="space-y-2">
            {insights.map((ins: any, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2.5 px-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all border border-transparent hover:border-border/30">
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                  ins.priority === "HIGH" ? "bg-red-500/15 text-danger border border-red-500/20" :
                  ins.priority === "MED" ? "bg-amber-500/15 text-warning border border-amber-500/20" :
                  "bg-emerald-500/15 text-success border border-emerald-500/20"
                }`}>
                  {ins.priority}
                </span>
                <p className="text-sm text-foreground/80">{ins.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
