"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction, changePasswordAction } from "@/actions/user.actions";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    hasPassword: boolean;
  };
}

const initState = { success: false as const, error: "" };

export function SettingsClient({ user }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, initState);
  const [pwState, pwAction, pwPending] = useActionState(changePasswordAction, initState);

  useEffect(() => {
    if (profileState.success) toast.success("پروفایل به‌روزرسانی شد");
    if (!profileState.success && profileState.error) toast.error(profileState.error);
  }, [profileState]);

  useEffect(() => {
    if (pwState.success) toast.success("رمز عبور تغییر یافت");
    if (!pwState.success && pwState.error) toast.error(pwState.error);
  }, [pwState]);

  const pfe = (!profileState.success ? (profileState as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined) ?? {} as Record<string, string[]>;
  const wfe = (!pwState.success ? (pwState as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  function inputCls(err?: string) {
    return `w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
      err
        ? "border-destructive bg-destructive/5 focus:ring-destructive/20"
        : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
    }`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">تنظیمات حساب</h1>
        <p className="mt-1 text-sm text-muted-foreground">اطلاعات شخصی و امنیت حساب</p>
      </div>

      {/* Profile section */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-base font-bold text-foreground">اطلاعات شخصی</h2>
        <form action={profileAction} className="space-y-4">
          {/* Avatar */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-extrabold text-primary ring-2 ring-primary/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-semibold text-foreground">
              نام و نام خانوادگی <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={user.name}
              className={inputCls(pfe.name?.[0])}
            />
            {pfe.name && <p className="text-xs text-destructive">{pfe.name[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">ایمیل</label>
            <input
              type="email"
              value={user.email}
              disabled
              dir="ltr"
              className="w-full cursor-not-allowed rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">ایمیل قابل تغییر نیست</p>
          </div>

          {profileState.success && (
            <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              ✓ پروفایل با موفقیت ذخیره شد
            </p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {profilePending ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </form>
      </section>

      {/* Password section */}
      {user.hasPassword && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-foreground">تغییر رمز عبور</h2>
          <form action={pwAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-foreground">
                رمز عبور فعلی <span className="text-destructive">*</span>
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                dir="ltr"
                className={inputCls(wfe.currentPassword?.[0])}
              />
              {wfe.currentPassword && <p className="text-xs text-destructive">{wfe.currentPassword[0]}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-foreground">
                  رمز عبور جدید <span className="text-destructive">*</span>
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  dir="ltr"
                  className={inputCls(wfe.newPassword?.[0])}
                />
                {wfe.newPassword && <p className="text-xs text-destructive">{wfe.newPassword[0]}</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-foreground">
                  تکرار رمز جدید <span className="text-destructive">*</span>
                </label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  required
                  dir="ltr"
                  className={inputCls(wfe.confirmNewPassword?.[0])}
                />
                {wfe.confirmNewPassword && <p className="text-xs text-destructive">{wfe.confirmNewPassword[0]}</p>}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              رمز عبور باید حداقل ۸ کاراکتر، یک حرف بزرگ انگلیسی و یک عدد داشته باشد
            </p>

            {pwState.success && (
              <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                ✓ رمز عبور با موفقیت تغییر یافت
              </p>
            )}

            <button
              type="submit"
              disabled={pwPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {pwPending ? "در حال تغییر..." : "تغییر رمز عبور"}
            </button>
          </form>
        </section>
      )}

      {!user.hasPassword && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-base font-bold text-foreground">رمز عبور</h2>
          <p className="text-sm text-muted-foreground">
            حساب شما از طریق Google ایجاد شده است و رمز عبور ندارد.
          </p>
        </section>
      )}
    </div>
  );
}
