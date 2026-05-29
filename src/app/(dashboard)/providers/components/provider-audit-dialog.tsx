"use client";

import { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, FileText, ZoomIn, ZoomOut, 
  RotateCw, RefreshCw, AlertTriangle, Loader2, 
  Check, X 
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  OIL_CHANGE: "تغيير زيت", 
  GENERAL_MAINTENANCE: "صيانة عامة",
  CAR_WASH: "غسيل", 
  TIRE_SERVICE: "إطارات", 
  BATTERY: "بطارية",
  PAINT_REPAIR: "بويا وحدادة", 
  TOWING: "سطحة / سحب سيارات", 
  DIAGNOSTICS: "فحص كمبيوتر"
};

const REJECT_REASONS = [
  "صورة السجل التجاري غير واضحة أو منتهية الصلاحية",
  "البطاقة الشخصية المرفقة لا تتطابق مع اسم مالك الحساب",
  "الرجاء رفع رخصة تشغيل ورشة العمل الصادرة عن النقابة الحرفية",
  "الوثائق المرفوعة ناقصة وتفتقر لصورة مقر العمل الفعلي"
];

interface ProviderAuditDialogProps {
  auditProvider: any | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isApprovePending: boolean;
  isRejectPending: boolean;
}

export function ProviderAuditDialog({
  auditProvider,
  onClose,
  onApprove,
  onReject,
  isApprovePending,
  isRejectPending,
}: ProviderAuditDialogProps) {
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleClose = () => {
    setSelectedDocIdx(0);
    setZoom(100);
    setRotation(0);
    setShowRejectForm(false);
    setRejectionReason("");
    onClose();
  };

  const handleApprove = () => {
    if (auditProvider) {
      onApprove(auditProvider._id);
    }
  };

  const handleReject = () => {
    if (auditProvider && rejectionReason) {
      onReject(auditProvider._id, rejectionReason);
    }
  };

  return (
    <Dialog open={auditProvider !== null} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl bg-card border-border/40 rounded-2xl overflow-hidden shadow-2xl p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/20 bg-secondary/10 text-right">
          <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            تدقيق ومراجعة ملف تسجيل: {auditProvider?.businessName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium mt-1">
            قم بمطابقة المستندات المرفقة مع بيانات المسؤول للموافقة على التفعيل أو الرفض
          </DialogDescription>
        </DialogHeader>

        {auditProvider && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto max-h-[75vh]">
            
            {/* LEFT SIDE: Visual Document Viewer (col-span-7) */}
            <div className="lg:col-span-7 p-6 border-l border-border/20 flex flex-col gap-4 bg-black/20">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  معاينة الوثائق الرسمية ({auditProvider.documents?.length || 0})
                </h4>

                {/* Document Switcher tabs */}
                {auditProvider.documents && auditProvider.documents.length > 0 && (
                  <div className="flex gap-1.5 p-1 bg-secondary/30 rounded-lg">
                    {auditProvider.documents.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedDocIdx(idx); setZoom(100); setRotation(0); }}
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
                          selectedDocIdx === idx
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                        )}
                      >
                        وثيقة {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Viewer Box */}
              <div className="relative border border-border/30 rounded-xl h-[360px] bg-secondary/10 overflow-hidden flex items-center justify-center group/viewer">
                {auditProvider.documents && auditProvider.documents.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={auditProvider.documents[selectedDocIdx]}
                      alt="وثيقة التوثيق"
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: "transform 0.2s ease-in-out",
                      }}
                      className="max-h-[320px] max-w-[90%] object-contain rounded shadow-lg"
                    />

                    {/* Zoom/Rotate Floating controls */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-xl bg-background/90 border border-border/40 backdrop-blur-md opacity-70 group-hover/viewer:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setZoom(z => Math.min(250, z + 20))}
                        className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60"
                        title="تكبير"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setZoom(z => Math.max(50, z - 20))}
                        className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60"
                        title="تصغير"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60"
                        title="تدوير 90 درجة"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <span className="w-px h-4 bg-border/40 mx-1" />
                      <button
                        onClick={() => { setZoom(100); setRotation(0); }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60"
                        title="إعادة ضبط المعاينة"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 p-8">
                    <AlertTriangle className="w-8 h-8 text-amber-500/80 animate-bounce" />
                    <p className="text-xs font-bold text-foreground">لم يتم رفع وثائق توثيق حتى الآن</p>
                    <p className="text-[10px] text-muted-foreground/60 text-center max-w-[240px]">
                      يمكنك التواصل مع مزود الخدمة هاتفياً لإرشاده لرفع الأوراق من صفحة الإعدادات.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Details & Actions (col-span-5) */}
            <div className="lg:col-span-5 p-6 flex flex-col justify-between gap-6">
              
              {/* Details Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">البيانات التفصيلية للمسؤول</h4>
                
                <div className="p-3.5 rounded-xl border border-border/25 bg-secondary/5 space-y-3.5">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold">اسم النشاط التجاري (الورشة)</span>
                    <p className="text-xs font-bold text-white mt-0.5">{auditProvider.businessName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold">المالك المسؤول</span>
                    <p className="text-xs font-bold text-white mt-0.5">{auditProvider.ownerName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">المحافظة / المدينة</span>
                      <p className="text-xs font-bold text-white mt-0.5">{auditProvider.city}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">رقم الجوال</span>
                      <p className="text-xs font-bold text-white font-mono mt-0.5" dir="ltr">{auditProvider.phone}</p>
                    </div>
                  </div>
                  {auditProvider.address && (
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">العنوان التفصيلي</span>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{auditProvider.address}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground font-bold">الخدمات الأساسية المدخلة</span>
                  <div className="flex flex-wrap gap-1.5">
                    {auditProvider.serviceCategories?.map((cat: string) => (
                      <Badge key={cat} variant="outline" className="bg-secondary/40 text-foreground border-border/30 text-[10px] font-bold">
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Actions Footer */}
              <div className="pt-4 border-t border-border/20">
                {showRejectForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-400">حدد سبب الرفض وإخطار المزود</label>
                      <button 
                        onClick={() => setShowRejectForm(false)}
                        className="text-[10px] font-bold text-muted-foreground hover:text-white"
                      >
                        تراجع
                      </button>
                    </div>

                    {/* Quick reason templates */}
                    <div className="grid grid-cols-1 gap-1.5">
                      {REJECT_REASONS.map((r, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRejectionReason(r)}
                          className={cn(
                            "text-right text-[10.5px] p-2 rounded-lg border text-muted-foreground transition-all",
                            rejectionReason === r 
                              ? "bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold"
                              : "bg-secondary/20 border-border/20 hover:bg-secondary/40 hover:text-foreground"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="أو اكتب تفاصيل الرفض بشكل مخصص هنا..."
                      className="w-full text-xs p-3 rounded-xl bg-background border border-border/40 text-foreground focus:border-rose-500 outline-none resize-none placeholder:text-muted-foreground/30"
                    />

                    <Button
                      disabled={isRejectPending || !rejectionReason}
                      onClick={handleReject}
                      className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold h-10 rounded-xl"
                    >
                      {isRejectPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      تأكيد رفض طلب التسجيل
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {auditProvider.registrationStatus === "pending" && (
                      <>
                        <Button
                          disabled={isApprovePending}
                          onClick={handleApprove}
                          className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-500/15"
                        >
                          {isApprovePending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4.5 h-4.5" />
                          )}
                          اعتماد وقبول الحساب
                        </Button>
                        <Button
                          onClick={() => setShowRejectForm(true)}
                          className="bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 hover:border-transparent font-bold h-11 px-4 rounded-xl transition-all"
                        >
                          رفض الطلب
                        </Button>
                      </>
                    )}

                    {auditProvider.registrationStatus === "approved" && (
                      <div className="w-full p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-center text-xs font-bold">
                        هذا الحساب معتمد ونشط مسبقاً ✓
                      </div>
                    )}

                    {auditProvider.registrationStatus === "rejected" && (
                      <div className="w-full p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-center text-xs font-bold">
                        هذا الطلب تم رفضه مسبقاً من قبل الإدارة
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
