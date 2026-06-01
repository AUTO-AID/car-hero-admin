"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DeleteConfirmDialog({ open, onOpenChange, onConfirm, isPending }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isPending: boolean }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-card border-border/50 rounded-xl max-w-sm" dir="rtl"><DialogHeader><DialogTitle className="text-sm font-bold">تأكيد حذف التقييم</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">سيتم حذف التقييم نهائيًا وإعادة احتساب تقييم المزود. لا يمكن التراجع عن هذا الإجراء.</p><DialogFooter className="gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="destructive" disabled={isPending} onClick={onConfirm}>{isPending ? "جاري الحذف..." : "حذف نهائي"}</Button></DialogFooter></DialogContent></Dialog>;
}
