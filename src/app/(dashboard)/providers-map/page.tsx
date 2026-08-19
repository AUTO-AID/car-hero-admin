"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Copy,
  Eraser,
  ExternalLink,
  LocateFixed,
  MapPinned,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterSelectValue, Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/application/hooks/use-debounced-value";
import type { ProviderMapPoint, ProviderMapResponse } from "@/domain/entities/provider.types";
import { getProvidersMap, type ProviderFilters } from "@/infrastructure/services/providers.service";
import { queryKeys } from "@/infrastructure/query/query-keys";
import { cn } from "@/lib/utils";
import { ProvidersLiveMap } from "./components/providers-live-map";
import { EmptyState } from "@/components/ui/empty-state";

type MapPayload = ProviderMapResponse & { data?: ProviderMapResponse | ProviderMapPoint[] };

const runtimeLabels: Record<string, string> = {
  all: "كل أوضاع التشغيل",
  online: "متصل",
  busy: "مشغول",
  offline: "غير متصل",
};

const emergencyLabels: Record<string, string> = {
  all: "كل المزودين",
  true: "طوارئ",
  false: "غير طوارئ",
};

function unwrapMapPayload(payload: MapPayload | undefined): ProviderMapResponse {
  const container = (payload?.data && !Array.isArray(payload.data) ? payload.data : payload) as ProviderMapResponse | undefined;
  const providers = Array.isArray(container?.providers)
    ? container.providers
    : Array.isArray(container?.data)
      ? (container.data as ProviderMapPoint[])
      : [];

  return {
    providers,
    summary: container?.summary ?? {
      total: providers.length,
      activeApproved: providers.filter((provider) => provider.isActive !== false && provider.isApproved).length,
      online: providers.filter((provider) => provider.status === "online").length,
      busy: providers.filter((provider) => provider.status === "busy").length,
      emergency: providers.filter((provider) => provider.emergency247 || provider.is_emergency).length,
      totalOrders: providers.reduce((sum, provider) => sum + Number(provider.totalOrders || 0), 0),
      completedRevenue: providers.reduce((sum, provider) => sum + Number(provider.completedRevenue || 0), 0),
      missingLocation: 0,
    },
    facets: container?.facets ?? { locations: [], governorates: [], cities: [], services: [] },
  };
}

function mergeLocationFacets(facets: ProviderMapResponse["facets"]) {
  if (facets.locations?.length) return facets.locations;

  const counts = new Map<string, number>();
  for (const item of [...(facets.governorates ?? []), ...(facets.cities ?? [])]) {
    if (!item?._id) continue;
    counts.set(item._id, (counts.get(item._id) ?? 0) + Number(item.count || 0));
  }

  return Array.from(counts, ([_id, count]) => ({ _id, count }))
    .sort((a, b) => b.count - a.count || a._id.localeCompare(b._id, "ar"));
}

function formatNumber(value: number | string | undefined) {
  return Number(value || 0).toLocaleString("ar-SY");
}

function formatMoney(value: number | string | undefined) {
  return `${formatNumber(Math.round(Number(value || 0)))} ل.س`;
}

function formatPercent(value: number | string | undefined) {
  const numeric = Number(value || 0);
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return `${Math.round(percent)}%`;
}

function formatMinutes(value: number | string | undefined) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return "غير محدد";
  return `${Math.round(numeric)} دقيقة`;
}

function getProviderServices(provider: ProviderMapPoint) {
  const services = new Set<string>();
  provider.serviceCategories?.forEach((item) => item && services.add(item));
  provider.requestedServices?.forEach((item) => item && services.add(item));
  provider.services_list?.forEach((service) => {
    const label = service.nameAr || service.name || service.service_id;
    if (label) services.add(label);
  });
  return Array.from(services).slice(0, 8);
}

function isOperational(provider: ProviderMapPoint) {
  return provider.isActive !== false && provider.isApproved === true;
}

function getStatusBadge(provider: ProviderMapPoint) {
  if (!isOperational(provider)) return { label: "غير نشط", className: "badge-neutral" };
  if (provider.status === "online") return { label: "متصل", className: "badge-success" };
  if (provider.status === "busy") return { label: "مشغول", className: "badge-warning" };
  return { label: "معتمد", className: "badge-primary" };
}

function MetricTile({
  label,
  value,
  icon: Icon,
  tone = "primary",
  loading,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "green" | "amber" | "blue" | "red";
  loading?: boolean;
}) {
  const toneClass = {
    primary: "text-primary bg-primary/10 border-primary/20",
    green: "text-success bg-emerald-500/10 border-emerald-500/20",
    amber: "text-warning bg-amber-500/10 border-amber-500/20",
    blue: "text-info bg-sky-500/10 border-sky-500/20",
    red: "text-danger bg-rose-500/10 border-rose-500/20",
  }[tone];

  if (loading) {
    return (
      <Card className="p-6 border-border/40 bg-card/70">
        <Skeleton className="mb-3 h-9 w-9 rounded-xl" />
        <Skeleton className="mb-2 h-7 w-20 rounded-lg" />
        <Skeleton className="h-3 w-24 rounded" />
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/70 p-6 shadow-lg shadow-black/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
        </div>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", toneClass)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

function ProviderDetailsPanel({
  provider,
  onClose,
}: {
  provider: ProviderMapPoint | null;
  onClose: () => void;
}) {
  if (!provider) return null;

  const [lng, lat] = provider.location.coordinates;
  const services = getProviderServices(provider);
  const badge = getStatusBadge(provider);
  const coordinatesText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const copyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(coordinatesText);
      toast.success("تم نسخ الإحداثيات");
    } catch {
      toast.error("تعذر نسخ الإحداثيات");
    }
  };

  return (
    <aside className="absolute end-4 top-4 z-[520] flex max-h-[calc(100%-2rem)] w-[380px] max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card/95 shadow-2xl shadow-black/45 backdrop-blur-xl max-lg:inset-x-4 max-lg:top-auto max-lg:bottom-4 max-lg:w-auto">
      <div className="border-b border-border/35 bg-gradient-to-l from-primary/12 to-transparent p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge className={cn("mb-2 border", badge.className)} variant="outline">
              {badge.label}
            </Badge>
            <h2 className="line-clamp-2 text-lg font-bold leading-snug text-white">{provider.businessName}</h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{provider.ownerName || "مالك غير محدد"}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border/35 bg-background/40 p-2 text-center">
            <p className="text-base font-bold text-white">{formatNumber(provider.totalOrders)}</p>
            <p className="text-xs text-muted-foreground">طلبات</p>
          </div>
          <div className="rounded-xl border border-border/35 bg-background/40 p-2 text-center">
            <p className="text-base font-bold text-white">{formatNumber(provider.completedOrders)}</p>
            <p className="text-xs text-muted-foreground">مكتملة</p>
          </div>
          <div className="rounded-xl border border-border/35 bg-background/40 p-2 text-center">
            <p className="text-base font-bold text-white">{Number(provider.averageRating || 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">تقييم</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        <div className="space-y-2">
          <InfoRow icon={Phone} label="الهاتف" value={provider.phone || "غير متوفر"} dir="ltr" />
          <InfoRow icon={LocateFixed} label="الموقع" value={[provider.governorate, provider.city].filter(Boolean).join(" - ") || "غير محدد"} />
          <InfoRow icon={Navigation} label="العنوان" value={provider.address || "غير محدد"} />
          <InfoRow icon={Activity} label="الإيراد المكتمل" value={formatMoney(provider.completedRevenue)} />
          <InfoRow icon={ShieldCheck} label="نسبة الإنجاز" value={formatPercent(provider.completionRate)} />
          <InfoRow icon={AlertTriangle} label="نسبة الإلغاء" value={formatPercent(provider.cancellationRate)} />
          <InfoRow icon={Navigation} label="متوسط الاستجابة" value={formatMinutes(provider.averageResponseTime)} />
          <InfoRow icon={RefreshCw} label="طلبات آخر 30 يوم" value={formatNumber(provider.last30DaysOrders)} />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">الخدمات</p>
          <div className="flex flex-wrap gap-1.5">
            {services.length > 0 ? (
              services.map((service) => (
                <Badge key={service} variant="outline" className="border-primary/20 bg-primary/8 text-primary">
                  {service}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">لا توجد خدمات مسجلة</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/35 bg-background/35 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-muted-foreground">الإحداثيات</span>
            <Button variant="ghost" size="xs" onClick={copyCoordinates} className="gap-1">
              <Copy className="h-3 w-3" />
              نسخ
            </Button>
          </div>
          <p className="font-mono text-xs text-foreground" dir="ltr">{coordinatesText}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border/35 p-4">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background/55 px-2.5 text-sm font-semibold transition hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Google Maps
        </a>
        <Link
          href="/providers"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--admin-gold-deep)))] px-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:brightness-110"
        >
          <Wrench className="h-4 w-4" />
          صفحة المزودين
        </Link>
      </div>
    </aside>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/25 bg-background/25 p-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-semibold text-foreground" dir={dir}>{value}</p>
      </div>
    </div>
  );
}

export default function ProvidersMapPage() {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ProviderMapPoint | null>(null);
  const [filters, setFilters] = useState({
    status: "approved",
    runtimeStatus: "all",
    isActive: "true",
    location: "all",
    service: "all",
    emergency: "all",
    minRating: "",
  });
  const debouncedSearch = useDebouncedValue(search, 300);

  const queryFilters: ProviderFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch.trim(),
    }),
    [debouncedSearch, filters],
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.providers.map(queryFilters),
    queryFn: () => getProvidersMap(queryFilters) as Promise<MapPayload>,
    retry: 1,
    staleTime: 30_000,
  });

  const payload = unwrapMapPayload(data);
  const providers = payload.providers;
  const summary = payload.summary;
  const facets = payload.facets;
  const locationFacets = useMemo(() => mergeLocationFacets(facets), [facets]);
  const hasActiveFilters = Boolean(
    search.trim() ||
    filters.runtimeStatus !== "all" ||
    filters.location !== "all" ||
    filters.service !== "all" ||
    filters.emergency !== "all",
  );
  const activeFilterChips = [
    search.trim() ? { key: "search" as const, label: `بحث: ${search.trim()}` } : null,
    filters.location !== "all" ? { key: "location" as const, label: `الموقع: ${filters.location}` } : null,
    filters.runtimeStatus !== "all" ? { key: "runtimeStatus" as const, label: `التشغيل: ${runtimeLabels[filters.runtimeStatus] ?? filters.runtimeStatus}` } : null,
    filters.service !== "all" ? { key: "service" as const, label: `الخدمة: ${filters.service}` } : null,
    filters.emergency !== "all" ? { key: "emergency" as const, label: `الطوارئ: ${emergencyLabels[filters.emergency] ?? filters.emergency}` } : null,
  ].filter(Boolean) as Array<{ key: keyof typeof filters | "search"; label: string }>;

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
    setSelectedProvider(null);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedProvider(null);
    setFilters({
      status: "approved",
      runtimeStatus: "all",
      isActive: "true",
      location: "all",
      service: "all",
      emergency: "all",
      minRating: "",
    });
  };

  const clearFilter = (key: keyof typeof filters | "search") => {
    if (key === "search") {
      setSearch("");
      setSelectedProvider(null);
      return;
    }
    updateFilter(key, "all");
  };

  useEffect(() => {
    if (!selectedProvider) return;
    if (!providers.some((provider) => provider._id === selectedProvider._id)) {
      setSelectedProvider(null);
    }
  }, [providers, selectedProvider]);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-primary/18 bg-[linear-gradient(135deg,hsl(var(--card-elevated))_0%,hsl(var(--card))_58%,hsl(225_14%_6%)_100%)] p-5 shadow-xl shadow-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,hsl(var(--primary)/0.14),transparent_34%),radial-gradient(circle_at_90%_80%,hsl(193_58%_46%/0.08),transparent_32%)]" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">خريطة انتشار المزودين</h1>
                <p className="text-xs font-semibold text-muted-foreground">مركز تشغيل حي لمواقع المزودين، التغطية، والحالة التشغيلية.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="h-9 gap-2">
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              تحديث
            </Button>
            <Button variant="outline" onClick={resetFilters} disabled={!hasActiveFilters} className="h-9 gap-2">
              <Eraser className="h-4 w-4" />
              تصفير الفلاتر
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <MetricTile label="على الخريطة" value={formatNumber(summary.total)} icon={MapPinned} loading={isLoading} />
        <MetricTile label="فعالون" value={formatNumber(summary.activeApproved)} icon={ShieldCheck} tone="green" loading={isLoading} />
        <MetricTile label="متصلون" value={formatNumber(summary.online)} icon={Activity} tone="blue" loading={isLoading} />
        <MetricTile label="مشغولون" value={formatNumber(summary.busy)} icon={RefreshCw} tone="amber" loading={isLoading} />
        <MetricTile label="طوارئ" value={formatNumber(summary.emergency)} icon={AlertTriangle} tone="red" loading={isLoading} />
        <MetricTile label="طلبات" value={formatNumber(summary.totalOrders)} icon={Wrench} tone="primary" loading={isLoading} />
        <MetricTile label="إيراد مكتمل" value={formatMoney(summary.completedRevenue)} icon={Star} tone="green" loading={isLoading} />
        <MetricTile label="بلا موقع" value={formatNumber(summary.missingLocation)} icon={LocateFixed} tone="amber" loading={isLoading} />
      </section>

      <Card className="border-border/40 bg-card/70 p-6 shadow-lg shadow-black/10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-3">
          <div>
            <p className="text-sm font-bold text-white">فلاتر الخريطة</p>
            <p className="text-xs text-muted-foreground">تُعرض فقط المزودين المفعلين الذين لديهم إحداثيات صحيحة.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
              {formatNumber(summary.total)} مزود ظاهر
            </Badge>
            {isFetching && !isLoading && (
              <Badge variant="outline" className="border-sky-500/25 bg-sky-500/10 text-info">
                جاري تطبيق الفلاتر...
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/45" />
            <input
              aria-label="بحث في الخريطة"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="بحث بالاسم، الهاتف، المدينة، الخدمة..."
              className="h-10 w-full rounded-lg border border-border/45 bg-background/55 ps-10 pe-10 text-sm outline-none transition focus:border-primary/45"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="مسح البحث"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select value={filters.location} onValueChange={(value) => updateFilter("location", value || "all")}>
            <SelectTrigger className="h-10 bg-background/55">
              <FilterSelectValue label="الموقع" value={filters.location === "all" ? "الكل" : filters.location} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المواقع</SelectItem>
              {locationFacets.map((item) => (
                <SelectItem key={item._id} value={item._id}>{item._id} ({item.count})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.runtimeStatus} onValueChange={(value) => updateFilter("runtimeStatus", value || "all")}>
            <SelectTrigger className="h-10 bg-background/55">
              <FilterSelectValue label="التشغيل" value={runtimeLabels[filters.runtimeStatus] ?? filters.runtimeStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل أوضاع التشغيل</SelectItem>
              <SelectItem value="online">متصل</SelectItem>
              <SelectItem value="busy">مشغول</SelectItem>
              <SelectItem value="offline">غير متصل</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.service} onValueChange={(value) => updateFilter("service", value || "all")}>
            <SelectTrigger className="h-10 bg-background/55">
              <FilterSelectValue label="الخدمة" value={filters.service === "all" ? "الكل" : filters.service} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الخدمات</SelectItem>
              {facets.services.map((item) => (
                <SelectItem key={item._id} value={item._id}>{item._id} ({item.count})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.emergency} onValueChange={(value) => updateFilter("emergency", value || "all")}>
            <SelectTrigger className="h-10 bg-background/55">
              <FilterSelectValue label="الطوارئ" value={emergencyLabels[filters.emergency] ?? filters.emergency} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المزودين</SelectItem>
              <SelectItem value="true">طوارئ</SelectItem>
              <SelectItem value="false">غير طوارئ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => clearFilter(chip.key)}
                className="inline-flex h-8 items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/15"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </Card>

      <section className="relative">
        {isError && (
          <div className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            تعذر تحميل بيانات الخريطة. تأكد أن الباك إند المحلي يعمل ثم أعد المحاولة.
          </div>
        )}

        <div className="relative">
          <ProvidersLiveMap
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
          >
            <ProviderDetailsPanel provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
          </ProvidersLiveMap>
          {isLoading && (
            <div className="absolute inset-0 z-[510] flex items-center justify-center rounded-2xl border border-border/40 bg-background/75">
              <div className="rounded-2xl border border-border/40 bg-card px-5 py-4 text-center shadow-xl">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm font-bold text-white">جاري تحميل خريطة المزودين</p>
                <p className="text-xs text-muted-foreground">تجهيز الدبابيس والتجمعات...</p>
              </div>
            </div>
          )}
          {!isLoading && !isError && providers.length === 0 && (
            <div className="absolute inset-0 z-[510] flex items-center justify-center rounded-2xl border border-border/40 bg-background/65">
              <div className="max-w-sm rounded-2xl border border-border/40 bg-card px-5 py-4 shadow-xl">
                <EmptyState
                  icon={MapPinned}
                  title="لا يوجد مزودون مطابقون"
                  description="غيّر الفلاتر أو صفّرها لعرض مزودين أكثر على الخريطة."
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
