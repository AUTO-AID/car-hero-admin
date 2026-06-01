"use client";
import dynamic from "next/dynamic"; import { BarChart3 } from "lucide-react"; import { Card } from "@/components/ui/card";
const ReactECharts=dynamic(()=>import("echarts-for-react"),{ssr:false});
export function AiDailyTrend({isLoading,dailyTrend}:{isLoading:boolean;dailyTrend:{date:string;success:number;failed:number}[]}) {
 const option={tooltip:{trigger:"axis"},legend:{data:["ناجحة","فاشلة"],textStyle:{color:"#94a3b8"}},grid:{top:35,right:15,bottom:35,left:15,containLabel:true},xAxis:{type:"category",data:dailyTrend.map(x=>x.date),axisLabel:{rotate:30,color:"#94a3b8"}},yAxis:{type:"value",axisLabel:{color:"#94a3b8"}},series:[{name:"ناجحة",type:"line",smooth:true,data:dailyTrend.map(x=>x.success),lineStyle:{color:"#10b981",width:3}},{name:"فاشلة",type:"line",smooth:true,data:dailyTrend.map(x=>x.failed),lineStyle:{color:"#ef4444",width:3}}]};
 return <Card className="p-5"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><BarChart3 className="h-4 w-4 text-cyan-400"/> آخر 30 يوما نشطة ضمن الفلاتر</h3><div className="h-[260px]">{isLoading?<Empty text="جاري التحميل..."/>:dailyTrend.length?<ReactECharts option={option} style={{height:"100%"}}/>:<Empty text="لا توجد بيانات مطابقة للفلاتر"/>}</div></Card>;
}
function Empty({text}:{text:string}){return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{text}</div>}
