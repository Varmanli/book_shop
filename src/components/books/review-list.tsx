import Link from "next/link";
import { findReviewsByBook, findUserReviewForBook } from "@/repositories/reviews.repository";
import { getCurrentUserId } from "@/lib/session";
import { ReviewForm } from "./review-form";
import { ReviewSummary, StarRating } from "./review-summary";

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

  const [{ items, meta, averageRating, totalApproved }, hasReviewed] = await Promise.all([
    findReviewsByBook(bookId, { page, pageSize: 5 }),
    userId ? findUserReviewForBook(userId, bookId).then((r) => !!r) : Promise.resolve(false),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">نظرات کاربران</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalApproved.toLocaleString("fa-IR")} نظر تأیید شده
          </p>
        </div>
        {totalApproved > 0 && (
          <ReviewSummary averageRating={averageRating} totalReviews={totalApproved} />
        )}
      </div>

      {/* Reviews */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex gap-1 text-muted-foreground/20">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4l-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            ))}
          </div>
          <p className="font-semibold text-foreground">هنوز نظری ثبت نشده است</p>
          <p className="text-sm text-muted-foreground">اولین نفری باشید که نظر می‌دهید</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((review) => (
            <div key={review.id} className="py-5">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {review.user.name?.charAt(0) ?? "؟"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {review.user.name ?? "کاربر ناشناس"}
                    </span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(new Date(review.createdAt))}
                    </span>
                  </div>
                  {review.title && (
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{review.title}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">{review.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {meta.hasPrevPage && (
            <Link
              href={`?reviewPage=${page - 1}#reviews`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              ‹ قبلی
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page.toLocaleString("fa-IR")} / {meta.totalPages.toLocaleString("fa-IR")}
          </span>
          {meta.hasNextPage && (
            <Link
              href={`?reviewPage=${page + 1}#reviews`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              بعدی ›
            </Link>
          )}
        </div>
      )}

      {/* Submit form */}
      <div id="review-form" className="rounded-2xl border border-border bg-muted/30 p-5">
        <h3 className="mb-4 text-sm font-extrabold text-foreground">نظر خود را ثبت کنید</h3>
        {userId ? (
          <ReviewForm bookId={bookId} hasReviewed={hasReviewed} />
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-muted-foreground">برای ثبت نظر ابتدا وارد حساب کاربری شوید</p>
            <Link
              href="/auth/login"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              ورود به حساب
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
