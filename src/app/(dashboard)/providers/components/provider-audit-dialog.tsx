"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert, FileText, FileImage, Paperclip, ExternalLink, Info,
  ZoomIn, ZoomOut, RotateCw, RefreshCw, AlertTriangle, Loader2,
  Check, X, Building2, Store, User, MapPin, Map, Phone, Mail,
  Wrench, Clock, Users, Award, Zap, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/domain/entities/service-catalog";

// نوع نشاط الورشة كما يختاره المزوّد في نموذج التسجيل (StepContact/translations.js).
const ACTIVITY_LABELS: Record<string, string> = {
  repair: "محل تصليح ميكانيك",
  mobile: "ميكانيكي متنقل",
  electric: "كهرباء وكمبيوتر سيارات",
  towing: "سطحة / سحب سيارات",
  body: "تجليس وبخ (دهان)",
  tires: "إطارات وميزان دوزان",
  oil: "غيار زيت وفلاتر",
  ac: "تكييف وتبريد سيارات",
  detailing: "مركز تلميع وغسيل",
  accessories: "زينة وإكسسوارات",
};

// المرافق كما يحدّدها المزوّد في النموذج.
const FACILITY_LABELS: Record<string, string> = {
  wifi: "إنترنت مجاني",
  waiting: "غرفة انتظار مكيفة",
  parts: "متجر قطع غيار",
};

const DAY_LABELS: Record<string, string> = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

const activityLabel = (value?: string) => (value && ACTIVITY_LABELS[value]) || value || "";
const facilityLabel = (value?: string) => (value && FACILITY_LABELS[value]) || value || "";

const REJECT_REASONS = [
  "صورة السجل التجاري غير واضحة أو منتهية الصلاحية",
  "البطاقة الشخصية المرفقة لا تتطابق مع اسم مالك الحساب",
  "الرجاء رفع رخصة تشغيل ورشة العمل الصادرة عن النقابة الحرفية",
  "الوثائق المرفوعة ناقصة وتفتقر لصورة مقر العمل الفعلي",
];

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد المراجعة", className: "text-warning bg-amber-500/10 border-amber-500/30" },
  approved: { label: "معتمد ونشط", className: "text-success bg-emerald-500/10 border-emerald-500/30" },
  rejected: { label: "مرفوض", className: "text-danger bg-rose-500/10 border-rose-500/30" },
};

// ============================================================
//  توحيد المرفقات المعروضة على الأدمن (documents الروابط + shopPhotos).
// ============================================================

const IMAGE_RE = /\.(png|jpe?g|webp|gif|bmp|avif|svg)(\?|#|$)/i;

const asUrl = (value: any): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.url || value.path || value.location || value.secure_url || value.uri || "";
  }
  return "";
};

const isImageAttachment = (url: string, type?: string) =>
  !!url &&
  (IMAGE_RE.test(url) ||
    url.startsWith("data:image") ||
    url.startsWith("blob:") ||
    (type || "").startsWith("image/"));

const fileNameFromUrl = (url: string) => {
  try {
    return decodeURIComponent(new URL(url, "https://x").pathname.split("/").pop() || url);
  } catch {
    return url;
  }
};

const humanSize = (bytes?: number) => {
  if (!bytes || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
};

type Attachment = {
  key: string;
  label: string;
  url?: string;
  previewable: boolean;
  meta?: string;
  kind: "image" | "file" | "record";
  groupLabel: string;
};

function buildAttachments(provider: any): Attachment[] {
  const documents: Attachment[] = (provider?.documents ?? []).map((doc: any, index: number) => {
    const url = asUrl(doc);
    const previewable = isImageAttachment(url);
    return {
      key: `doc-${index}`,
      label: url ? fileNameFromUrl(url) : `وثيقة ${index + 1}`,
      url: url || undefined,
      previewable,
      kind: previewable ? "image" : url ? "file" : "record",
      groupLabel: "مستند رسمي",
    };
  });

  const shopPhotos: Attachment[] = (provider?.shopPhotos ?? []).map((photo: any, index: number) => {
    const url = asUrl(photo);
    const type = typeof photo === "object" ? photo?.type : undefined;
    const previewable = isImageAttachment(url, type);
    const name =
      (typeof photo === "object" && photo?.name) || (url && fileNameFromUrl(url)) || `صورة الورشة ${index + 1}`;
    const meta = [
      type ? String(type).split("/").pop()?.toUpperCase() : "",
      humanSize(typeof photo === "object" ? photo?.size : undefined),
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      key: `shop-${index}`,
      label: name,
      url: url || undefined,
      previewable,
      meta: meta || undefined,
      kind: previewable ? "image" : url ? "file" : "record",
      groupLabel: "صورة ورشة",
    };
  });

  return [...documents, ...shopPhotos];
}

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

  const p = auditProvider || {};
  const attachments = auditProvider ? buildAttachments(auditProvider) : [];
  const active = attachments[selectedDocIdx] ?? attachments[0];
  const recordOnlyCount = attachments.filter((item) => item.kind === "record").length;
  const status = statusMeta[p?.registrationStatus as string];

  const emergency = Boolean(p.is_emergency || p.emergency247);
  const coverageAreas: string[] = Array.isArray(p.coverageAreas) ? p.coverageAreas.filter(Boolean) : [];
  const facilities: string[] = Array.isArray(p.facilities) ? p.facilities.filter(Boolean) : [];
  const serviceCategories: string[] = Array.isArray(p.serviceCategories) ? p.serviceCategories.filter(Boolean) : [];
  const servicesList: any[] = Array.isArray(p.services_list) ? p.services_list : [];
  const workingHours: any[] = Array.isArray(p.workingHours) ? p.workingHours : [];

  const detailRows = auditProvider
    ? [
        { icon: Building2, label: "النشاط التجاري", value: p.businessName },
        ...(p.category ? [{ icon: Store, label: "نوع النشاط", value: activityLabel(p.category) }] : []),
        { icon: User, label: "المالك المسؤول", value: p.ownerName },
        { icon: Phone, label: "رقم الجوال", value: p.phone, dir: "ltr" as const, mono: true },
        ...(p.email ? [{ icon: Mail, label: "البريد الإلكتروني", value: p.email, dir: "ltr" as const }] : []),
        ...(p.governorate ? [{ icon: MapPin, label: "المحافظة", value: p.governorate }] : []),
        ...(p.city ? [{ icon: MapPin, label: "المدينة", value: p.city }] : []),
        ...(p.address ? [{ icon: Map, label: "العنوان التفصيلي", value: p.address }] : []),
      ]
    : [];

  const stats = [
    { icon: Award, label: "سنوات الخبرة", value: p.experienceYears != null ? `${p.experienceYears}` : "—" },
    { icon: Users, label: "عدد الفنيين", value: p.techCount != null ? `${p.techCount}` : "—" },
    { icon: Zap, label: "طوارئ ٢٤/٧", value: emergency ? "نعم" : "لا", success: emergency },
  ];

  const selectAttachment = (index: number) => {
    setSelectedDocIdx(index);
    setZoom(100);
    setRotation(0);
  };

  const handleClose = () => {
    setSelectedDocIdx(0);
    setZoom(100);
    setRotation(0);
    setShowRejectForm(false);
    setRejectionReason("");
    onClose();
  };

  const handleApprove = () => {
    if (auditProvider) onApprove(auditProvider._id);
  };

  const handleReject = () => {
    if (auditProvider && rejectionReason) onReject(auditProvider._id, rejectionReason);
  };

  return (
    <Dialog open={auditProvider !== null} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl bg-card border-border/40 rounded-2xl overflow-hidden shadow-2xl p-0">
        <DialogHeader className="p-5 sm:p-6 border-b border-border/20 bg-gradient-to-l from-primary/5 to-transparent text-start">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                <span className="truncate">تدقيق ملف: {p?.businessName}</span>
                {status && (
                  <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold border shrink-0", status.className)}>
                    {status.label}
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-semibold mt-1">
                راجِع كامل بيانات المزوّد المُدخلة في نموذج التسجيل وطابِقها مع المستندات قبل الاعتماد أو الرفض
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {auditProvider && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto max-h-[78vh]">

            {/* LEFT SIDE: Visual Document Viewer */}
            <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-l border-border/20 flex flex-col gap-4 bg-secondary/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-primary" />
                  المستندات والصور المرفقة
                </h4>
                <span className="px-2 py-0.5 rounded-md bg-secondary/50 border border-border/40 text-[11px] font-bold text-foreground tabular-nums">
                  {attachments.length}
                </span>
              </div>

              <div className="relative border border-border/40 rounded-xl h-[380px] bg-background/60 overflow-hidden flex items-center justify-center group/viewer">
                {attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2 p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-warning/80" />
                    </div>
                    <p className="text-sm font-bold text-foreground">لم يصل أي مرفق مع هذا الطلب</p>
                    <p className="text-xs text-muted-foreground/60 max-w-[260px]">
                      تواصل مع المزوّد هاتفياً لإرشاده لرفع الأوراق من تطبيق أو لوحة المزوّد.
                    </p>
                  </div>
                ) : active?.previewable && active.url ? (
                  <>
                    <img
                      src={active.url}
                      alt={active.label}
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: "transform 0.2s ease-in-out",
                      }}
                      className="max-h-[340px] max-w-[92%] object-contain rounded-lg shadow-lg"
                    />
                    <span className="absolute top-3 start-3 px-2 py-0.5 rounded-md bg-background/85 border border-border/40 text-[10px] font-bold text-muted-foreground backdrop-blur-sm">
                      {active.groupLabel} · {active.label}
                    </span>
                    <div className="absolute bottom-3 start-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-xl bg-background/90 border border-border/40 backdrop-blur-md opacity-80 group-hover/viewer:opacity-100 transition-opacity duration-300">
                      <button onClick={() => setZoom((z) => Math.min(250, z + 20))} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60" title="تكبير">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button onClick={() => setZoom((z) => Math.max(50, z - 20))} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60" title="تصغير">
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60" title="تدوير">
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <span className="w-px h-4 bg-border/40 mx-0.5" />
                      <button onClick={() => { setZoom(100); setRotation(0); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-secondary/60" title="إعادة ضبط">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-center">
                      {active?.kind === "file" ? <FileText className="w-7 h-7 text-info" /> : <FileImage className="w-7 h-7 text-warning" />}
                    </div>
                    <p className="text-sm font-bold text-white break-all max-w-[80%]">{active?.label}</p>
                    {active?.meta && <p className="text-xs text-muted-foreground">{active.meta}</p>}
                    {active?.url ? (
                      <a
                        href={active.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border/60 bg-background/55 text-xs font-bold text-foreground hover:border-primary/35 hover:bg-primary/10 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        فتح الملفّ في نافذة جديدة
                      </a>
                    ) : (
                      <div className="flex items-start gap-2 text-start text-xs rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 max-w-[320px]">
                        <Info className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
                        <span className="text-muted-foreground leading-relaxed">
                          لم يُرفع الملفّ فعليّاً — هذه بيانات وصفية فقط (تسجيل قديم من الموقع قبل تفعيل الرفع).
                          للمعاينة اطلب من المزوّد رفع الصور من تطبيق أو لوحة المزوّد.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">معرض المرفقات</span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {attachments.map((item, idx) => (
                      <button
                        key={item.key}
                        onClick={() => selectAttachment(idx)}
                        title={item.label}
                        className={cn(
                          "group/thumb shrink-0 w-[76px] flex flex-col gap-1 rounded-lg p-1 border transition-all",
                          idx === selectedDocIdx
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/40 hover:border-border/80 hover:bg-secondary/20"
                        )}
                      >
                        <div className="relative w-full h-[60px] rounded-md overflow-hidden bg-secondary/30 flex items-center justify-center">
                          {item.previewable && item.url ? (
                            <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                          ) : item.kind === "file" ? (
                            <FileText className="w-6 h-6 text-info/80" />
                          ) : (
                            <FileImage className="w-6 h-6 text-warning/80" />
                          )}
                        </div>
                        <span className="text-[9px] font-semibold text-muted-foreground truncate w-full text-center px-0.5">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recordOnlyCount > 0 && (
                <div className="flex items-start gap-2 text-xs rounded-lg border border-amber-500/25 bg-amber-500/5 p-2.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
                  <span className="text-muted-foreground leading-relaxed">
                    {recordOnlyCount} من المرفقات وصلت كأسماء ملفّات فقط دون الصور (تسجيل قديم). التسجيلات الجديدة
                    تُرفع صورها فعليّاً وتظهر هنا للمعاينة.
                  </span>
                </div>
              )}

              {/* نبذة عن الورشة */}
              {p.description && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">نبذة عن الورشة</span>
                  <p className="text-xs text-foreground/90 leading-relaxed rounded-xl border border-border/30 bg-secondary/[0.06] p-3">
                    {p.description}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Full provider data + actions */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between gap-5">
              <div className="space-y-5">
                {/* Identity + contact */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">بيانات المزوّد</h4>
                  <div className="rounded-xl border border-border/30 bg-secondary/[0.06] divide-y divide-border/20 overflow-hidden">
                    {detailRows.map((row) => (
                      <div key={row.label} className="flex items-center gap-3 p-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 shrink-0">
                          <row.icon className="w-4 h-4 text-primary/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[11px] text-muted-foreground font-semibold">{row.label}</span>
                          {row.mono ? (
                            <span
                              dir="ltr"
                              className="inline-flex items-center mt-1 font-mono text-sm font-bold text-white tracking-wider bg-secondary/60 border border-border/40 rounded-lg px-2.5 py-0.5"
                            >
                              {row.value || "—"}
                            </span>
                          ) : (
                            <p className="text-xs font-bold text-white mt-0.5 break-words" dir={(row as any).dir}>
                              {row.value || "—"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience / staff / emergency */}
                <div className="grid grid-cols-3 gap-2">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/30 bg-secondary/[0.06] p-2.5 text-center">
                      <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.success ? "text-success" : "text-primary/80")} />
                      <p className={cn("text-sm font-bold tabular-nums", s.success ? "text-success" : "text-white")}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Coverage areas */}
                {coverageAreas.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" /> مناطق التغطية
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {coverageAreas.map((area, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/40 text-foreground border-border/30 text-xs font-semibold">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {facilities.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary" /> المرافق المتاحة
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {facilities.map((f, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/40 text-foreground border-border/30 text-xs font-semibold">
                          {facilityLabel(f)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services with prices */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-primary" /> الخدمات والأسعار
                  </span>
                  {servicesList.length > 0 ? (
                    <div className="rounded-xl border border-border/30 bg-secondary/[0.06] divide-y divide-border/20 overflow-hidden">
                      {servicesList.map((s, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 p-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{s.name || categoryLabel(s.category)}</p>
                            {s.category && <span className="text-[10px] text-muted-foreground">{categoryLabel(s.category)}</span>}
                          </div>
                          <span className="shrink-0 text-xs font-bold text-primary tabular-nums">
                            {Number(s.price || 0).toLocaleString("ar-SY")} ل.س
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : serviceCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {serviceCategories.map((cat) => (
                        <Badge key={cat} variant="outline" className="bg-secondary/40 text-foreground border-border/30 text-xs font-bold">
                          {categoryLabel(cat)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/60">لا توجد خدمات مدخلة</span>
                  )}
                </div>

                {/* Working hours */}
                {workingHours.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> أوقات العمل
                    </span>
                    <div className="rounded-xl border border-border/30 bg-secondary/[0.06] divide-y divide-border/20 overflow-hidden">
                      {workingHours.map((w, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-1.5">
                          <span className="text-xs font-semibold text-white">{DAY_LABELS[w.day] || w.day}</span>
                          {w.isClosed ? (
                            <span className="text-[11px] font-bold text-danger">مغلق</span>
                          ) : (
                            <span dir="ltr" className="text-[11px] font-mono text-muted-foreground tracking-wide">
                              {w.open} – {w.close}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border/20">
                {showRejectForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-danger">حدد سبب الرفض وإخطار المزود</label>
                      <button onClick={() => setShowRejectForm(false)} className="text-xs font-bold text-muted-foreground hover:text-white">
                        تراجع
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {REJECT_REASONS.map((r, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRejectionReason(r)}
                          className={cn(
                            "text-start text-xs p-2 rounded-lg border transition-all",
                            rejectionReason === r
                              ? "bg-rose-500/10 border-rose-500/40 text-danger font-bold"
                              : "bg-secondary/20 border-border/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
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
                      {isRejectPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      تأكيد رفض طلب التسجيل
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {p.registrationStatus === "pending" && (
                      <>
                        <Button
                          disabled={isApprovePending}
                          onClick={handleApprove}
                          className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-500/15"
                        >
                          {isApprovePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4.5 h-4.5" />}
                          اعتماد وقبول الحساب
                        </Button>
                        <Button
                          onClick={() => setShowRejectForm(true)}
                          className="bg-rose-500/15 hover:bg-rose-500 text-danger hover:text-white border border-rose-500/30 hover:border-transparent font-bold h-11 px-4 rounded-xl transition-all"
                        >
                          رفض الطلب
                        </Button>
                      </>
                    )}

                    {p.registrationStatus === "approved" && (
                      <div className="w-full p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-success text-center text-xs font-bold">
                        هذا الحساب معتمد ونشط مسبقاً ✓
                      </div>
                    )}

                    {p.registrationStatus === "rejected" && (
                      <div className="w-full p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-danger text-center text-xs font-bold">
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
