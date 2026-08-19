import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md bg-card border-border/40 overflow-hidden shadow-2xl">
        <DialogHeader className="gap-2">
          {isDestructive ? (
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-2 mx-auto">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
          ) : null}
          <DialogTitle className={isDestructive ? "text-center text-xl text-danger" : "text-xl text-foreground"}>
            {title}
          </DialogTitle>
          <DialogDescription className={isDestructive ? "text-center text-muted-foreground text-sm" : "text-muted-foreground text-sm"}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-6 sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold bg-secondary/50 border-border/40 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`w-full sm:w-auto h-11 px-8 rounded-xl font-bold shadow-lg transition-all ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25"
            }`}
          >
            {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {!isLoading && confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
