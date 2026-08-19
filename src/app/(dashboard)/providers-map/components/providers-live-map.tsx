"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers3, LocateFixed, Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import type { ProviderMapPoint } from "@/domain/entities/provider.types";
import { cn } from "@/lib/utils";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletLayerGroup = import("leaflet").LayerGroup;

const SYRIA_CENTER: [number, number] = [35.05, 38.3];
const SERVICE_AREA_BOUNDS = {
  minLng: 32,
  maxLng: 43.5,
  minLat: 31,
  maxLat: 38.5,
};

function isOperational(provider: ProviderMapPoint) {
  return provider.isActive !== false && provider.isApproved === true;
}

function isEmergency(provider: ProviderMapPoint) {
  return provider.emergency247 === true || provider.is_emergency === true;
}

function providerTone(provider: ProviderMapPoint) {
  if (!isOperational(provider)) return "inactive";
  if (isEmergency(provider)) return "emergency";
  if (provider.status === "online") return "online";
  if (provider.status === "busy") return "busy";
  return "approved";
}

function providerLabel(provider: ProviderMapPoint) {
  return provider.businessName || provider.ownerName || provider.phone || "مزود خدمة";
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidLngLat(lng: unknown, lat: unknown) {
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= SERVICE_AREA_BOUNDS.minLng &&
    lng <= SERVICE_AREA_BOUNDS.maxLng &&
    lat >= SERVICE_AREA_BOUNDS.minLat &&
    lat <= SERVICE_AREA_BOUNDS.maxLat
  );
}

function markerHtml(provider: ProviderMapPoint, selected: boolean) {
  const tone = providerTone(provider);
  const emergency = isEmergency(provider) ? '<span class="provider-map-pin-flash"></span>' : "";
  return `<button class="provider-map-pin provider-map-pin-${tone} ${selected ? "provider-map-pin-selected" : ""}" aria-label="${escapeHtml(providerLabel(provider))}">${emergency}<span></span></button>`;
}

function clusterHtml(count: number) {
  const size = count > 99 ? "lg" : count > 24 ? "md" : "sm";
  return `<button class="provider-map-cluster provider-map-cluster-${size}" aria-label="${count} مزود"><span>${count}</span></button>`;
}

function tooltipHtml(provider: ProviderMapPoint) {
  const rating = Number(provider.averageRating || 0).toFixed(1);
  const orders = Number(provider.totalOrders || 0).toLocaleString("ar-SY");
  const city = [provider.governorate, provider.city].filter(Boolean).join(" - ");
  return `
    <div class="provider-map-tooltip" dir="rtl">
      <strong>${escapeHtml(providerLabel(provider))}</strong>
      <span>${escapeHtml(city || "موقع غير محدد")}</span>
      <small>${escapeHtml(rating)} تقييم | ${escapeHtml(orders)} طلب</small>
    </div>
  `;
}

interface ProvidersLiveMapProps {
  providers: ProviderMapPoint[];
  selectedProvider?: ProviderMapPoint | null;
  onSelectProvider: (provider: ProviderMapPoint) => void;
  children?: ReactNode;
}

export function ProvidersLiveMap({
  providers,
  selectedProvider,
  onSelectProvider,
  children,
}: ProvidersLiveMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletLayerGroup | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const selectRef = useRef(onSelectProvider);
  const fittedSignatureRef = useRef("");
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const selectedId = selectedProvider?._id;

  useEffect(() => {
    selectRef.current = onSelectProvider;
  }, [onSelectProvider]);

  const validProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const coordinates = provider.location?.coordinates;
        return (
          provider.location?.type === "Point" &&
          Array.isArray(coordinates) &&
          isValidLngLat(coordinates[0], coordinates[1])
        );
      }),
    [providers],
  );

  const providersSignature = useMemo(
    () =>
      validProviders
        .map((provider) => {
          const [lng, lat] = provider.location.coordinates;
          return `${provider._id}:${lng}:${lat}`;
        })
        .join("|"),
    [validProviders],
  );

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!mapElementRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (!mounted || !mapElementRef.current) return;

      leafletRef.current = L;
      const map = L.map(mapElementRef.current, {
        center: SYRIA_CENTER,
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        scrollWheelZoom: "center",
        touchZoom: "center",
        doubleClickZoom: "center",
        wheelPxPerZoomLevel: 96,
        wheelDebounceTime: 40,
        zoomControl: false,
        attributionControl: false,
        bounceAtZoomLimits: false,
        easeLinearity: 0.22,
        inertia: true,
        inertiaDeceleration: 3200,
        inertiaMaxSpeed: 1200,
        keyboardPanDelta: 96,
        preferCanvas: true,
        maxBounds: [
          [30.4, 31.2],
          [39.2, 44.4],
        ],
        maxBoundsViscosity: 0.16,
      });

      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
        .addTo(map);

      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        crossOrigin: true,
      });
      tileLayer.on("tileload", () => setTileError(false));
      tileLayer.on("tileerror", () => setTileError(true));
      tileLayer.addTo(map);

      const markers = L.layerGroup().addTo(map);
      mapRef.current = map;
      markersRef.current = markers;
      setMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    initMap();

    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !markers || !L) return;
    const leafletMap = map;
    const markerLayer = markers;
    const Leaflet = L;

    function renderMarkers() {
      markerLayer.clearLayers();
      const zoom = leafletMap.getZoom();
      const cellSize = clusterEnabled ? (zoom < 8 ? 108 : zoom < 10 ? 78 : zoom < 12 ? 50 : 0) : 0;
      const groups = new Map<string, ProviderMapPoint[]>();

      for (const provider of validProviders) {
        const [lng, lat] = provider.location.coordinates;
        if (!cellSize) {
          groups.set(provider._id, [provider]);
          continue;
        }
        const point = leafletMap.project([lat, lng], zoom);
        const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
        const group = groups.get(key) ?? [];
        group.push(provider);
        groups.set(key, group);
      }

      groups.forEach((group) => {
        if (group.length > 1 && cellSize) {
          const center = group.reduce(
            (acc, provider) => {
              acc.lat += provider.location.coordinates[1];
              acc.lng += provider.location.coordinates[0];
              return acc;
            },
            { lat: 0, lng: 0 },
          );
          center.lat /= group.length;
          center.lng /= group.length;

          const cluster = Leaflet.marker([center.lat, center.lng], {
            icon: Leaflet.divIcon({
              className: "provider-map-cluster-host",
              html: clusterHtml(group.length),
              iconSize: [46, 46],
              iconAnchor: [23, 23],
            }),
          });

          cluster.on("click", () => {
            const bounds = Leaflet.latLngBounds(group.map((provider) => [
              provider.location.coordinates[1],
              provider.location.coordinates[0],
            ]));
            leafletMap.stop();
            leafletMap.flyToBounds(bounds, {
              paddingTopLeft: [selectedProvider ? 430 : 88, 88],
              paddingBottomRight: [88, 88],
              maxZoom: Math.min(Math.max(zoom + 1.5, 10), 14),
              duration: 0.42,
            });
          });

          cluster.addTo(markerLayer);
          return;
        }

        const provider = group[0];
        const [lng, lat] = provider.location.coordinates;
        const marker = Leaflet.marker([lat, lng], {
          icon: Leaflet.divIcon({
            className: "provider-map-pin-host",
            html: markerHtml(provider, provider._id === selectedId),
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }),
          title: providerLabel(provider),
        });

        marker.bindTooltip(tooltipHtml(provider), {
          direction: "top",
          offset: [0, -15],
          opacity: 1,
          className: "provider-map-tooltip-host",
        });
        marker.on("click", () => selectRef.current(provider));
        marker.addTo(markerLayer);
      });
    }

    renderMarkers();
    leafletMap.on("zoomend moveend", renderMarkers);

    if (validProviders.length > 0 && fittedSignatureRef.current !== providersSignature) {
      const bounds = Leaflet.latLngBounds(validProviders.map((provider) => [
        provider.location.coordinates[1],
        provider.location.coordinates[0],
      ]));
      if (bounds.isValid()) {
        leafletMap.stop();
        leafletMap.fitBounds(bounds, { animate: true, duration: 0.45, padding: [56, 56], maxZoom: 9 });
        fittedSignatureRef.current = providersSignature;
      }
    } else if (validProviders.length === 0) {
      fittedSignatureRef.current = "";
    }

    return () => {
      leafletMap.off("zoomend moveend", renderMarkers);
    };
  }, [clusterEnabled, mapReady, providersSignature, selectedId, validProviders]);

  useEffect(() => {
    if (!mapReady || !mapElementRef.current || !mapRef.current) return;

    const map = mapRef.current;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapElementRef.current);

    return () => resizeObserver.disconnect();
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !selectedProvider?.location?.coordinates) return;
    const [lng, lat] = selectedProvider.location.coordinates;
    const point = L.latLng(lat, lng);
    const paddedBounds = map.getBounds().pad(-0.18);

    map.stop();
    if (paddedBounds.contains(point)) {
      map.panInside(point, {
        animate: true,
        duration: 0.32,
        paddingTopLeft: [420, 92],
        paddingBottomRight: [92, 92],
      });
      return;
    }

    map.flyTo(point, Math.max(map.getZoom(), 12), { duration: 0.38, easeLinearity: 0.22 });
  }, [selectedProvider]);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
      window.setTimeout(() => mapRef.current?.invalidateSize(), 80);
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;

    if (document.fullscreenElement === shell) {
      await document.exitFullscreen();
    } else {
      await shell.requestFullscreen();
    }
  };

  const fitToProviders = useCallback(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || validProviders.length === 0) return;

    const bounds = L.latLngBounds(validProviders.map((provider) => [
      provider.location.coordinates[1],
      provider.location.coordinates[0],
    ]));

    if (bounds.isValid()) {
      map.stop();
      map.flyToBounds(bounds, { padding: [68, 68], maxZoom: 9.5, duration: 0.5 });
    }
  }, [validProviders]);

  const zoomBy = (delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.stop();
    map.setZoomAround(map.getCenter(), map.getZoom() + delta, { animate: true });
  };

  return (
    <div ref={shellRef} className="provider-map-shell relative h-full min-h-[620px] overflow-hidden rounded-2xl border border-border/45 bg-background">
      <div ref={mapElementRef} className="h-full min-h-[620px] w-full" />
      <div className="absolute start-4 top-4 z-[505] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => zoomBy(0.5)}
          className="provider-map-tool-button"
          aria-label="تكبير"
          data-tooltip="تكبير الخريطة"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-0.5)}
          className="provider-map-tool-button"
          aria-label="تصغير"
          data-tooltip="تصغير الخريطة"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={fitToProviders}
          className="provider-map-tool-button"
          aria-label="إظهار كل النتائج"
          data-tooltip="إظهار كل المزودين"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setClusterEnabled((value) => !value)}
          className={cn("provider-map-tool-button", !clusterEnabled && "provider-map-tool-button-muted")}
          aria-label={clusterEnabled ? "إيقاف التجميع" : "تشغيل التجميع"}
          data-tooltip={clusterEnabled ? "إيقاف التجميع" : "تشغيل التجميع"}
        >
          <Layers3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="provider-map-tool-button"
          aria-label={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
          data-tooltip={isFullscreen ? "تصغير العرض" : "ملء الشاشة"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
      {tileError && (
        <div className="pointer-events-none absolute end-4 top-4 z-[505] max-w-sm rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur">
          تعذر تحميل طبقة الخريطة، تأكد من الإنترنت أو أعد المحاولة.
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/35 to-transparent" />
      {children}
      <div className="absolute bottom-4 start-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/45 bg-card/90 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-xl">
        {[
          ["online", "متصل"],
          ["approved", "نشط"],
          ["busy", "مشغول"],
          ["emergency", "طوارئ"],
        ].map(([tone, label]) => (
          <span key={tone} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", `provider-map-legend-${tone}`)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
