"use client";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
export function AiModelDist({isLoading,modelTypeDistribution}:{isLoading:boolean;modelTypeDistribution:{modelType:string;count:number}[]}) {
 return <Card className="p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white"><Shield className="h-4 w-4 text-rose-400"/> توزيع نماذج التوصية</h3>
 <div className="space-y-3">{isLoading?<p className="text-xs text-muted-foreground">جاري التحميل...</p>:modelTypeDistribution.map(m=><div key={m.modelType} className="flex items-center justify-between border-b border-border/20 pb-3 text-xs"><span>{m.modelType==="ml_model"?"نموذج تعلم آلي":"قواعد تقليدية"}</span><Badge variant="secondary">{m.count.toLocaleString("ar-SY")}</Badge></div>)}</div></Card>;
}
