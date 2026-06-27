"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { submitReviewAction } from "@/actions/review.actions";

interface Props {
  bookId: string;
  hasReviewed: boolean;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((s) => {
        const active = s <= (hover || value);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`text-2xl transition-transform hover:scale-110 ${
              active ? "text-amber-400" : "text-muted-foreground/30"
            }`}
            aria-label={`امتیاز ${s}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({ bookId, hasReviewed }: Props) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [state, dispatch, pending] = useActionState(submitReviewAction, {
    success: false as const,
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      setSubmitted(true);
      toast.success("نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود");
    }
    if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  if (hasReviewed || submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 text-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-emerald-500" aria-hidden>
          <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity=".12" />
          <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm font-semibold text-emerald-700">نظر شما ثبت شده است</p>
        <p className="text-xs text-emerald-600">پس از بررسی توسط مدیران نمایش داده می‌شود</p>
      </div>
    );
  }

  const fe = (!state.success ? (state as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground">
          امتیاز شما <span className="text-destructive">*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
        {fe.rating && <p className="text-xs text-destructive">{fe.rating[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-title" className="block text-sm font-semibold text-foreground">
          عنوان نظر <span className="text-muted-foreground text-xs">(اختیاری)</span>
        </label>
        <input
          id="review-title"
          name="title"
          type="text"
          maxLength={100}
          placeholder="خلاصه نظر شما..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {fe.title && <p className="text-xs text-destructive">{fe.title[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-content" className="block text-sm font-semibold text-foreground">
          متن نظر <span className="text-destructive">*</span>
        </label>
        <textarea
          id="review-content"
          name="content"
          rows={4}
          required
          minLength={10}
          maxLength={2000}
          placeholder="تجربه خواندن این کتاب را با دیگران به اشتراک بگذارید..."
          className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
            fe.content
              ? "border-destructive bg-destructive/5 focus:ring-destructive/20"
              : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
          }`}
        />
        {fe.content && <p className="text-xs text-destructive">{fe.content[0]}</p>}
      </div>

      {!state.success && (state as { error?: string }).error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {(state as { error: string }).error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            در حال ثبت...
          </>
        ) : (
          "ثبت نظر"
        )}
      </button>
      {rating === 0 && (
        <p className="text-xs text-muted-foreground">برای ثبت نظر ابتدا امتیاز بدهید</p>
      )}
    </form>
  );
}
