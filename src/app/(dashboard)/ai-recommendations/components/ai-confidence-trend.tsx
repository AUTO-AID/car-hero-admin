"use client";
import dynamic from "next/dynamic"; import { LineChart } from "lucide-react"; import { Card } from "@/components/ui/card";
const ReactECharts=dynamic(()=>import("echarts-for-react"),{ssr:false});
export function AiConfidenceTrend({isLoading,confidenceTrend}:{isLoading:boolean;confidenceTrend:{date:string;avgConfidence:number}[]}) {
 const option={tooltip:{trigger:"axis"},grid:{top:15,right:15,bottom:35,left:15,containLabel:true},xAxis:{type:"category",data:confidenceTrend.map(x=>x.date),axisLabel:{rotate:30,color:"#94a3b8"}},yAxis:{type:"value",min:0,max:1,axisLabel:{formatter:(v:number)=>`${v*100}%`,color:"#94a3b8"}},series:[{type:"line",smooth:true,data:confidenceTrend.map(x=>x.avgConfidence),lineStyle:{color:"#f43f5e",width:3},itemStyle:{color:"#f43f5e"}}]};
 return <Card className="p-5 lg:col-span-2"><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><LineChart className="h-4 w-4 text-rose-400"/> اتجاه ثقة النموذج</h3><Chart loading={isLoading} empty={!confidenceTrend.length} option={option}/></Card>;
}
function Chart({loading,empty,option}:{loading:boolean;empty:boolean;option:object}){return <div className="h-[240px]">{loading?<Empty text="جاري التحميل..."/>:empty?<Empty text="لا توجد بيانات مطابقة للفلاتر"/>:<ReactECharts option={option} style={{height:"100%"}}/>}</div>}
function Empty({text}:{text:string}){return <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{text}</div>}
