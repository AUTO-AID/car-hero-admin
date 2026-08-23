/**
 * مبلغ الطلب — تعريف واحد للوحة كلّها.
 *
 * على الطلب ثلاثة حقول مالية لها معانٍ مختلفة:
 *
 * | الحقل            | معناه                                      |
 * |------------------|--------------------------------------------|
 * | `totalAmount`    | الإجمالي قبل أي خصم                        |
 * | `discountAmount` | ما خُصم (نقاط الولاء أساساً)               |
 * | `payableAmount`  | **المستحقّ فعلاً** = الإجمالي − الخصم       |
 *
 * و`payableAmount` هو ما يدفعه العميل، وما تعرضه شاشته، وما يراه الفنّي في
 * تطبيقه ولوحته، وما تقبضه البوّابة. فهو المبلغ الذي يعنيه الناس حين يقولون
 * «كم هذا الطلب؟».
 *
 * كانت صفحة «الحجوزات» في اللوحة تقرأ `totalAmount || payableAmount || 0`
 * بينما صفحة «الطلبات» تقرأ `payableAmount ?? …`. فالطلب الواحد الذي استُخدمت
 * فيه نقاط ولاء كان يظهر برقمين مختلفين **داخل اللوحة نفسها**، وبرقم ثالث عند
 * العميل. ومع `||` بدل `??` كان طلبٌ غطّته النقاط بالكامل (`payableAmount = 0`)
 * يعرض إجماليه كاملاً وكأن شيئاً لم يُخصم.
 */
export type OrderMoney = {
  payableAmount?: number | null;
  totalAmount?: number | null;
  total?: number | null;
  discountAmount?: number | null;
};

const num = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** المستحقّ على العميل — الرقم الذي يُعرض حين يُعرض رقم واحد */
export function orderAmount(order: OrderMoney | null | undefined): number {
  if (!order) return 0;
  // `??` لا `||`: صفرٌ مستحقّ قيمة صحيحة، لا قيمة غائبة
  return num(order.payableAmount) ?? num(order.totalAmount) ?? num(order.total) ?? 0;
}

/** الإجمالي قبل الخصم — يُعرض إلى جانب المستحقّ لا بدلاً منه */
export function orderGrossAmount(order: OrderMoney | null | undefined): number {
  if (!order) return 0;
  return num(order.totalAmount) ?? num(order.total) ?? orderAmount(order);
}

/** الخصم المطبَّق، أو صفر. يُعرض فقط حين يكون له أثر. */
export function orderDiscount(order: OrderMoney | null | undefined): number {
  if (!order) return 0;
  const explicit = num(order.discountAmount);
  if (explicit !== null && explicit > 0) return explicit;
  // بعض السجلات القديمة بلا `discountAmount` — يُشتقّ من الفرق
  const diff = orderGrossAmount(order) - orderAmount(order);
  return diff > 0 ? diff : 0;
}
