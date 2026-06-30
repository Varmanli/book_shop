"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, Info } from "lucide-react";
import { updateSettingsAction } from "@/actions/settings.actions";
import { ImageUploader, type UploadedFile } from "@/components/ui/image-uploader";

interface Props {
  settings: Record<string, unknown>;
}

type State = { success: false; error: string };

function InputField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  dir,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  dir?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        dir={dir}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

export function AdminSettingsClient({ settings }: Props) {
  const [state, dispatch, pending] = useActionState(updateSettingsAction, { success: false as const, error: "" });

  useEffect(() => {
    if (state.success) toast.success("تنظیمات ذخیره شد");
    if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  const social = (settings.socialLinks as { instagram?: string; telegram?: string; twitter?: string } | null) ?? {};
  const [logo, setLogo] = useState<UploadedFile | null>(
    settings.logo ? { url: settings.logo as string } : null
  );

  const storedThreshold = settings.freeShippingThreshold;
  const [thresholdEnabled, setThresholdEnabled] = useState(
    storedThreshold !== null && storedThreshold !== undefined
  );

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">تنظیمات سایت</h1>
        <p className="mt-1 text-sm text-muted-foreground">اطلاعات و پیکربندی سایت</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Store info */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">اطلاعات فروشگاه</h2>
          <div className="space-y-4">
            <InputField
              label="نام فروشگاه"
              name="storeName"
              defaultValue={settings.storeName as string}
              placeholder="کتاب‌فروشی"
            />
            <input type="hidden" name="logo" value={logo?.url ?? ""} />
            <ImageUploader
              label="لوگو"
              context="logo"
              aspectRatio="square"
              value={logo}
              onChange={setLogo}
              maxSizeMB={2}
            />
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">اطلاعات تماس</h2>
          <div className="space-y-4">
            <InputField
              label="ایمیل"
              name="contactEmail"
              type="email"
              defaultValue={settings.contactEmail as string}
              dir="ltr"
              placeholder="info@example.com"
            />
            <InputField
              label="تلفن"
              name="contactPhone"
              defaultValue={settings.contactPhone as string}
              placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">آدرس</label>
              <textarea
                name="contactAddress"
                rows={2}
                defaultValue={settings.contactAddress as string ?? ""}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Social links */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-foreground">شبکه‌های اجتماعی</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            لینک‌های شبکه اجتماعی به صورت JSON ارسال می‌شوند
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">اینستاگرام</label>
              <input
                type="url"
                id="social_instagram"
                defaultValue={social.instagram ?? ""}
                dir="ltr"
                placeholder="https://instagram.com/..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">تلگرام</label>
              <input
                type="url"
                id="social_telegram"
                defaultValue={social.telegram ?? ""}
                dir="ltr"
                placeholder="https://t.me/..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">توییتر</label>
              <input
                type="url"
                id="social_twitter"
                defaultValue={social.twitter ?? ""}
                dir="ltr"
                placeholder="https://twitter.com/..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
              />
            </div>
          </div>
          {/* Hidden field for serialized social links */}
        </section>
      </div>

      {/* ── Shipping Settings ─────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Truck size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">تنظیمات ارسال</h2>
            <p className="text-xs text-muted-foreground">
              هزینه ارسال به‌صورت کامل از اینجا کنترل می‌شود — هیچ مقداری در کد نوشته نشده است
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Base shipping cost */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">
              هزینه پایه ارسال
              <span className="me-1 text-xs font-normal text-muted-foreground">(ریال)</span>
            </label>
            <input
              type="number"
              name="shippingCost"
              min="0"
              step="1000"
              defaultValue={
                typeof settings.shippingCost === "number"
                  ? String(settings.shippingCost)
                  : "350000"
              }
              dir="ltr"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              این مقدار برای همه سفارش‌ها اعمال می‌شود مگر اینکه آستانه رایگان فعال باشد
            </p>
          </div>

          {/* Free-shipping threshold toggle */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">آستانه ارسال رایگان</p>
                <p className="text-xs text-muted-foreground">
                  سفارش‌هایی که از این مبلغ بیشتر باشند ارسال رایگان دریافت می‌کنند
                </p>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={thresholdEnabled}
                onClick={() => setThresholdEnabled((v) => !v)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  thresholdEnabled ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                    thresholdEnabled ? "end-0.5" : "start-0.5"
                  }`}
                />
              </button>
            </label>

            {thresholdEnabled ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                  مبلغ آستانه (ریال)
                </label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  min="0"
                  step="10000"
                  defaultValue={
                    typeof storedThreshold === "number" ? String(storedThreshold) : "5000000"
                  }
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : (
              /* Send empty string so the action clears the threshold */
              <input type="hidden" name="freeShippingThreshold" value="" />
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
            <Info size={13} className="mt-0.5 shrink-0" />
            <span>
              تغییرات بلافاصله برای همه سفارش‌های جدید اعمال می‌شود.
              سفارش‌های ثبت‌شده قبلی تغییری نمی‌کنند.
            </span>
          </div>
        </div>
      </section>

      {state.success && (
        <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          ✓ تنظیمات با موفقیت ذخیره شد
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>
    </form>
  );
}
