"use client";
import dynamic from "next/dynamic"; import { MapPin } from "lucide-react"; import { Card } from "@/components/ui/card";
const ReactECharts=dynamic(()=>import("echarts-for-react"),{ssr:false});
export function AiCityPerformance({isLoading,cityPerformance}:{isLoading:boolean;cityPerformance:{city:string;totalRequests:number}[]}) {
 const option={tooltip:{trigger:"item"},series:[{type:"pie",radius:["42%","72%"],data:cityPerformance.map(x=>({name:x.city,value:x.totalRequests})),label:{color:"#94a3b8"},itemStyle:{borderRadius:5,borderColor:"#0f0b1c",borderWidth:2}}]};
 return <Card className="p-5"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><MapPin className="h-4 w-4 text-pink-400"/> التوزيع حسب المدينة</h3><div className="h-[250px]">{isLoading?<Empty text="جاري التحميل..."/>:cityPerformance.length?<ReactECharts option={option} style={{height:"100%"}}/>:<Empty text="لا توجد بيانات مطابقة للفلاتر"/>}</div></Card>;
}
function Empty({text}:{text:string}){return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{text}</div>}
