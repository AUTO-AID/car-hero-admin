"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface OverviewGovChartProps {
  govData: any[] | undefined;
}

export function OverviewGovChart({ govData }: OverviewGovChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const rawGov = (govData ?? []) as any[];
  const govPalette = [
    "#a57ed8", "#6366f1", "#10b981", "#f59e0b", "#ef4444",
    "#3b82f6", "#ec4899", "#06b6d4", "#8b5cf6", "#14b8a6",
    "#f97316", "#84cc16", "#e11d48", "#0ea5e9"
  ];
  const govChartData = rawGov.map((g: any, i: number) => ({
    name: g._id || "غير محدد",
    value: g.count,
    color: govPalette[i % govPalette.length],
  }));

  const donutOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(13, 9, 22, 0.96)",
      borderColor: "rgba(143, 92, 177, 0.35)",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#cbd5e1", fontSize: 12, fontFamily: "IBM Plex Sans Arabic" },
      extraCssText: "box-shadow: 0 8px 32px rgba(0,0,0,0.6); border-radius: 12px;",
      formatter: (p: any) => `<div style="display:flex;align-items:center;gap:8px">
        <span style="width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 8px ${p.color}"></span>
        <span>${p.name}: <b style="color:#fff;margin-right:4px">${p.value}</b> <span style="color:#94a3b8;font-size:11px">(${p.percent}%)</span></span>
      </div>`,
    },
    legend: { show: false },
    series: [{
      type: "pie",
      radius: ["65%", "85%"],
      center: ["50%", "50%"],
      data: govChartData.map((d: any) => ({
        name: d.name, value: d.value,
        itemStyle: { color: d.color, borderColor: "#170f24", borderWidth: 3 },
      })),
      label: { show: false },
      labelLine: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 20, shadowColor: "rgba(143,92,177,0.35)", borderColor: "rgba(255,255,255,0.15)", borderWidth: 2 },
        scale: true, scaleSize: 6,
      },
    }],
  };
  const totalGov = govChartData.reduce((s: number, d: any) => s + d.value, 0);

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/40 shadow-xl shadow-black/20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="mb-6 relative z-10">
        <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
          <MapPin className="w-4 h-4 text-violet-400" />
          توزيع المحافظات
        </h3>
        <p className="text-[12px] text-muted-foreground mt-1">مزودو الخدمة حسب المحافظة — بيانات حقيقية</p>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative w-full flex justify-center h-[200px]">
          {govChartData.length > 0 ? (
            <ReactECharts option={donutOption} style={{ width: '100%', height: '100%' }} opts={{ renderer: "canvas" }} notMerge={true} lazyUpdate={true} />
          ) : isMounted ? (
            <div className="flex items-center justify-center w-full text-muted-foreground text-sm">جارٍ تحميل البيانات...</div>
          ) : null}
          {/* Center absolute text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground font-medium mb-0.5">الإجمالي</span>
            <span className="text-xl font-bold text-white tracking-tight tabular-nums">{totalGov}</span>
          </div>
        </div>
        
        <div className="w-full space-y-2 mt-4 grid grid-cols-2 gap-x-4 gap-y-2 max-h-[200px] overflow-y-auto">
          {govChartData.slice(0, 8).map((s: any) => (
            <div key={s.name} className="flex flex-col p-2.5 rounded-lg bg-secondary/30 border border-border/40 hover:border-border/80 transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
                <span className="text-[11px] font-medium text-muted-foreground/90 truncate">{s.name}</span>
              </div>
              <div className="flex items-baseline justify-between pl-1">
                <span className="text-sm font-bold text-white tabular-nums">{s.value}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                  {totalGov > 0 ? Math.round((s.value / totalGov) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
