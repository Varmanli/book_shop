"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { useEffect } from "react";
import { subscribeNewsletterAction } from "@/actions/newsletter.actions";
import type { ApiResponse } from "@/types/api";
import type { NewsletterSubscriber } from "@/types";

const initialState: ApiResponse<NewsletterSubscriber> = {
  success: false,
  error: "",
};

export function HomeNewsletter() {
  const [state, action, pending] = useActionState(
    subscribeNewsletterAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      toast.success("با موفقیت عضو خبرنامه شدید! 🎉");
    } else if ((state as { error?: string }).error) {
      toast.error((state as { error: string }).error);
    }
  }, [state]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-amber-700 px-4 py-20">
      {/* Decorative patterns */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
        {/* Book spine decorations */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-1 bg-white/5"
            style={{ left: `${10 + i * 16}%` }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        {/* Icon */}
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
          📬
        </div>

        <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
          در جریان آخرین کتاب‌ها باشید
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          هر هفته بهترین کتاب‌های جدید، تخفیف‌های ویژه و توصیه‌های کتابخوانی
          را مستقیم در صندوق ایمیلتان دریافت کنید.
        </p>

        {state.success ? (
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white/20 px-8 py-4 text-white backdrop-blur-sm">
            <span className="text-2xl">✅</span>
            <div className="text-right">
              <p className="font-bold">عضویت موفق!</p>
              <p className="text-xs text-white/75">از این پس اخبار ما را دریافت خواهید کرد.</p>
            </div>
          </div>
        ) : (
          <form action={action} className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="relative flex-1">
                <input
                  type="email"
                  name="email"
                  placeholder="ایمیل خود را وارد کنید..."
                  required
                  dir="ltr"
                  className="w-full rounded-xl border border-white/20 bg-white/15 px-5 py-3.5 text-sm text-white placeholder:text-white/50 backdrop-blur-sm transition focus:border-white/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/25"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="shrink-0 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:scale-105 hover:bg-white/95 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    در حال ثبت...
                  </span>
                ) : (
                  "عضو شو رایگان"
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 flex items-center justify-center gap-6 text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            بدون هرزنامه
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            هر هفته یک ایمیل
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            لغو آسان
          </span>
        </div>
      </div>
    </section>
  );
}
