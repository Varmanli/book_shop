"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Phone,
  ClipboardList,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  AlertCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { placeOrderCheckoutAction, confirmMockPaymentAction } from "@/actions/checkout.actions";
import { validateCouponAction } from "@/actions/coupon.actions";
import { OrderSummaryCard } from "./order-summary-card";
import type { Address } from "@/db/schema/addresses";

/* ─── types ─────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4;

interface FormState {
  addressId: string;
  phone: string;
  email: string;
  notes: string;
}

interface CouponState {
  code: string;
  discountAmount: number;
  status: "idle" | "validating" | "applied" | "error";
  message: string;
}

interface FieldErrors {
  addressId?: string;
  phone?: string;
  postalCode?: string;
  email?: string;
  notes?: string;
}

/* ─── step metadata ─────────────────────────────────────────── */
const STEPS: { id: Step; label: string; icon: typeof MapPin }[] = [
  { id: 1, label: "آدرس",        icon: MapPin },
  { id: 2, label: "اطلاعات تماس", icon: Phone },
  { id: 3, label: "بررسی",       icon: ClipboardList },
  { id: 4, label: "پرداخت",      icon: CreditCard },
];

/* ═══════════════════════════════════════════════════════════════
   Root wizard
═══════════════════════════════════════════════════════════════ */
interface Props {
  addresses: Address[];
}

export function CheckoutWizard({ addresses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "loading" | "success">("idle");
  const [coupon, setCoupon] = useState<CouponState>({
    code: "",
    discountAmount: 0,
    status: "idle",
    message: "",
  });

  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [form, setForm] = useState<FormState>({
    addressId: defaultAddr?.id ?? "",
    phone: defaultAddr?.phone ?? "",
    email: "",
    notes: "",
  });

  const selectedAddress = addresses.find((a) => a.id === form.addressId);

  /* helpers */
  const patch = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /* ── step validators ── */
  function validateStep1(): boolean {
    if (!form.addressId) {
      setErrors({ addressId: "لطفاً یک آدرس انتخاب کنید" });
      return false;
    }
    setErrors({});
    return true;
  }

  function validateStep2(): boolean {
    const errs: FieldErrors = {};
    if (!/^09[0-9]{9}$/.test(form.phone))
      errs.phone = "شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "فرمت ایمیل نامعتبر است";
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    setErrors({});
    return true;
  }

  /* ── coupon validation ── */
  const { subtotal: cartSubtotal } = (() => {
    try {
      // We read subtotal from the CartContext indirectly via the summary card;
      // here we use it just for the validate call — it's re-validated server-side.
      return { subtotal: 0 }; // placeholder; actual validation uses real subtotal
    } catch {
      return { subtotal: 0 };
    }
  })();

  async function handleValidateCoupon(subtotal: number) {
    if (!coupon.code.trim()) return;
    setCoupon((c) => ({ ...c, status: "validating", message: "" }));
    const res = await validateCouponAction(coupon.code.trim(), subtotal);
    if (res.success) {
      setCoupon((c) => ({
        ...c,
        discountAmount: res.data.discountAmount,
        status: "applied",
        message: `کد تخفیف اعمال شد — ${res.data.discountAmount.toLocaleString("fa-IR")} ریال تخفیف`,
      }));
    } else {
      setCoupon((c) => ({ ...c, discountAmount: 0, status: "error", message: res.error }));
    }
  }

  function clearCoupon() {
    setCoupon({ code: "", discountAmount: 0, status: "idle", message: "" });
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 4) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ── place order (step 3 → 4) ── */
  async function handlePlaceOrder() {
    startTransition(async () => {
      const result = await placeOrderCheckoutAction({
        addressId: form.addressId,
        phone: form.phone,
        postalCode: selectedAddress?.postalCode ?? "",
        email: form.email || undefined,
        notes: form.notes || undefined,
        couponCode: coupon.status === "applied" ? coupon.code.toUpperCase() : undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        // surface field errors if any
        if (result.fieldErrors) {
          const mapped: FieldErrors = {};
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            (mapped as Record<string, string>)[k] = (v as string[])[0];
          }
          setErrors(mapped);
        }
        return;
      }

      setPendingOrderId(result.data.orderId);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── mock payment (step 4) ── */
  async function handlePay() {
    if (!pendingOrderId) return;
    setPaymentState("loading");
    // artificial delay for UX realism
    await new Promise((r) => setTimeout(r, 1800));

    startTransition(async () => {
      const result = await confirmMockPaymentAction(pendingOrderId);
      if (!result.success) {
        setPaymentState("idle");
        toast.error(result.error);
        return;
      }
      setPaymentState("success");
      await new Promise((r) => setTimeout(r, 800));
      router.push(`/checkout/success?orderId=${result.data.orderId}`);
    });
  }

  /* ── render ── */
  return (
    <div dir="rtl" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── stepper ── */}
      <StepBar current={step} />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── left: step content ── */}
        <div className="min-w-0 flex-1">
          {step === 1 && (
            <StepAddress
              addresses={addresses}
              value={form.addressId}
              onChange={(id, phone) => {
                patch("addressId", id);
                if (phone) patch("phone", phone);
              }}
              error={errors.addressId}
            />
          )}
          {step === 2 && (
            <StepContact
              phone={form.phone}
              email={form.email}
              notes={form.notes}
              onPhone={(v) => patch("phone", v)}
              onEmail={(v) => patch("email", v)}
              onNotes={(v) => patch("notes", v)}
              errors={errors}
              coupon={coupon}
              onCouponCodeChange={(v) =>
                setCoupon((c) => ({ ...c, code: v, status: "idle", message: "", discountAmount: 0 }))
              }
              onValidateCoupon={handleValidateCoupon}
              onClearCoupon={clearCoupon}
            />
          )}
          {step === 3 && (
            <StepReview
              form={form}
              selectedAddress={selectedAddress}
              isSubmitting={isPending}
            />
          )}
          {step === 4 && (
            <StepPayment
              state={paymentState}
              onPay={handlePay}
            />
          )}

          {/* ── nav buttons ── */}
          {step !== 4 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <ChevronRight size={16} />
                  مرحله قبل
                </button>
              ) : (
                <Link
                  href="/cart"
                  className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <ChevronRight size={16} />
                  بازگشت به سبد
                </Link>
              )}

              {step < 3 && (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                >
                  مرحله بعد
                  <ChevronLeft size={16} />
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      در حال ثبت…
                    </>
                  ) : (
                    <>
                      تأیید و ادامه
                      <ChevronLeft size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── right: order summary ── */}
        <OrderSummaryCard
          showPayBadge={step === 4}
          discountAmount={coupon.discountAmount}
          couponCode={coupon.status === "applied" ? coupon.code : undefined}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   StepBar
═══════════════════════════════════════════════════════════════ */
function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  done
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  done
                    ? "text-emerald-600"
                    : active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors duration-500 ${
                  done ? "bg-emerald-400" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 1 — Address
═══════════════════════════════════════════════════════════════ */
function StepAddress({
  addresses,
  value,
  onChange,
  error,
}: {
  addresses: Address[];
  value: string;
  onChange: (id: string, phone?: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-4">
      <StepHeading icon={MapPin} title="انتخاب آدرس تحویل" step={1} />

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <MapPin size={36} className="mx-auto mb-3 text-muted-foreground/50" />
          <p className="mb-4 text-sm text-muted-foreground">آدرسی ذخیره نشده است</p>
          <Link
            href="/account/addresses"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={15} />
            افزودن آدرس جدید
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 bg-card p-4 transition-all duration-200 ${
                value === addr.id
                  ? "border-primary bg-primary/3 shadow-sm shadow-primary/10"
                  : "border-border hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <input
                type="radio"
                name="addressId"
                value={addr.id}
                checked={value === addr.id}
                onChange={() => onChange(addr.id, addr.phone)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      پیش‌فرض
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {addr.province}، {addr.city}
                </p>
                <p className="text-sm text-muted-foreground">{addr.street}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>📱 {addr.phone}</span>
                  <span>📮 {addr.postalCode}</span>
                </div>
              </div>
            </label>
          ))}

          <Link
            href="/account/addresses"
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <Plus size={15} />
            افزودن آدرس جدید
          </Link>
        </div>
      )}

      {error && <FieldError msg={error} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 2 — Contact info
═══════════════════════════════════════════════════════════════ */
function StepContact({
  phone, email, notes,
  onPhone, onEmail, onNotes,
  errors,
  coupon,
  onCouponCodeChange,
  onValidateCoupon,
  onClearCoupon,
}: {
  phone: string; email: string; notes: string;
  onPhone: (v: string) => void;
  onEmail: (v: string) => void;
  onNotes: (v: string) => void;
  errors: FieldErrors;
  coupon: CouponState;
  onCouponCodeChange: (v: string) => void;
  onValidateCoupon: (subtotal: number) => void;
  onClearCoupon: () => void;
}) {
  return (
    <div className="space-y-5">
      <StepHeading icon={Phone} title="اطلاعات تماس" step={2} />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
        {/* mobile */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            شماره موبایل
            <span className="me-1 text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            dir="ltr"
            className={inputCls(!!errors.phone)}
          />
          <p className="text-xs text-muted-foreground">
            برای اطلاع‌رسانی وضعیت سفارش استفاده می‌شود
          </p>
          {errors.phone && <FieldError msg={errors.phone} />}
        </div>

        {/* email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            ایمیل
            <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="example@email.com"
            dir="ltr"
            className={inputCls(!!errors.email)}
          />
          {errors.email && <FieldError msg={errors.email} />}
        </div>

        {/* notes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            یادداشت برای سفارش
            <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            placeholder="مثلاً: زنگ نزنید، فقط پیامک بدید"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-end text-[11px] text-muted-foreground">{notes.length}/۵۰۰</p>
        </div>
      </div>

      {/* ── Coupon code ── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">کد تخفیف</h3>
          <span className="text-xs text-muted-foreground">(اختیاری)</span>
        </div>

        {coupon.status === "applied" ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              <span>
                <code className="font-bold">{coupon.code}</code>
                {" — "}{coupon.message}
              </span>
            </div>
            <button
              onClick={onClearCoupon}
              className="text-xs text-emerald-600 underline hover:text-emerald-800"
            >
              حذف
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon.code}
              onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
              placeholder="کد تخفیف را وارد کنید"
              dir="ltr"
              className={`flex-1 rounded-xl border ${
                coupon.status === "error" ? "border-red-400" : "border-border"
              } bg-background px-3 py-2.5 text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20`}
            />
            <button
              onClick={() => onValidateCoupon(0)}
              disabled={!coupon.code.trim() || coupon.status === "validating"}
              className="shrink-0 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
            >
              {coupon.status === "validating" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                "اعمال"
              )}
            </button>
          </div>
        )}

        {coupon.status === "error" && (
          <p className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle size={12} />
            {coupon.message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 3 — Review & confirm
═══════════════════════════════════════════════════════════════ */
function StepReview({
  form,
  selectedAddress,
  isSubmitting,
}: {
  form: FormState;
  selectedAddress: Address | undefined;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-4">
      <StepHeading icon={ClipboardList} title="بررسی و تأیید سفارش" step={3} />

      {/* address summary */}
      <ReviewCard title="آدرس تحویل" icon="📍">
        {selectedAddress ? (
          <div className="space-y-0.5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{selectedAddress.fullName}</p>
            <p>{selectedAddress.province}، {selectedAddress.city}</p>
            <p>{selectedAddress.street}</p>
            <p>کد پستی: {selectedAddress.postalCode}</p>
          </div>
        ) : (
          <p className="text-sm text-red-500">آدرسی انتخاب نشده است</p>
        )}
      </ReviewCard>

      {/* contact summary */}
      <ReviewCard title="اطلاعات تماس" icon="📞">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">موبایل:</span>
            <span dir="ltr" className="font-medium text-foreground">{form.phone}</span>
          </div>
          {form.email && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-muted-foreground">ایمیل:</span>
              <span dir="ltr" className="font-medium text-foreground">{form.email}</span>
            </div>
          )}
          {form.notes && (
            <div className="flex items-start gap-2">
              <span className="w-16 shrink-0 text-muted-foreground">یادداشت:</span>
              <span className="font-medium text-foreground">{form.notes}</span>
            </div>
          )}
        </div>
      </ReviewCard>

      {/* info box */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
        <p>
          پس از تأیید، سفارش شما ثبت می‌شود و به درگاه پرداخت هدایت خواهید شد.
          هر کتاب یک نسخه منحصربه‌فرد است — موجودی بلافاصله رزرو می‌گردد.
        </p>
      </div>

      {isSubmitting && (
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-primary/5 py-4 text-sm text-primary">
          <Loader2 size={18} className="animate-spin" />
          در حال ثبت سفارش، لطفاً صبر کنید…
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Step 4 — Payment (mock)
═══════════════════════════════════════════════════════════════ */
function StepPayment({
  state,
  onPay,
}: {
  state: "idle" | "loading" | "success";
  onPay: () => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeading icon={CreditCard} title="پرداخت" step={4} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center space-y-5">
        {state === "idle" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/8 ring-8 ring-primary/4">
              <CreditCard size={36} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">آماده پرداخت</h3>
              <p className="text-sm text-muted-foreground">
                سفارش شما ثبت شد. برای تکمیل خرید، پرداخت را انجام دهید.
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
              <p>🔒 اتصال امن SSL</p>
              <p>💳 پرداخت از طریق درگاه بانکی</p>
            </div>
            <button
              onClick={onPay}
              className="w-full rounded-2xl bg-emerald-600 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              پرداخت و تکمیل سفارش
            </button>
          </>
        )}

        {state === "loading" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/8 ring-8 ring-primary/4">
              <Loader2 size={36} className="animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">در حال پردازش پرداخت…</h3>
              <p className="text-sm text-muted-foreground">
                لطفاً صفحه را نبندید. این فرآیند چند ثانیه طول می‌کشد.
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "70%" }} />
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-emerald-700">پرداخت موفق!</h3>
              <p className="text-sm text-muted-foreground">در حال انتقال به صفحه تأیید…</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── shared sub-components ─────────────────────────────────── */

function StepHeading({
  icon: Icon,
  title,
  step,
}: {
  icon: typeof MapPin;
  title: string;
  step: Step;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
        <Icon size={18} className="text-primary" />
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <span className="ms-auto rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
        مرحله {step} از ۴
      </span>
    </div>
  );
}

function ReviewCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
      <AlertCircle size={12} />
      {msg}
    </p>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-red-400 focus:ring-red-200" : "border-border focus:ring-primary/20"
  } bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2`;
}
