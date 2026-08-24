/**
 * Labels, number/date formatting and tone classes for the operations-
 * intelligence view. These lived in page.tsx, so the cards that use them could
 * not be extracted alongside.
 */

export const levelLabels: Record<string, string> = {
  healthy: "مستقر",
  watch: "مراقبة",
  pressured: "ضغط",
  critical: "حرج",
};

export const statusLabels: Record<string, string> = {
  new: "جديدة",
  acknowledged: "تمت المراجعة",
  in_progress: "قيد المعالجة",
  resolved: "تم الحل",
  dismissed: "متجاهلة",
  unread: "غير مقروء",
  read: "مقروء",
};

export const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

export const workloadLabels: Record<string, string> = {
  overloaded: "مضغوط",
  risky: "خطر",
  strategic: "استراتيجي",
  champion: "قوي",
  underused: "غير مستغل",
  normal: "طبيعي",
};

export const slaLabels: Record<string, string> = {
  on_track: "ضمن الوقت",
  due_soon: "قريب من التأخير",
  overdue: "متأخر",
};

export function idOf(item: { _id?: string; id?: string }) {
  return item._id || item.id || "";
}

export function formatNumber(value?: number) {
  return Number(value || 0).toLocaleString("ar-EG");
}

export function evidenceNumber(evidence: Record<string, unknown> | undefined, key: string) {
  const value = evidence?.[key];
  return typeof value === "number" ? value : Number(value || 0);
}

export function levelClass(level?: string) {
  return {
    healthy: "text-success bg-emerald-500/10 border-emerald-500/25",
    watch: "text-warning bg-amber-500/10 border-amber-500/25",
    pressured: "text-warning bg-orange-500/10 border-orange-500/25",
    critical: "text-danger bg-rose-500/10 border-rose-500/25",
  }[level || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function priorityClass(priority?: string) {
  return {
    low: "text-info bg-sky-500/10 border-sky-500/25",
    medium: "text-warning bg-amber-500/10 border-amber-500/25",
    high: "text-warning bg-orange-500/10 border-orange-500/25",
    critical: "text-danger bg-rose-500/10 border-rose-500/25",
  }[priority || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function workloadClass(level?: string) {
  return {
    overloaded: "text-warning bg-orange-500/10 border-orange-500/25",
    risky: "text-danger bg-rose-500/10 border-rose-500/25",
    strategic: "text-info bg-violet-500/10 border-violet-500/25",
    champion: "text-success bg-emerald-500/10 border-emerald-500/25",
    underused: "text-info bg-sky-500/10 border-sky-500/25",
    normal: "text-muted-foreground bg-secondary/40 border-border/40",
  }[level || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function slaClass(status?: string) {
  return {
    on_track: "text-success bg-emerald-500/10 border-emerald-500/25",
    due_soon: "text-warning bg-amber-500/10 border-amber-500/25",
    overdue: "text-danger bg-rose-500/10 border-rose-500/25",
  }[status || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

export function formatDateTime(value?: string) {
  if (!value) return "غير محدد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير محدد";
  return date.toLocaleString("ar-SY", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
//  تعريب المحتوى القادم من المحرّك
//
//  محرّك ذكاء العمليات يبني العناوين والأسباب بالإنجليزية ويحفظها في القاعدة
//  (pressure-score.engine.ts و operations-intelligence-management.service.ts).
//  اللوحة عربية بالكامل، فكانت تعرض جملاً إنجليزية وسط نص عربي.
//
//  الترجمة هنا لا في الباك: النصوص **محفوظة** في وثائق قائمة، فتعريبها في
//  المصدر يترك كل ما حُفظ سابقاً إنجليزياً. والأفضل من ترجمة الجملة أننا نعيد
//  بناءها من الحقول المهيكلة (المدينة، الخدمة، عدد المزودين) المتوفرة أصلاً.
// ============================================================

/** أسباب التوصيات كما يولّدها reasonsFor في محرّك الضغط. */
const REASON_AR: Array<[RegExp, string]> = [
  [/no active provider covers/i, "يوجد طلب فعلي ولا مزوّد نشط يغطّي هذه الخدمة في المنطقة"],
  [/Orders per active provider/i, "عدد الطلبات لكل مزوّد تجاوز الحدّ الصحّي لعبء العمل"],
  [/Cancellation or rejection rate/i, "نسبة الإلغاء أو الرفض مرتفعة"],
  [/share of requests is not assigned/i, "نسبة ملحوظة من الطلبات لم تُسنَد إلى أي مزوّد"],
  [/response time is increasing/i, "متوسط زمن استجابة المزوّدين في ارتفاع"],
  [/demand growth is accelerating/i, "نمو الطلب يتسارع مقارنةً بالفترة السابقة"],
  [/Demand pressure is above the operational threshold/i, "ضغط الطلب تجاوز الحدّ التشغيلي"],
  [/rating indicates operational risk/i, "نسبة الإلغاء أو التقييم يشيران إلى مخاطرة تشغيلية"],
  // أسباب تصنيف المزوّدين (providerWorkload) من الخدمة نفسها
  [/High recent order volume with elevated response time/i, "حجم طلبات مرتفع حديثاً مع زمن استجابة أو عبء عمل مرتفع"],
  [/High completion rate and strong rating/i, "نسبة إنجاز عالية وتقييم قوي مع طلب فعلي ملموس"],
  [/currently busy with multiple active orders/i, "المزوّد مشغول حالياً بعدّة طلبات نشطة"],
  [/one of the only active options/i, "من المزوّدين النشطين القلائل لخدمة واحدة على الأقل في المنطقة"],
  // هذان يُكتبان خارج reasons.push في الخدمة، فغابا عن أول جولة تعريب
  [/Recent workload is within the normal operating range/i, "عبء العمل الأخير ضمن النطاق الطبيعي"],
  [/no recent orders in the analysis window/i, "المزوّد نشط ومعتمد لكن بلا طلبات ضمن فترة التحليل"],
];

export function translateReason(text?: string) {
  if (!text) return "";
  const hit = REASON_AR.find(([pattern]) => pattern.test(text));
  return hit ? hit[1] : text;
}

export function translateReasons(list?: string[]) {
  return (list || []).map(translateReason).filter(Boolean);
}

/**
 * اسم المنطقة للعرض. المحرّك يكتب "unknown" حين يعجز عن اشتقاق المدينة
 * (طلب بلا مزوّد مُسنَد ⇒ لا مدينة تُقرأ)، وعرضها حرفياً يبدو كعطل.
 */
export function areaLabel(city?: string, governorate?: string) {
  return normalizeCity(city) || normalizeCity(governorate) || "منطقة غير محدّدة";
}

export function governorateLabel(governorate?: string, city?: string) {
  const gov = normalizeCity(governorate);
  const town = normalizeCity(city);
  if (!gov || gov === town) return "";
  return gov;
}

/** أنواع التنبيهات كما يكتبها المحرّك في حقل type. */
export const alertTypeLabels: Record<string, string> = {
  pressure_critical: "ضغط حرج",
  coverage_gap: "فجوة تغطية",
  provider_risky: "مزوّد عالي المخاطر",
  provider_overloaded: "مزوّد مضغوط",
  recommendation_overdue: "توصية متأخرة",
  daily_brief: "الملخّص اليومي",
};

export const severityLabels: Record<string, string> = {
  info: "معلومة",
  warning: "تنبيه",
  high: "مرتفع",
  critical: "حرج",
};

export function severityClass(severity?: string) {
  return {
    info: "text-info bg-sky-500/10 border-sky-500/25",
    warning: "text-warning bg-amber-500/10 border-amber-500/25",
    high: "text-warning bg-orange-500/10 border-orange-500/25",
    critical: "text-danger bg-rose-500/10 border-rose-500/25",
  }[severity || ""] || "text-muted-foreground bg-secondary/40 border-border/40";
}

/** ألوان صريحة لكل مستوى ضغط — تُستعمل في الحلقة والشريط لا في الشارة فقط. */
export function levelBarClass(level?: string) {
  return {
    healthy: "bg-emerald-400",
    watch: "bg-amber-400",
    pressured: "bg-orange-400",
    critical: "bg-rose-500",
  }[level || ""] || "bg-muted-foreground";
}

export function levelStrokeClass(level?: string) {
  return {
    healthy: "stroke-emerald-400",
    watch: "stroke-amber-400",
    pressured: "stroke-orange-400",
    critical: "stroke-rose-500",
  }[level || ""] || "stroke-muted-foreground";
}

/** تسميات مكوّنات درجة الضغط، بترتيب وزنها في المعادلة. */
export const componentLabels: Array<{ key: string; label: string; weight: number }> = [
  { key: "ordersPerProvider", label: "طلبات لكل مزوّد", weight: 30 },
  { key: "cancelRate", label: "الإلغاء والرفض", weight: 20 },
  { key: "responseTime", label: "زمن الاستجابة", weight: 20 },
  { key: "unassigned", label: "طلبات بلا إسناد", weight: 20 },
  { key: "growth", label: "نمو الطلب", weight: 10 },
];

/**
 * أسماء المدن الواردة بالإنجليزية في بيانات المزوّدين.
 * البيانات مختلطة (دمشق و Damascus لنفس المدينة)، فيظهر الاسمان كمنطقتين
 * منفصلتين في القوائم والفلاتر. التوحيد هنا للعرض فقط — لا يمسّ المخزَّن.
 */
const CITY_AR: Record<string, string> = {
  damascus: "دمشق",
  "rural damascus": "ريف دمشق",
  "damascus countryside": "ريف دمشق",
  aleppo: "حلب",
  homs: "حمص",
  hama: "حماة",
  latakia: "اللاذقية",
  tartus: "طرطوس",
  idlib: "إدلب",
  daraa: "درعا",
  "deir ez-zor": "دير الزور",
  "deir ezzor": "دير الزور",
  raqqa: "الرقة",
  hasakah: "الحسكة",
  "al-hasakah": "الحسكة",
  sweida: "السويداء",
  "as-suwayda": "السويداء",
  quneitra: "القنيطرة",
};

/** يوحّد اسم المنطقة للعرض: يترجم المعروف ويُبقي غيره كما ورد. */
export function normalizeCity(value?: string) {
  const raw = (value || "").trim();
  if (!raw || raw.toLowerCase() === "unknown") return "";
  return CITY_AR[raw.toLowerCase()] || raw;
}
