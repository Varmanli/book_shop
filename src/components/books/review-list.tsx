import Link from "next/link";
import { findReviewsByBook, findUserReviewForBook } from "@/repositories/reviews.repository";
import { getCurrentUserId } from "@/lib/session";
import { ReviewForm } from "./review-form";
import { StarRating } from "./review-summary";

interface Props {
  bookId: string;
  page?: number;
}

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "همین لحظه";
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} روز پیش`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} ماه پیش`;
  return date.toLocaleDateString("fa-IR");
}

export async function ReviewList({ bookId, page = 1 }: Props) {
  const userId = await getCurrentUserId();

  const [{ items, meta, averageRating, totalApproved }, hasReviewed] =
    await Promise.all([
      findReviewsByBook(bookId, { page, pageSize: 5 }),
      userId
        ? findUserReviewForBook(userId, bookId).then((r) => !!r)
        : Promise.resolve(false),
    ]);

  return (
    <div className="space-y-8">
      {/* ── Summary row ───────────────────────────────────── */}
      {totalApproved > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5">
          {/* Average score */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl font-black tabular-nums text-amber-500">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </div>
            <div>
              <StarRating rating={averageRating} size="lg" />
              <p className="mt-1 text-sm text-muted-foreground">
                بر اساس{" "}
                <span className="font-semibold text-foreground">
                  {totalApproved.toLocaleString("fa-IR")}
                </span>{" "}
                نظر تأیید شده
              </p>
            </div>
          </div>

          <a
            href="#review-form"
            className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/10"
          >
            ثبت نظر شما
          </a>
        </div>
      )}

      {/* ── Review cards ──────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex gap-1.5 text-muted-foreground/20">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
                <path
                  d="M14 2.5l2.8 5.7 6.2.9-4.5 4.4 1.1 6.3L14 16.7l-5.6 2.9 1.1-6.3-4.5-4.4 6.2-.9z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            ))}
          </div>
          <div>
            <p className="text-base font-bold text-foreground">هنوز نظری ثبت نشده است</p>
            <p className="mt-1 text-sm text-muted-foreground">اولین نفری باشید که نظر می‌دهید</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-3.5">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-bold text-primary">
                  {review.user.name?.charAt(0) ?? "؟"}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {review.user.name ?? "کاربر ناشناس"}
                    </span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      · {timeAgo(new Date(review.createdAt))}
                    </span>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <p className="text-sm font-semibold text-foreground">{review.title}</p>
                  )}

                  {/* Body */}
                  <p className="text-sm leading-7 text-foreground/75">{review.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────── */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {meta.hasPrevPage && (
            <Link
              href={`?reviewPage=${page - 1}#reviews`}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              ‹ صفحه قبل
            </Link>
          )}
          <span className="rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground">
            {page.toLocaleString("fa-IR")} از {meta.totalPages.toLocaleString("fa-IR")}
          </span>
          {meta.hasNextPage && (
            <Link
              href={`?reviewPage=${page + 1}#reviews`}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              صفحه بعد ›
            </Link>
          )}
        </div>
      )}

      {/* ── Review form ───────────────────────────────────── */}
      <div id="review-form" className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-5 py-4">
          <h3 className="text-sm font-extrabold text-foreground">نظر خود را ثبت کنید</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            تجربه خواندن این کتاب را با دیگران به اشتراک بگذارید
          </p>
        </div>
        <div className="p-5">
          {userId ? (
            <ReviewForm bookId={bookId} hasReviewed={hasReviewed} />
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">برای ثبت نظر وارد شوید</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  با ثبت نظر به دیگران در انتخاب کتاب کمک کنید
                </p>
              </div>
              <Link
                href="/auth/login"
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md"
              >
                ورود به حساب کاربری
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
