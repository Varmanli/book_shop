"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, signInWithGoogleAction } from "@/actions/auth.actions";
import { PasswordInput } from "./password-input";
import { FormError, FormSuccess } from "./form-status";
import type { ApiResponse } from "@/types/api";
import { getSafeRedirectTo } from "@/lib/auth-utils";

const initialState: ApiResponse<null> = { success: false, error: "" };

interface Props {
  googleConfigured: boolean;
}

/* ── SVG icons ────────────────────────────────────────────── */
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-muted-foreground">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function LoginForm({ googleConfigured }: Props) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeRedirectTo(searchParams.get("callbackUrl"));
  const redirected = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const actionError = !state.success ? state.error : null;
  const authError = searchParams.get("error");
  const authErrorMessage = authError
    ? authError === "CredentialsSignin"
      ? "ایمیل یا رمز عبور صحیح نیست"
      : "ورود با Google انجام نشد. لطفاً دوباره تلاش کنید"
    : null;
  const errorMessage = pending ? null : actionError ?? authErrorMessage;
  const hasError = !!errorMessage;

  /* Redirect on success */
  useEffect(() => {
    if (state.success && !redirected.current) {
      redirected.current = true;
      router.push(callbackUrl);
      router.refresh();
    }
  }, [state.success, callbackUrl, router]);

  /* Shake animation on error */
  useEffect(() => {
    if (hasError && formRef.current) {
      formRef.current.classList.remove("animate-shake");
      void formRef.current.offsetWidth; // reflow
      formRef.current.classList.add("animate-shake");
    }
  }, [hasError, state]);

  return (
    <div className="space-y-5">
      <form ref={formRef} action={action} className="space-y-5" noValidate>
        <style>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            20%,60%{transform:translateX(-5px)}
            40%,80%{transform:translateX(5px)}
          }
          .animate-shake { animation: shake 0.4s ease; }
        `}</style>
        <input type="hidden" name="redirectTo" value={callbackUrl} />

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
            className="w-full rounded-xl border border-border bg-background py-3 pe-4 ps-10 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2">
            <MailIcon />
          </span>
        </div>
        </div>

        {/* Password */}
        <PasswordInput
        name="password"
        id="password"
        label="رمز عبور"
        autoComplete="current-password"
        required
        placeholder="رمز عبور خود را وارد کنید"
        />

        {/* Remember me + forgot */}
        <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground select-none">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-border accent-primary"
          />
          مرا به خاطر بسپار
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary transition hover:underline"
        >
          فراموشی رمز؟
        </Link>
        </div>

        {/* Error message */}
        <FormSuccess
          message={
            searchParams.get("registered") === "1"
              ? "ثبت‌نام انجام شد. لطفاً وارد حساب خود شوید."
              : null
          }
        />
        <FormError message={errorMessage} />

        {/* Submit — shimmer gradient button */}
        <button
        type="submit"
        disabled={pending}
        className="btn-shimmer relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:[animation:none]"
        >
        {state.success ? (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 9l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ورود موفق!
          </>
        ) : pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            در حال ورود...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M7 11l4-3-4-3M1 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ورود به حساب
          </>
        )}
        </button>
      </form>

      {/* Google */}
      {googleConfigured && (
        <>
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">یا ورود با</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <form action={signInWithGoogleAction}>
            <input type="hidden" name="redirectTo" value={callbackUrl} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-muted hover:shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              ادامه با Google
            </button>
          </form>
        </>
      )}
    </div>
  );
}
