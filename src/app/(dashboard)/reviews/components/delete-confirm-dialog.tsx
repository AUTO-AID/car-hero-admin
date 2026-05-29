"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-bold">تأكيد حذف التقييم</DialogTitle>
        </DialogHeader>
        <p className="text-xs sm:text-sm text-muted-foreground">سيتم حذف التقييم نهائياً ولن يظهر للمستخدمين. هذا الإجراء لا يمكن التراجع عنه.</p>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-border/40">إلغاء</Button>
          <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white"
            onClick={onConfirm} disabled={isPending}>
            {isPending ? "جاري الحذف..." : "حذف التقييم"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
