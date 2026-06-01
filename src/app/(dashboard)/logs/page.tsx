"use client";
import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuditLog } from "@/domain/entities/audit.types";
import { exportAuditLogs, getAuditLogs, getAuditLogStats } from "@/infrastructure/services/audit-logs.service";
import LogsStats from "./components/logs-stats";
import LogsTable from "./components/logs-table";
import LogDetailsSheet from "./components/log-details-sheet";

const labels: Record<string, string> = {
  APPROVE_PROVIDER:"اعتماد مزود",SUSPEND_PROVIDER:"تعليق مزود",UPDATE_SETTINGS:"تعديل إعدادات",DELETE_PROMOCODE:"حذف رمز ترويجي",BAN_USER:"حظر مستخدم",
  "provider.update":"تعديل مزود","provider.approve":"اعتماد مزود","provider.reject":"رفض مزود","provider.status_update":"تغيير حالة مزود","provider.deactivate":"تعطيل مزود","provider.create":"إنشاء مزود",
  "service.create":"إنشاء خدمة","service.update":"تعديل خدمة","service.status_update":"تغيير حالة خدمة","service.delete":"حذف خدمة",
  "user.status_update":"تغيير حالة مستخدم","user.update":"تعديل مستخدم","user.delete":"حذف مستخدم",
  "setting.update":"تعديل إعدادات النظام","setting.maintenance_update":"تغيير وضع الصيانة",
  "admin.create":"إنشاء مسؤول","admin.permissions_update":"تعديل صلاحيات مسؤول","admin.status_update":"تغيير حالة مسؤول","admin.password_reset":"إعادة كلمة مرور مسؤول","admin.delete":"حذف مسؤول",
  "wallet.adjust":"تسوية محفظة","wallet.payout_complete":"إكمال سحب","wallet.payout_reject":"رفض سحب","vehicle.delete":"حذف سيارة",
};
const entities: Record<string,string>={Provider:"مزود",provider:"مزود",User:"مستخدم",user:"مستخدم",PromoCode:"رمز ترويجي",SystemSetting:"إعدادات",setting:"إعدادات",service:"خدمة",admin:"مسؤول",wallet:"محفظة",transaction:"عملية مالية",vehicle:"سيارة",subscription_plan:"خطة اشتراك"};
export default function LogsPage(){
 const [page,setPage]=useState(1),[search,setSearch]=useState(""),[action,setAction]=useState(""),[entityType,setEntityType]=useState(""),[dateFrom,setDateFrom]=useState(""),[dateTo,setDateTo]=useState(""),[sortOrder,setSortOrder]=useState<"asc"|"desc">("desc"),[selected,setSelected]=useState<AuditLog|null>(null);
 const deferred=useDeferredValue(search); const filters={action:action||undefined,entityType:entityType||undefined,search:deferred.trim()||undefined,dateFrom:dateFrom||undefined,dateTo:dateTo||undefined,sortOrder};
 const logs=useQuery({queryKey:["audit-logs",page,filters],queryFn:()=>getAuditLogs({...filters,page,limit:20})});
 const stats=useQuery({queryKey:["audit-log-stats"],queryFn:getAuditLogStats});
 const clear=()=>{setSearch("");setAction("");setEntityType("");setDateFrom("");setDateTo("");setSortOrder("desc");setPage(1)};
 const download=async()=>{try{const result=await exportAuditLogs(filters);const blob=new Blob(["\ufeff"+result.csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=result.filename;link.click();URL.revokeObjectURL(url);toast.success(`تم تصدير ${result.exported} سجل${result.truncated?" (بلغ التصدير الحد الأقصى)":""}`)}catch{toast.error("تعذر تصدير السجل")}};
 return <div className="space-y-5" dir="rtl"><LogsStats stats={stats.data} isFetching={logs.isFetching||stats.isFetching} onRefresh={()=>{logs.refetch();stats.refetch()}}/><LogsTable logs={logs.data?.logs??[]} total={logs.data?.total??0} pages={logs.data?.pages??1} page={page} setPage={setPage} isLoading={logs.isLoading} isError={logs.isError} filters={{search,action,entityType,dateFrom,dateTo,sortOrder}} setters={{setSearch,setAction,setEntityType,setDateFrom,setDateTo,setSortOrder}} onClear={clear} onExport={download} onSelect={setSelected} stats={stats.data} actionLabels={labels} entityLabels={entities}/><LogDetailsSheet selectedLog={selected} onOpenChange={(open)=>!open&&setSelected(null)} onSelectLog={setSelected} actionLabels={labels} entityLabels={entities}/></div>
}
