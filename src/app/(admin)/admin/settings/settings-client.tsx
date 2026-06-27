"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateSettingsAction } from "@/actions/settings.actions";

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
            <InputField
              label="لوگو (URL)"
              name="logo"
              type="url"
              defaultValue={settings.logo as string}
              dir="ltr"
              placeholder="https://..."
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
