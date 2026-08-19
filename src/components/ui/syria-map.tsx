"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getProvidersByGovernorate } from "@/infrastructure/services/stats.service";
import { Map, MapPin, Users, Info } from "lucide-react";

const GOVERNORATE_NAMES: Record<string, { ar: string; en: string }> = {
  Damascus: { ar: "دمشق", en: "Damascus" },
  Aleppo: { ar: "حلب", en: "Aleppo" },
  Homs: { ar: "حمص", en: "Homs" },
  Hama: { ar: "حماة", en: "Hama" },
  Lattakia: { ar: "اللاذقية", en: "Lattakia" },
  Tartous: { ar: "طرطوس", en: "Tartous" },
  Idleb: { ar: "إدلب", en: "Idleb" },
  "Ar-Raqqa": { ar: "الرقة", en: "Ar-Raqqa" },
  "Deir-ez-Zor": { ar: "دير الزور", en: "Deir ez-Zor" },
  "Al-Hasakeh": { ar: "الحسكة", en: "Al-Hasakeh" },
  "Dar'a": { ar: "درعا", en: "Dar'a" },
  "As-Sweida": { ar: "السويداء", en: "As-Sweida" },
  Quneitra: { ar: "القنيطرة", en: "Quneitra" },
  "Rural Damascus": { ar: "ريف دمشق", en: "Rural Damascus" },
  "Rular Damascus": { ar: "ريف دمشق", en: "Rural Damascus" },
};

interface MapData {
  governorate: string;
  status: string;
  value: number;
}

interface SyriaMapProps {
  govCounts?: unknown;
}

export function SyriaMap({ govCounts: externalGovCounts }: SyriaMapProps = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedGov, setSelectedGov] = useState<MapData | null>(null);
  const [previewGov, setPreviewGov] = useState<MapData | null>(null);
  const shouldFetchGovernorates = !externalGovCounts;

  // Fetch governorate counts from real API data
  const { data: fetchedGovCounts, isLoading } = useQuery({
    queryKey: ["providers-by-governorate"],
    queryFn: getProvidersByGovernorate,
    retry: 1,
    enabled: shouldFetchGovernorates,
  });

  // Extract counts to send to the map
  const rawGovList = useMemo<any[]>(() => {
    const source = externalGovCounts ?? fetchedGovCounts;
    const value = (source as { data?: unknown[] })?.data ?? source ?? [];
    return Array.isArray(value) ? value : [];
  }, [externalGovCounts, fetchedGovCounts]);

  // Update map data inside iframe whenever API data is loaded
  useEffect(() => {
    if (iframeRef.current && rawGovList.length > 0) {
      const iframe = iframeRef.current;
      const sendData = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: "UPDATE_DATA",
              data: rawGovList,
            },
            "*"
          );
        }
      };

      // Send when iframe is loaded or immediately if already loaded
      const handleLoad = () => {
        sendData();
      };

      iframe.addEventListener("load", handleLoad);
      // Also send immediately in case it loaded before useEffect
      sendData();

      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [rawGovList]);

  // Handle click & hover messages from Leaflet map
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;

      if (event.data.type === "MAP_SELECT") {
        setSelectedGov(event.data.data);
        setPreviewGov(null);
      } else if (event.data.type === "MAP_HOVER") {
        setPreviewGov(event.data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const displayGov = previewGov || selectedGov;
  const govName = displayGov
    ? GOVERNORATE_NAMES[displayGov.governorate]?.ar || displayGov.governorate
    : "";
  const isActive = displayGov ? displayGov.value > 0 : false;

  return (
    <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/40 shadow-xl shadow-black/20 group relative overflow-hidden flex flex-col md:flex-row gap-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Info panel */}
      <div className="w-full md:w-[320px] shrink-0 flex flex-col justify-between relative z-10">
        <div>
          <div className="mb-6">
            <h3 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
              <Map className="w-5 h-5 text-warning" />
              الخريطة التفاعلية للمزودين
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              خريطة توضح توزيع مزودي الخدمة الفعليين عبر المحافظات السورية
            </p>
          </div>

          <div className="min-h-[220px] transition-all duration-300">
            {displayGov ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{govName}</h4>
                      <p className="text-xs text-muted-foreground uppercase font-mono">
                        {displayGov.governorate}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      isActive
                        ? "bg-emerald-500/10 text-success border-emerald-500/20"
                        : "bg-amber-500/10 text-warning border-amber-500/20"
                    }`}
                  >
                    {isActive ? "نشط" : "قريباً"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-center hover:border-border/80 transition-colors">
                    <span className="text-2xl font-bold text-white tabular-nums flex justify-center items-center gap-1.5">
                      <Users className="w-4 h-4 text-warning" />
                      {displayGov.value}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1.5 font-semibold">مزود خدمة</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-center hover:border-border/80 transition-colors">
                    <span className="text-2xl font-bold text-success tabular-nums">
                      {isActive ? "100%" : "0%"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1.5 font-semibold">نسبة التغطية</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground/80 leading-relaxed bg-secondary/10 p-3 rounded-lg border border-border/20">
                  {isActive
                    ? `تتوفر خدماتنا بالكامل في محافظة ${govName}، مع شبكة من ${displayGov.value} مزود خدمة فني معتمد جاهزون لتلقي الطلبات.`
                    : `نعمل حالياً على التوسع وبناء شراكات جديدة لإطلاق خدماتنا في محافظة ${govName} قريباً.`}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-[200px] border border-dashed border-border/40 rounded-2xl p-4 bg-secondary/5">
                <Info className="w-10 h-10 text-muted-foreground/60 mb-3" />
                <h4 className="font-semibold text-white text-sm">استكشف التغطية</h4>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[220px] leading-relaxed">
                  مرر مؤشر الفأرة أو اضغط على أي محافظة على الخريطة لعرض تفاصيل المزودين والتغطية
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-border/20 space-y-2 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>درجة كثافة المزودين:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs">منخفض</span>
              <div className="w-24 h-1.5 rounded-full bg-gradient-to-l from-amber-500 via-emerald-500 to-slate-800" />
              <span className="text-xs">كثيف</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map iframe */}
      <div className="flex-1 min-h-[380px] md:min-h-[480px] rounded-2xl overflow-hidden border border-border/30 bg-background/40 relative">
        {shouldFetchGovernorates && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-xs text-muted-foreground font-semibold">جارٍ تحميل خريطة سوريا...</span>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src="/maps/syria_choropleth.html"
          loading="lazy"
          className="w-full h-full border-none block"
          title="Syria Interactive Map"
        />
      </div>
    </Card>
  );
}
