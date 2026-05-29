"use client";

import { Activity, Filter, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LogsStatsProps {
  total: number;
  activeFiltersCount: number;
  isFetching: boolean;
  onRefresh: () => void;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "yyyy-MM-dd HH:mm", { locale: ar });
}

export default function LogsStats({
  total,
  activeFiltersCount,
  isFetching,
  onRefresh,
}: LogsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-border/40 bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">إجمالي السجلات</p>
            <p className="mt-1 text-2xl font-black text-white tabular-nums">{total}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </span>
        </div>
      </Card>

      <Card className="border-border/40 bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">الفلاتر النشطة</p>
            <p className="mt-1 text-2xl font-black text-white">
              {activeFiltersCount}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
            <Filter className="h-5 w-5 text-sky-300" />
          </span>
        </div>
      </Card>

      <Card className="border-border/40 bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">آخر تحديث</p>
            <p className="mt-1 text-sm font-bold text-white">{formatDate(new Date().toISOString())}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-2 border-border/40 bg-background">
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            تحديث
          </Button>
        </div>
      </Card>
    </div>
  );
}
