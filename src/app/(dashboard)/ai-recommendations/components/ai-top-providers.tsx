"use client";

import { Crown, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopProviderItem {
  providerId: string;
  businessName: string;
  category: string;
  city: string;
  recommendationCount: number;
  avgScore: number;
  avgConfidence: number;
  avgDistance: number;
}

interface AiTopProvidersProps {
  isLoading: boolean;
  topProviders: TopProviderItem[];
}

export function AiTopProviders({ isLoading, topProviders }: AiTopProvidersProps) {
  return (
    <Card className="p-6 bg-card border-border/40">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            أكثر مزودي الخدمة ترشيحاً بواسطة الذكاء الاصطناعي
          </h3>
          <p className="text-xs text-muted-foreground mt-1">المزودين الأكثر اختياراً ومطابقة لمعايير الجودة والمسافة والتقييمات</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right text-muted-foreground text-xs font-bold py-3.5">اسم المزود</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs font-bold py-3.5">نوع الخدمة الرئيسي</TableHead>
              <TableHead className="text-right text-muted-foreground text-xs font-bold py-3.5">المدينة</TableHead>
              <TableHead className="text-center text-muted-foreground text-xs font-bold py-3.5">عدد الترشيحات</TableHead>
              <TableHead className="text-center text-muted-foreground text-xs font-bold py-3.5">متوسط درجة المطابقة</TableHead>
              <TableHead className="text-center text-muted-foreground text-xs font-bold py-3.5">متوسط ثقة النموذج</TableHead>
              <TableHead className="text-center text-muted-foreground text-xs font-bold py-3.5">متوسط مسافة التوصية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/20">
                  <TableCell><div className="h-4 bg-muted/10 animate-pulse rounded w-32" /></TableCell>
                  <TableCell><div className="h-4 bg-muted/10 animate-pulse rounded w-24" /></TableCell>
                  <TableCell><div className="h-4 bg-muted/10 animate-pulse rounded w-16" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 bg-muted/10 animate-pulse rounded w-10 mx-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 bg-muted/10 animate-pulse rounded w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 bg-muted/10 animate-pulse rounded w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 bg-muted/10 animate-pulse rounded w-16 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : topProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  لا تتوفر ترشيحات نشطة لمزودي الخدمة حالياً
                </TableCell>
              </TableRow>
            ) : (
              topProviders.map((prov) => {
                const arabicMap: Record<string, string> = {
                  towing: "سطحة / سحب",
                  tire: "تبديل إطارات",
                  battery: "شحن/تبديل بطارية",
                  fuel: "توصيل وقود",
                  locksmith: "فتح أقفال سيارات",
                  mechanical: "صيانة ميكانيكية سريع",
                  electrical: "صيانة كهربائية سريع"
                };
                const categoryName = arabicMap[prov.category] || prov.category;

                const cityName = prov.city === "Damascus" ? "دمشق" : prov.city === "Aleppo" ? "حلب" : prov.city === "Homs" ? "حمص" : prov.city === "Lattakia" ? "اللاذقية" : prov.city === "Tartous" ? "طرطوس" : prov.city;

                return (
                  <TableRow key={prov.providerId} className="border-border/20 hover:bg-secondary/20 transition-all">
                    <TableCell className="font-bold text-white text-xs py-3.5">{prov.businessName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground py-3.5">
                      <Badge variant="outline" className="border-border/85 bg-secondary/15 text-muted-foreground font-medium">
                        {categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 py-3.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {cityName}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs text-rose-400 py-3.5">
                      {prov.recommendationCount.toLocaleString("ar-EG")} مرة
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-emerald-400 py-3.5">
                      {(prov.avgScore * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-amber-400 py-3.5">
                      {(prov.avgConfidence * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-300 py-3.5">
                      {prov.avgDistance.toFixed(1)} كم
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
