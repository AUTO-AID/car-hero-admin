"use client";

import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModelTypeDistItem {
  modelType: string;
  count: number;
}

interface AiModelDistProps {
  isLoading: boolean;
  modelTypeDistribution: ModelTypeDistItem[];
}

export function AiModelDist({ isLoading, modelTypeDistribution }: AiModelDistProps) {
  return (
    <Card className="p-6 bg-card border-border/40 lg:col-span-1 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-400" />
          حالة تشغيل النماذج
        </h3>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          يعمل نظام التوصيات بوضعين مدمجين: الوضع القائم على القواعد التقليدية (Rule-Based) والوضع الذكي المدعوم بالذكاء الاصطناعي (ML Model) مع إمكانية التراجع التلقائي عند عدم توفر خدمة الاستدلال.
        </p>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-10 bg-muted/20 animate-pulse rounded-lg" />
              <div className="h-10 bg-muted/20 animate-pulse rounded-lg" />
            </div>
          ) : modelTypeDistribution.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              لا توجد بيانات توزيع نماذج حالياً
            </div>
          ) : (
            modelTypeDistribution.map((m) => (
              <div key={m.modelType} className="p-3 bg-secondary/30 border border-border/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${m.modelType === 'ml_model' ? 'bg-rose-500 animate-pulse' : 'bg-violet-500'}`} />
                  <span className="font-semibold text-xs text-white">
                    {m.modelType === "ml_model" ? "الذكاء الاصطناعي (ML Model)" : "القواعد التقليدية (Rule-Based)"}
                  </span>
                </div>
                <Badge variant="secondary" className="font-bold text-xs bg-secondary border-border/80 text-muted-foreground">
                  {m.count.toLocaleString("ar-EG")} طلب
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">حالة خادم ML الاستدلالي:</span>
          <Badge variant="outline" className="text-emerald-400 bg-emerald-400/5 border-emerald-400/20 font-bold">
            متصل وجاهز (ML-Ready)
          </Badge>
        </div>
      </div>
    </Card>
  );
}
