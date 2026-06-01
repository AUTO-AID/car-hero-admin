"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export default function AdminDeleteDialog({ open, onOpenChange, onConfirm, isPending }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isPending: boolean; }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent dir="rtl"><DialogHeader><DialogTitle>تأكيد حذف المسؤول</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">سيتم حذف الحساب نهائيا ومنع الوصول إلى لوحة التحكم. لا يمكن التراجع عن هذه العملية.</p><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="destructive" disabled={isPending} onClick={onConfirm}>{isPending ? "جار الحذف..." : "حذف الحساب"}</Button></DialogFooter></DialogContent></Dialog>;
}
