"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal, Mail, Calendar, Edit, Trash2, Power, KeyRound,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: Date | string;
}

interface AdminsTableProps {
  admins: Admin[];
  isLoading: boolean;
  onEdit: (admin: Admin) => void;
  onDeleteClick: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  permissionLabels: Record<string, string>;
}

const AVATAR_COLORS = [
  "from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30",
  "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30",
  "from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30",
  "from-primary/20 to-primary/10 text-primary border-primary/30",
  "from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30",
];

export default function AdminsTable({
  admins,
  isLoading,
  onEdit,
  onDeleteClick,
  onToggleStatus,
  permissionLabels,
}: AdminsTableProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatLastLogin = (lastLoginAt: any) => {
    if (!lastLoginAt) return "لم يسجل دخول بعد";
    const date = new Date(lastLoginAt);
    if (isNaN(date.getTime())) return "غير معروف";
    return formatDistanceToNow(date, { locale: ar, addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 bg-card border-border/40 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
      {admins.map((admin, i) => {
        const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <Card key={admin._id}
            className={`p-6 bg-card border border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden group ${!admin.isActive ? "opacity-70" : ""}`}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <Avatar className={`h-14 w-14 border-2 rounded-2xl bg-gradient-to-br ${colorClass} shadow-sm`}>
                  <AvatarFallback className="bg-transparent text-lg font-bold">
                    {admin.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border/50 text-[9px] uppercase font-bold px-1.5">Admin</Badge>
                    <h3 className="font-bold text-white text-[15px] group-hover:text-primary transition-colors">
                      {admin.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                    <span className="font-mono">{admin.email}</span>
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary border border-transparent hover:border-border/50">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border-border/50 shadow-xl rounded-xl">
                  <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-right" onClick={() => onEdit(admin)}>
                    <Edit className="w-3.5 h-3.5" /> تعديل الصلاحيات
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-right">
                    <KeyRound className="w-3.5 h-3.5" /> إعادة تعيين كلمة المرور
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-xs cursor-pointer text-right"
                    onClick={() => onToggleStatus(admin._id, !admin.isActive)}>
                    <Power className="w-3.5 h-3.5" />
                    {admin.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem className="gap-2 text-xs text-destructive cursor-pointer text-right"
                    onClick={() => onDeleteClick(admin._id)}>
                    <Trash2 className="w-3.5 h-3.5" /> حذف نهائي
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-4 text-right">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-wider mb-2">الصلاحيات الممنوحة</p>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {(admin.permissions ?? []).map((p: string) => (
                    <Badge key={p} variant="outline"
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${p === "all" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-secondary/40 text-foreground/80 border-border/50"}`}>
                      {permissionLabels[p] ?? p}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/20">
                <Badge variant="outline"
                  className={`text-[9px] font-bold px-2 py-0.5 shadow-none ${admin.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {admin.isActive ? "نشط" : "معطّل"}
                </Badge>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                  <span>آخر دخول: {isMounted ? formatLastLogin(admin.lastLoginAt) : "جاري التحميل..."}</span>
                  <Calendar className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
