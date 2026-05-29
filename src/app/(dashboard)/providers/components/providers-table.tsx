"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, MapPin, Star, Clock, ShieldAlert, 
  Eye, Edit, Trash2, Search, Loader2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

const avatarColors = [
  "from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/20",
  "from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20",
  "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20",
  "from-orange-500/20 to-orange-600/10 text-orange-400 border-orange-500/20",
  "from-pink-500/20 to-pink-600/10 text-pink-400 border-pink-500/20",
];

const categoryLabels: Record<string, string> = {
  OIL_CHANGE: "تغيير زيت", 
  GENERAL_MAINTENANCE: "صيانة عامة",
  CAR_WASH: "غسيل", 
  TIRE_SERVICE: "إطارات", 
  BATTERY: "بطارية",
  PAINT_REPAIR: "بويا وحدادة", 
  TOWING: "سطحة / سحب سيارات", 
  DIAGNOSTICS: "فحص كمبيوتر"
};

interface ProvidersTableProps {
  providersList: any[];
  isLoading: boolean;
  tab: string;
  page: number;
  setPage: (updater: number | ((prev: number) => number)) => void;
  handleOpenAudit: (provider: any) => void;
  totalCount: number;
}

export function ProvidersTable({
  providersList,
  isLoading,
  tab,
  page,
  setPage,
  handleOpenAudit,
  totalCount,
}: ProvidersTableProps) {
  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl shadow-black/20 overflow-hidden relative rounded-xl">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
      
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="border-b border-border/30 bg-secondary/30 text-muted-foreground/80 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold text-right">المزود والمسؤول</th>
              <th className="px-6 py-4 font-semibold text-right">معلومات الاتصال</th>
              <th className="px-6 py-4 font-semibold text-right">التصنيف والخدمات</th>
              <th className="px-6 py-4 font-semibold text-center">الطلبات والتقييم</th>
              <th className="px-6 py-4 font-semibold text-center">تاريخ تقديم الطلب</th>
              <th className="px-6 py-4 font-semibold text-left">التدقيق والإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-border/10">
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/80"/>
                      <div className="flex flex-col gap-2 justify-center">
                        <div className="w-24 h-3 bg-secondary/80 rounded"/>
                        <div className="w-16 h-2 bg-secondary/80 rounded"/>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-3 bg-secondary/80 rounded mb-2"/>
                    <div className="w-16 h-2 bg-secondary/80 rounded"/>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-12 h-5 bg-secondary/80 rounded-full"/>
                      <div className="w-12 h-5 bg-secondary/80 rounded-full"/>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-10 h-4 bg-secondary/80 rounded mx-auto"/>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-20 h-3 bg-secondary/80 rounded mx-auto"/>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="w-8 h-8 bg-secondary/80 rounded-lg inline-block"/>
                  </td>
                </tr>
              ))
            ) : providersList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/50 border border-border/40 flex items-center justify-center mb-4 shadow-inner">
                      <Search className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-sm font-bold text-white">لا توجد سجلات حالياً</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">لا يوجد مزودي خدمة يطابقون الفئة المحددة.</p>
                  </div>
                </td>
              </tr>
            ) : (
              providersList.map((provider: any, i: number) => {
                const colorClass = avatarColors[i % avatarColors.length];
                const cats = provider.serviceCategories || [];
                const rating = provider.averageRating || 0;
                const orders = provider.totalOrders || 0;

                return (
                  <tr 
                    key={provider._id} 
                    className="group hover:bg-secondary/20 transition-colors duration-200"
                  >
                    {/* Provider Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className={cn("h-11 w-11 border rounded-xl bg-gradient-to-br shadow-sm shrink-0", colorClass)}>
                          <AvatarFallback className="bg-transparent text-sm font-black">
                            {provider.businessName?.charAt(0) || "م"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-[13px] truncate max-w-[180px] group-hover:text-primary transition-colors">
                            {provider.businessName}
                          </h3>
                          <p className="text-[11px] text-muted-foreground/80 font-medium mt-0.5 truncate max-w-[150px]">
                            المالك: {provider.ownerName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-[11px] text-foreground font-mono" dir="ltr">
                          <Phone className="w-3 h-3 text-muted-foreground/60" /> {provider.phone}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                          <MapPin className="w-3 h-3 text-muted-foreground/60" /> {provider.city}
                        </span>
                      </div>
                    </td>

                    {/* Services */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {cats.slice(0, 2).map((cat: string) => (
                          <Badge key={cat} variant="outline" className="bg-background/50 text-muted-foreground border-border/40 text-[9.5px] px-2 rounded-md font-semibold">
                            {categoryLabels[cat] || cat}
                          </Badge>
                        ))}
                        {cats.length > 2 && (
                          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[9px] px-1.5 rounded-md font-bold">
                            +{cats.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Rating & Orders */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {rating > 0 ? (
                          <span className="flex items-center justify-center gap-1 text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 min-w-[50px]">
                            {rating} <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40 font-medium">لا تقييمات</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-bold tabular-nums">
                          {orders} طلب مكتمل
                        </span>
                      </div>
                    </td>

                    {/* Date Joined */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(provider.createdAt || Date.now()), { locale: ar, addSuffix: true })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-left">
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
                              title="عرض وثائق التفعيل ومراجعتها"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-blue-400 transition-colors" title="تعديل ملف المزود">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors" title="إيقاف تفعيل الحساب">
                              <Trash2 className="w-4 h-4" />
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

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-border/30 bg-secondary/10 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground font-semibold">
          يتم عرض {providersList.length} من إجمالي {totalCount} مزود مسجل
        </p>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2.5 bg-transparent border-border/40 hover:bg-secondary/50 text-muted-foreground rounded-lg"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            السابق
          </Button>
          <div className="h-8 w-8 flex items-center justify-center bg-secondary/40 rounded-lg border border-border/30 text-xs font-black text-white tabular-nums">
            {page}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2.5 bg-transparent border-border/40 hover:bg-secondary/50 text-muted-foreground rounded-lg"
            disabled={providersList.length < 10}
            onClick={() => setPage(p => p + 1)}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
