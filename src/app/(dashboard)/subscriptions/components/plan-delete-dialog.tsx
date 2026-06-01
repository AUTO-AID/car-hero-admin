"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PlanDeleteDialog({ open, onOpenChange, onConfirm, isPending }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isPending: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-xl max-w-sm" dir="rtl">
        <DialogHeader><DialogTitle className="text-white text-sm font-bold">تعطيل خطة الاشتراك</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground text-right">سيتم منع الاشتراكات الجديدة في الخطة مع الاحتفاظ بسجلات ومزايا المشتركين الحاليين.</p>
        <DialogFooter className="gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button variant="destructive" onClick={onConfirm} disabled={isPending}>{isPending ? "جاري التعطيل..." : "تعطيل الخطة"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
