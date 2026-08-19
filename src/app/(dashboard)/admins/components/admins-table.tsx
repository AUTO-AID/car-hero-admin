"use client";

import { Calendar, Edit, KeyRound, Mail, MoreHorizontal, Power, ShieldAlert, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export interface AdminRow { _id: string; name: string; email: string; permissions: string[]; isActive: boolean; lastLoginAt?: string; }
interface Props { admins: AdminRow[]; isLoading: boolean; isError: boolean; currentAdminId?: string; canUpdate: boolean; canDelete: boolean; permissionLabels: Record<string, string>; onEdit: (admin: AdminRow) => void; onPassword: (admin: AdminRow) => void; onDeleteClick: (id: string) => void; onToggleStatus: (id: string, active: boolean) => void; }

export default function AdminsTable(props: Props) {
  if (props.isLoading) return <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-52" />)}</div>;
  if (props.isError) return <Empty text="تعذر تحميل حسابات المسؤولين. تحقق من الاتصال أو الصلاحيات." />;
  if (!props.admins.length) return <Empty text="لا توجد حسابات مطابقة للفلاتر الحالية." />;
  return <div className="grid gap-3 md:grid-cols-2">{props.admins.map((admin) => {
    const isSelf = admin._id === props.currentAdminId;
    return <Card key={admin._id} className={`p-4 ${admin.isActive ? "" : "opacity-70"}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex gap-3"><Avatar><AvatarFallback>{admin.name.charAt(0)}</AvatarFallback></Avatar><div><div className="flex items-center gap-2"><h3 className="text-sm font-bold text-white">{admin.name}</h3>{isSelf && <Badge variant="outline">حسابك</Badge>}</div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {admin.email}</p></div></div>
        {(props.canUpdate || props.canDelete) && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="إجراءات المسؤول"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
          {props.canUpdate && <DropdownMenuItem onClick={() => props.onEdit(admin)}><Edit className="h-3.5 w-3.5" /> تعديل الصلاحيات</DropdownMenuItem>}
          {props.canUpdate && !isSelf && <DropdownMenuItem onClick={() => props.onPassword(admin)}><KeyRound className="h-3.5 w-3.5" /> إعادة كلمة المرور</DropdownMenuItem>}
          {props.canUpdate && !isSelf && <DropdownMenuItem onClick={() => props.onToggleStatus(admin._id, !admin.isActive)}><Power className="h-3.5 w-3.5" /> {admin.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}</DropdownMenuItem>}
          {props.canDelete && !isSelf && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => props.onDeleteClick(admin._id)}><Trash2 className="h-3.5 w-3.5" /> حذف نهائي</DropdownMenuItem></>}
        </DropdownMenuContent></DropdownMenu>}
      </div>
      <div className="flex min-h-14 flex-wrap content-start gap-1.5">{(admin.permissions ?? []).length ? admin.permissions.map((permission) => <Badge key={permission} variant="outline">{props.permissionLabels[permission] ?? permission}</Badge>) : <span className="text-xs text-muted-foreground">لا توجد صلاحيات ممنوحة</span>}</div>
      <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-3"><Badge variant="outline" className={admin.isActive ? "text-success" : "text-danger"}>{admin.isActive ? "نشط" : "معطل"}</Badge><span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /> آخر دخول: {admin.lastLoginAt ? formatDistanceToNow(new Date(admin.lastLoginAt), { locale: ar, addSuffix: true }) : "لم يسجل بعد"}</span></div>
    </Card>;
  })}</div>;
}
function Empty({ text }: { text: string }) { return <EmptyState icon={ShieldAlert} title={text} />; }
