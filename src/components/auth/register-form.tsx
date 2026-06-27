"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth.actions";
import { PasswordInput } from "./password-input";
import { FormError, FormSuccess } from "./form-status";
import type { ApiResponse } from "@/types/api";

const initialState: ApiResponse<null> = { success: false, error: "" };

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-muted-foreground">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 13.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-muted-foreground">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border py-3 pe-4 ps-10 text-sm text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 ${
    hasError
      ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/20"
      : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
  }`;
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  const router = useRouter();
  const redirected = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && !redirected.current) {
      redirected.current = true;
      router.push("/account");
      router.refresh();
    }
  }, [state.success, router]);

  const fieldErrors =
    !state.success && (state as { fieldErrors?: Record<string, string[]> }).fieldErrors
      ? (state as { fieldErrors: Record<string, string[]> }).fieldErrors
      : {};

  const hasGlobalError =
    !state.success &&
    !!(state as { error?: string }).error &&
    !(state as { fieldErrors?: Record<string, string[]> }).fieldErrors;

  /* Shake on error */
  useEffect(() => {
    if (hasGlobalError && formRef.current) {
      formRef.current.classList.remove("animate-shake");
      void formRef.current.offsetWidth;
      formRef.current.classList.add("animate-shake");
    }
  }, [hasGlobalError, state]);

  return (
    <form ref={formRef} action={action} className="space-y-5" noValidate>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-5px)}
          40%,80%{transform:translateX(5px)}
        }
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-semibold text-foreground">
          نام و نام خانوادگی <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="مثال: علی احمدی"
            className={inputCls(!!fieldErrors.name)}
          />
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2">
            <UserIcon />
          </span>
        </div>
        {fieldErrors.name && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            {fieldErrors.name[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          ایمیل <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            dir="ltr"
            placeholder="example@email.com"
            className={inputCls(!!fieldErrors.email)}
          />
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2">
            <MailIcon />
          </span>
        </div>
        {fieldErrors.email && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            {fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <PasswordInput
        name="password"
        id="password"
        label="رمز عبور"
        autoComplete="new-password"
        required
        placeholder="حداقل ۸ کاراکتر"
        showStrength
        error={fieldErrors.password?.[0]}
        hint="حداقل ۸ کاراکتر، یک حرف بزرگ انگلیسی و یک عدد"
      />

      {/* Confirm Password */}
      <PasswordInput
        name="confirmPassword"
        id="confirmPassword"
        label="تکرار رمز عبور"
        autoComplete="new-password"
        required
        placeholder="رمز عبور را مجدداً وارد کنید"
        error={fieldErrors.confirmPassword?.[0]}
      />

      {/* Terms */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-sm transition hover:border-primary/30 hover:bg-primary/3 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5">
        <input
          type="checkbox"
          name="terms"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
        />
        <span className="leading-relaxed text-muted-foreground">
          با{" "}
          <a href="/terms" target="_blank" className="font-semibold text-primary hover:underline">
            قوانین و مقررات
          </a>{" "}
          و{" "}
          <a href="/terms" target="_blank" className="font-semibold text-primary hover:underline">
            سیاست حریم خصوصی
          </a>{" "}
          موافقم
        </span>
      </label>

      {/* Server messages */}
      {state.success ? (
        <FormSuccess message="ثبت‌نام موفق! در حال ورود به حساب..." />
      ) : (
        <FormError message={hasGlobalError ? (state as { error: string }).error : null} />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:[animation:none]"
      >
        {state.success ? (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 9l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ثبت‌نام موفق!
          </>
        ) : pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            در حال ثبت‌نام...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5zM5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            ایجاد حساب کاربری
          </>
        )}
      </button>
    </form>
  );
}
