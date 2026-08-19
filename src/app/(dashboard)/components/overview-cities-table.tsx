"use client";

import { MapPin, ArrowLeft, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

interface OverviewCitiesTableProps {
  topCitiesData: any[] | undefined;
  isLoading?: boolean;
}

export function OverviewCitiesTable({ topCitiesData, isLoading }: OverviewCitiesTableProps) {
  const rawCities = (topCitiesData ?? []) as any[];

  return (
    <Card variant="feed" className="min-h-[400px]">
      <div className="flex items-center justify-between p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">أعلى المدن نشاطاً</h3>
            <p className="text-xs text-muted-foreground mt-1">المحافظات والمدن الرئيسية</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs font-bold text-warning tracking-wider tabular-nums">{rawCities.length} مدن</span>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-3 overflow-y-auto max-h-[300px]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-2 w-12 rounded" />
                </div>
              </div>
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          ))
        ) : rawCities.length > 0 ? (
          rawCities.slice(0, 5).map((city: any, i: number) => {
            const maxCount = rawCities[0]?.count || 1;
            return (
              <div
                key={city._id || i}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/60 transition-all duration-200 group border border-transparent hover:border-border/40"
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
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                        style={{ width: `${Math.max(2, (city.count / maxCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-end shrink-0">
                  <p className="text-xs font-bold text-white tabular-nums">{city.count} مزود</p>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="لا توجد بيانات مدن نشطة"
            description="لم يتم تسجيل أي مزودي خدمة حالياً في أي محافظة أو مدينة."
            icon={Building2}
            className="py-6 justify-center"
          />
        )}
      </div>
      
      <div className="p-6 pt-4 mt-auto border-t border-border/10 bg-secondary/5">
        <Link href="/providers-map" className="block w-full">
          <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-warning hover:bg-amber-400/10 h-8 rounded-lg gap-1.5 transition-colors group">
            عرض الخريطة والتفاصيل
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
