"use client";

import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OverviewCitiesTableProps {
  topCitiesData: any[] | undefined;
}

export function OverviewCitiesTable({ topCitiesData }: OverviewCitiesTableProps) {
  const rawCities = (topCitiesData ?? []) as any[];

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/40 shadow-xl shadow-black/20 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border/30">
        <div>
          <h3 className="font-bold text-white text-base tracking-tight">أعلى المدن نشاطاً</h3>
          <p className="text-[12px] text-muted-foreground mt-1">المحافظات والمدن الرئيسية</p>
        </div>
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2.5 py-1 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[10px] font-bold text-violet-400 tracking-wider tabular-nums">{rawCities.length} مدن</span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto max-h-[300px]">
        {rawCities.length > 0 ? rawCities.slice(0, 5).map((city: any, i: number) => {
          const maxCount = rawCities[0]?.count || 1;
          const pct = Math.round((city.count / maxCount) * 100);
          return (
            <div
              key={city._id || i}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/60 transition-all duration-200 cursor-pointer group border border-transparent hover:border-border/40"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {city._id || "غير محدد"}
                  </p>
                  <div className="w-20 h-1 rounded-full bg-secondary/60 mt-1">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-left shrink-0">
                <p className="text-xs font-bold text-white tabular-nums">{city.count} مزود</p>
              </div>
            </div>
          );
        }) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            جارٍ تحميل البيانات...
          </div>
        )}
      </div>
    </Card>
  );
}
