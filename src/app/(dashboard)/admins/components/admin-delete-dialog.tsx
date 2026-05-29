"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface AdminDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function AdminDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: AdminDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold">تأكيد حذف المسؤول</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground text-right font-arabic">سيتم حذف حساب المسؤول نهائياً ولن يتمكن من الوصول للوحة التحكم مستقبلاً.</p>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-border/40">إلغاء</Button>
          <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={onConfirm} disabled={isPending}>
            {isPending ? "جاري الحذف..." : "حذف الحساب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
