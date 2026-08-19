"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  BadgeCheck,
  Clock,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Phone,
  Power,
  Search,
  ShieldAlert,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";

const avatarColors = [
  "from-violet-500/20 to-violet-600/10 text-info border-violet-500/20",
  "from-blue-500/20 to-blue-600/10 text-info border-blue-500/20",
  "from-emerald-500/20 to-emerald-600/10 text-success border-emerald-500/20",
  "from-orange-500/20 to-orange-600/10 text-warning border-orange-500/20",
  "from-pink-500/20 to-pink-600/10 text-pink-400 border-pink-500/20",
];

const categoryLabels: Record<string, string> = {
  roadside_assistance: "مساعدة طريق",
  towing: "سطحة / سحب",
  battery: "بطارية",
  tire: "إطارات",
  fuel: "وقود",
  lockout: "فتح أقفال",
  maintenance: "صيانة",
  car_wash: "غسيل",
  other: "أخرى",
};

interface ProvidersTableProps {
  providersList: any[];
  isLoading: boolean;
  isError?: boolean;
  tab: string;
  page: number;
  setPage: (updater: number | ((prev: number) => number)) => void;
  handleOpenAudit: (provider: any) => void;
  onEditProvider: (provider: any) => void;
  onToggleActive: (provider: any) => void;
  isUpdating?: boolean;
  totalCount: number;
  totalPages: number;
}

function getProviderServices(provider: any) {
  return [
    ...(provider.serviceCategories || []),
    ...(provider.requestedServices || []),
    ...(provider.services_list || [])
      .map((service: any) => service?.name || service?.service_id)
      .filter(Boolean),
  ];
}

function runtimeLabel(status?: string) {
  if (status === "online") return "متصل";
  if (status === "busy") return "مشغول";
  return "غير متصل";
}

export function ProvidersTable({
  providersList,
  isLoading,
  isError = false,
  tab,
  page,
  setPage,
  handleOpenAudit,
  onEditProvider,
  onToggleActive,
  isUpdating = false,
  totalCount,
  totalPages,
}: ProvidersTableProps) {
  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl shadow-black/20 overflow-hidden relative rounded-xl">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />

      <div className="overflow-x-auto min-h-[400px]" tabIndex={0} role="region" aria-label="قائمة المزودين">
        <table className="w-full text-sm text-start min-w-[900px]"><caption className="sr-only">قائمة المزودين</caption>
          <thead>
            <tr className="border-b border-border/30 bg-secondary/30 text-muted-foreground/80 text-xs font-bold uppercase tracking-widest">
              <th scope="col" className="px-6 py-4 font-semibold text-start">المزود والمسؤول</th>
              <th scope="col" className="px-6 py-4 font-semibold text-start">معلومات الاتصال</th>
              <th scope="col" className="px-6 py-4 font-semibold text-start">التصنيف والخدمات</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">الطلبات والتقييم</th>
              <th scope="col" className="px-6 py-4 font-semibold text-center">آخر نشاط / التسجيل</th>
              <th scope="col" className="px-6 py-4 font-semibold text-end">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-border/10">
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/80" />
                      <div className="flex flex-col gap-2 justify-center">
                        <div className="w-24 h-3 bg-secondary/80 rounded" />
                        <div className="w-16 h-2 bg-secondary/80 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-3 bg-secondary/80 rounded mb-2" />
                    <div className="w-16 h-2 bg-secondary/80 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-12 h-5 bg-secondary/80 rounded-full" />
                      <div className="w-12 h-5 bg-secondary/80 rounded-full" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-10 h-4 bg-secondary/80 rounded mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-20 h-3 bg-secondary/80 rounded mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="w-8 h-8 bg-secondary/80 rounded-lg inline-block" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 shadow-inner">
                      <AlertTriangle className="w-6 h-6 text-danger" />
                    </div>
                    <h3 className="text-sm font-bold text-white">تعذر تحميل بيانات المزودين</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-semibold">
                      تحقق من اتصال الخادم أو صلاحيات حساب الإدارة ثم أعد المحاولة.
                    </p>
                  </div>
                </td>
              </tr>
            ) : providersList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16">
                  <EmptyState
                    icon={Search}
                    title="لا توجد سجلات حالياً"
                    description="لا يوجد مزودو خدمة يطابقون الفلاتر المحددة."
                  />
                </td>
              </tr>
            ) : (
              providersList.map((provider: any, i: number) => {
                const colorClass = avatarColors[i % avatarColors.length];
                const cats = getProviderServices(provider);
                const rating = provider.computedAverageRating ?? provider.averageRating ?? 0;
                const completedOrders = provider.completedOrdersCount ?? provider.totalOrders ?? 0;
                const allOrders = provider.actualOrdersCount ?? provider.totalOrders ?? 0;
                const isActive = provider.isActive !== false && provider.accountStatus !== "suspended";
                const runtimeStatus = provider.status || "offline";

                return (
                  <tr key={provider._id} className="group hover:bg-secondary/20 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className={cn("h-11 w-11 border rounded-xl bg-gradient-to-br shadow-sm shrink-0", colorClass)}>
                          <AvatarFallback className="bg-transparent text-sm font-bold">
                            {provider.businessName?.charAt(0) || "م"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm truncate max-w-[200px] group-hover:text-primary transition-colors">
                            {provider.businessName || "مزود بدون اسم"}
                          </h3>
                          <p className="text-xs text-muted-foreground/80 font-semibold mt-0.5 truncate max-w-[170px]">
                            المالك: {provider.ownerName || "غير مسجل"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-1.5 py-0 rounded-md border font-bold",
                                isActive
                                  ? "bg-emerald-500/10 text-success border-emerald-500/25"
                                  : "bg-rose-500/10 text-danger border-rose-500/25",
                              )}
                            >
                              {isActive ? "نشط" : "موقوف"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs px-1.5 py-0 rounded-md border font-bold",
                                runtimeStatus === "online"
                                  ? "bg-blue-500/10 text-info border-blue-500/25"
                                  : runtimeStatus === "busy"
                                    ? "bg-amber-500/10 text-warning border-amber-500/25"
                                    : "bg-slate-500/10 text-muted-foreground border-slate-500/25",
                              )}
                            >
                              {runtimeLabel(runtimeStatus)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-xs text-foreground font-mono" dir="ltr">
                          <Phone className="w-3 h-3 text-muted-foreground/60" /> {provider.phone || "-"}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <MapPin className="w-3 h-3 text-muted-foreground/60" /> {provider.city || provider.governorate || "غير محدد"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {cats.slice(0, 3).map((cat: string) => (
                          <Badge key={cat} variant="outline" className="bg-background/50 text-muted-foreground border-border/40 text-xs px-2 rounded-md font-semibold">
                            {categoryLabels[cat] || cat}
                          </Badge>
                        ))}
                        {cats.length > 3 && (
                          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-xs px-1.5 rounded-md font-bold">
                            +{cats.length - 3}
                          </Badge>
                        )}
                        {cats.length === 0 && (
                          <span className="text-xs text-muted-foreground/50 font-semibold">لا توجد خدمات مسجلة</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {rating > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-xs font-bold text-warning bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 min-w-[50px]">
                            {rating} <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 font-semibold">لا تقييمات</span>
                        )}
                        <span className="text-xs text-muted-foreground font-bold tabular-nums">
                          {completedOrders} طلب مكتمل
                        </span>
                        <span className="text-xs text-muted-foreground/60 font-bold tabular-nums">
                          {allOrders} إجمالي الطلبات
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 font-semibold">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(provider.createdAt || Date.now()), { locale: ar, addSuffix: true })}
                        </span>
                        {provider.lastOnlineAt && (
                          <span className="text-xs text-info/80">
                            آخر اتصال {formatDistanceToNow(new Date(provider.lastOnlineAt), { locale: ar, addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {tab === "pending" ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenAudit(provider)}
                            className="h-8 gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 transition-all font-bold text-xs px-3 rounded-lg"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            تدقيق الوثائق
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenAudit(provider)}
                              className="w-8 h-8 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-colors"
                              title="عرض ملف المزود"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditProvider(provider)}
                              className="w-8 h-8 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-info transition-colors"
                              title="تعديل ملف المزود"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isUpdating}
                              onClick={() => onToggleActive(provider)}
                              className={cn(
                                "w-8 h-8 rounded-lg transition-colors",
                                isActive
                                  ? "hover:bg-rose-500/10 text-muted-foreground hover:text-danger"
                                  : "hover:bg-emerald-500/10 text-muted-foreground hover:text-success",
                              )}
                              title={isActive ? "إيقاف تفعيل الحساب" : "إعادة تفعيل الحساب"}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isActive ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <BadgeCheck className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={totalCount}
        shown={providersList.length}
        unit="مزود مسجل"
        onPageChange={(next) => setPage(() => next)}
        className="bg-secondary/10"
      />
    </div>
  );
}
