"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, Edit, ReceiptText, Trash2 } from "lucide-react";
import { Service } from "@/domain/entities/service.types";

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  categoryMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }>;
}

export function ServicesList({
  services,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
  categoryMeta,
}: ServicesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-5 bg-card/60 border-border/40 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="w-10 h-5 rounded-full" />
            </div>
            <Skeleton className="h-5 w-32 mb-2 rounded" />
            <Skeleton className="h-4 w-20 mb-4 rounded" />
            <Skeleton className="h-16 w-full mb-4 rounded-xl" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="p-16 bg-card/60 border-border/40 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-bold text-white">لا توجد خدمات مطابقة</p>
        <p className="text-xs text-muted-foreground mt-1">غيّر البحث أو الفلاتر لعرض خدمات أخرى.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger">
      {services.map((service, i) => {
        const cat = categoryMeta[service.category] ?? categoryMeta.other;
        const Icon = cat.icon;
        const isEmergency = service.isEmergency ?? false;
        const serviceId = service._id || service.id || "";
        const effectivePrice = service.discountedPrice && service.discountedPrice > 0 ? service.discountedPrice : service.basePrice;

        return (
          <Card
            key={serviceId || i}
            className={`relative p-5 bg-card/60 backdrop-blur-xl border border-border/40 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group ${!service.isActive ? "opacity-60 grayscale-[0.3]" : ""}`}
            style={{ animationDelay: `${i * 35}ms` }}
          >
            {isEmergency && <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-t-xl" />}

            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl border ${cat.bg}`}>
                <Icon className={`w-6 h-6 ${cat.color}`} />
              </div>

              <div className="flex items-center gap-2">
                {isEmergency && (
                  <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] px-1.5 font-bold uppercase">
                    طارئ
                  </Badge>
                )}
                <Switch
                  checked={service.isActive}
                  onCheckedChange={(val) => onToggleActive(serviceId, val)}
                  className="data-[state=checked]:bg-emerald-500 shrink-0"
                />
              </div>
            </div>

            <h3 className="font-bold text-white text-sm mb-0.5 group-hover:text-primary transition-colors truncate" title={service.nameAr ?? service.name}>
              {service.nameAr ?? service.name}
            </h3>
            <p className="text-[10px] text-muted-foreground truncate mb-2">{service.name}</p>
            <Badge variant="outline" className={`text-[9.5px] px-2 py-0 border-transparent mb-4 ${cat.bg} ${cat.color} font-bold`}>
              {cat.label}
            </Badge>

            <div className="grid grid-cols-2 gap-2 mb-3 bg-secondary/20 p-3 rounded-xl border border-border/30">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">السعر</p>
                <p className="text-xs font-black text-white tabular-nums">
                  {effectivePrice.toLocaleString("ar-SA")}
                  <span className="text-[10px] font-normal text-muted-foreground/60 mr-1">ل.س</span>
                </p>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground mb-0.5">المدة</p>
                <p className="text-xs font-black text-white tabular-nums flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground/60" />
                  {service.estimatedDuration}
                  <span className="text-[10px] font-normal text-muted-foreground/60">دقيقة</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg border border-border/25 bg-background/30 px-2.5 py-2">
                <p className="text-[10px] text-muted-foreground">طلبات</p>
                <p className="text-xs font-black text-white tabular-nums">{Number(service.ordersCount || 0).toLocaleString("ar-SA")}</p>
              </div>
              <div className="rounded-lg border border-border/25 bg-background/30 px-2.5 py-2">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><ReceiptText className="w-3 h-3" /> إيراد</p>
                <p className="text-xs font-black text-primary tabular-nums">{Number(service.ordersRevenue || 0).toLocaleString("ar-SA")}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(service)}
                className="flex-1 h-8 text-xs border-border/40 hover:bg-secondary hover:border-primary/30 gap-1.5 transition-all font-bold">
                <Edit className="w-3.5 h-3.5 text-muted-foreground" /> تعديل
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(serviceId)}
                className="h-8 w-8 p-0 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
