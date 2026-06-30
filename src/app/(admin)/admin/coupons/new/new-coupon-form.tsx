"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCouponAction } from "@/actions/coupon.actions";

export function NewCouponForm() {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(createCouponAction, {
    success: false as const,
    error: "",
  });
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");

  useEffect(() => {
    if (state.success) {
      toast.success("کد تخفیف با موفقیت ایجاد شد");
      router.push("/admin/coupons");
    }
    if (!state.success && state.error) toast.error(state.error);
  }, [state, router]);

  const fieldError = (key: string) =>
    state.success === false &&
    "fieldErrors" in state &&
    (state as any).fieldErrors?.[key]?.[0];

  const inputCls = (key: string) =>
    `w-full rounded-xl border ${
      fieldError(key) ? "border-red-400" : "border-border"
    } bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20`;

  return (
    <form action={dispatch} className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground">اطلاعات کد تخفیف</h2>

        {/* Code */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            کد تخفیف <span className="text-red-500">*</span>
          </label>
          <input
            name="code"
            type="text"
            placeholder="مثال: SUMMER20"
            dir="ltr"
            className={inputCls("code")}
          />
          <p className="text-xs text-muted-foreground">
            فقط حروف انگلیسی، اعداد، خط تیره و زیرخط. به‌صورت خودکار به حروف بزرگ تبدیل می‌شود.
          </p>
          {fieldError("code") && (
            <p className="text-xs text-red-500">{fieldError("code")}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            نوع تخفیف <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {(["PERCENT", "FIXED"] as const).map((t) => (
              <label
                key={t}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition ${
                  type === t
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:border-border/80"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  checked={type === t}
                  onChange={() => setType(t)}
                  className="sr-only"
                />
                {t === "PERCENT" ? "درصدی (٪)" : "مقداری (ریال)"}
              </label>
            ))}
          </div>
        </div>

        {/* Value */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            مقدار تخفیف <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              name="value"
              type="number"
              min={1}
              max={type === "PERCENT" ? 100 : undefined}
              placeholder={type === "PERCENT" ? "۲۰" : "۵۰۰۰۰۰"}
              dir="ltr"
              className={inputCls("value")}
            />
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {type === "PERCENT" ? "٪" : "ریال"}
            </span>
          </div>
          {fieldError("value") && (
            <p className="text-xs text-red-500">{fieldError("value")}</p>
          )}
        </div>

        {/* Min order amount */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            حداقل مبلغ سفارش (ریال)
            <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
          </label>
          <input
            name="minOrderAmount"
            type="number"
            min={0}
            defaultValue={0}
            dir="ltr"
            className={inputCls("minOrderAmount")}
          />
        </div>

        {/* Max discount (for PERCENT type) */}
        {type === "PERCENT" && (
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">
              سقف تخفیف (ریال)
              <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
            </label>
            <input
              name="maxDiscount"
              type="number"
              min={1}
              placeholder="بدون سقف"
              dir="ltr"
              className={inputCls("maxDiscount")}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-foreground">محدودیت‌ها</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Usage limit */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">
              تعداد استفاده مجاز
              <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
            </label>
            <input
              name="usageLimit"
              type="number"
              min={1}
              placeholder="نامحدود"
              dir="ltr"
              className={inputCls("usageLimit")}
            />
          </div>

          {/* Expiry date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">
              تاریخ انقضا
              <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
            </label>
            <input
              name="expiresAt"
              type="date"
              dir="ltr"
              className={inputCls("expiresAt")}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            توضیحات داخلی
            <span className="me-1 text-xs font-normal text-muted-foreground">(اختیاری)</span>
          </label>
          <input
            name="description"
            type="text"
            placeholder="مثال: تخفیف کمپین تابستان ۱۴۰۳"
            className={inputCls("description")}
          />
        </div>

        {/* Active toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <input name="isActive" type="checkbox" defaultChecked value="true" className="h-4 w-4 accent-primary" />
          <span className="text-sm font-medium text-foreground">کد فعال باشد</span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : "ایجاد کد تخفیف"}
        </button>
        <a href="/admin/coupons" className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
          انصراف
        </a>
      </div>
    </form>
  );
}
