import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  findBookBySlug,
  findRelatedBooks,
} from "@/repositories/book.repository";
import { findWishlistItem } from "@/repositories/wishlist.repository";
import { findReviewsByBook } from "@/repositories/reviews.repository";
import { getCurrentUserId } from "@/lib/session";
import { displayPrice } from "@/lib/currency";
import { BookDetailClient } from "@/components/books/book-detail-client";
import { LightboxImage } from "@/components/books/lightbox-image";
import { RelatedCarousel } from "@/components/books/related-carousel";
import { ReviewList } from "@/components/books/review-list";
import { ReviewSummary } from "@/components/books/review-summary";
import { BookCardSkeleton } from "@/components/books/listing-book-card";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ reviewPage?: string }>;
type Props = { params: Params; searchParams: SearchParams };

const QUALITY_CONFIG: Record<
  string,
  { label: string; cls: string; dot: string; desc: string }
> = {
  "Like New": {
    label: "مثل نو",
    cls: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    desc: "کتاب در حالت کاملاً بکر، بدون هیچ‌گونه خط‌خوردگی یا آسیب",
  },
  "Very Good": {
    label: "خیلی خوب",
    cls: "bg-sky-100 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    desc: "استفاده اندک با حداقل علائم کاربری",
  },
  Good: {
    label: "خوب",
    cls: "bg-amber-100 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    desc: "آثار استفاده عادی وجود دارد، محتوا کامل است",
  },
  Acceptable: {
    label: "قابل قبول",
    cls: "bg-rose-100 text-rose-700 ring-rose-200",
    dot: "bg-rose-400",
    desc: "ممکن است یادداشت یا خط‌خوردگی داشته باشد، محتوا کامل است",
  },
};

const LANG_MAP: Record<string, string> = {
  Persian: "فارسی",
  Arabic: "عربی",
  English: "انگلیسی",
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await findBookBySlug(slug);
  if (!book) return { title: "کتاب یافت نشد" };
  const description = book.description.slice(0, 160);
  const image = book.images?.[0];
  return {
    title: `${book.title} | کتاب‌فروشی`,
    description,
    keywords: [
      book.title,
      book.author,
      book.publisher,
      book.category?.name ?? "",
      ...book.bookGenres.map((bg) => bg.genre.name),
    ].filter(Boolean),
    openGraph: {
      title: book.title,
      description,
      ...(image && {
        images: [{ url: image, width: 400, height: 560, alt: book.title }],
      }),
      type: "website",
    },
  };
}

/* ── Main async content ─────────────────────────────────── */
async function BookDetailContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const reviewPage = Math.max(1, Number(sp.reviewPage ?? 1));

  const [book, userId] = await Promise.all([
    findBookBySlug(slug),
    getCurrentUserId(),
  ]);
  if (!book) notFound();

  const [isInWishlist, { averageRating, totalApproved }, related] =
    await Promise.all([
      userId
        ? findWishlistItem(userId, book.id).then((r) => !!r)
        : Promise.resolve(false),
      findReviewsByBook(book.id, { page: 1, pageSize: 1 }),
      findRelatedBooks(book.id, book.categoryId, 8),
    ]);

  const quality = QUALITY_CONFIG[book.qualityGrade] ?? {
    label: book.qualityGrade,
    cls: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground",
    desc: "",
  };
  const coverImage =
    book.images?.[0] ??
    `https://picsum.photos/seed/book-${book.id.slice(0, 8)}/400/560`;
  const additionalImages = (book.images ?? []).slice(1).filter(Boolean);

  return (
    <div className="space-y-12">
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="مسیر"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          خانه
        </Link>
        <Chevron />
        <Link href="/books" className="transition-colors hover:text-foreground">
          کتاب‌ها
        </Link>
        {book.category && (
          <>
            <Chevron />
            <Link
              href={`/books?category=${book.category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {book.category.name}
            </Link>
          </>
        )}
        <Chevron />
        <span className="line-clamp-1 font-medium text-foreground">
          {book.title}
        </span>
      </nav>

      {/* ── Hero: image (right) + details (left) ──────────── */}
      <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* ── Image panel (sticky on lg+) ─────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-3">
          <LightboxImage
            src={coverImage}
            alt={book.title}
            additionalImages={additionalImages}
            priority
          />
          {book.isFeatured && (
            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="currentColor"
                aria-hidden
              >
                <path d="M6.5 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L6.5 9.3 3.3 11l.6-3.6L1.3 4.8l3.6-.5z" />
              </svg>
              کتاب منتخب هفته
            </div>
          )}
          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3">
            <div className="flex flex-col items-center gap-1 text-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-emerald-500"
                aria-hidden
              >
                <path
                  d="M10 2l2 5h5l-4 3 1.5 5L10 12l-4.5 3L7 10 3 7h5z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] text-muted-foreground leading-tight">
                ضمانت کیفیت
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-primary"
                aria-hidden
              >
                <path
                  d="M3 8h14M3 8l2-4h10l2 4M3 8v7a1 1 0 001 1h12a1 1 0 001-1V8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[10px] text-muted-foreground leading-tight">
                بسته‌بندی مطمئن
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-sky-500"
                aria-hidden
              >
                <path
                  d="M2 10l4-6h8l4 6-4 6H6z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <span className="text-[10px] text-muted-foreground leading-tight">
                ارسال سریع
              </span>
            </div>
          </div>
        </div>

        {/* ── Details panel ───────────────────────────────── */}
        <div className="space-y-6">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${quality.cls}`}
              title={quality.desc}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${quality.dot}`} />
              {quality.label}
            </span>
            {book.category && (
              <Link
                href={`/books?category=${book.category.slug}`}
                className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
              >
                {book.category.name}
              </Link>
            )}
          </div>

          {/* Title + author */}
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold leading-snug text-foreground md:text-3xl lg:text-[2rem]">
              {book.title}
            </h1>
            {book.translator && (
              <p className="text-sm text-muted-foreground">
                ترجمه:{" "}
                <span className="font-medium text-foreground">
                  {book.translator}
                </span>
              </p>
            )}
            <p className="text-base font-semibold text-primary">
              {book.author}
            </p>
          </div>

          {/* Rating */}
          {totalApproved > 0 && (
            <a
              href="#reviews"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 transition hover:bg-amber-100"
            >
              <ReviewSummary
                averageRating={averageRating}
                totalReviews={totalApproved}
                compact
              />
            </a>
          )}

          {/* ── Price block ─────────────────────────────── */}
          <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-primary/2 to-transparent p-5 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black tracking-tight text-foreground">
                {displayPrice(book.price)}
              </span>
            </div>
          </div>

          {/* Quality note */}
          {quality.desc && (
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                className="mt-0.5 shrink-0 text-muted-foreground"
                aria-hidden
              >
                <circle
                  cx="7.5"
                  cy="7.5"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M7.5 6.5v4M7.5 5v.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">
                  کیفیت {quality.label}:{" "}
                </span>
                {quality.desc}
              </p>
            </div>
          )}

          {/* ── Interactive: availability + cart + wishlist ─ */}
          <BookDetailClient
            bookId={book.id}
            price={book.price}
            isLoggedIn={!!userId}
            initialInWishlist={isInWishlist}
            isSold={book.isSold}
          />

          {/* ── Metadata grid ───────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                مشخصات کتاب
              </h3>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3">
              <MetaItem
                icon={<PublisherIcon />}
                label="ناشر"
                value={book.publisher}
              />
              {book.publishedYear && (
                <MetaItem
                  icon={<CalendarIcon />}
                  label="سال انتشار"
                  value={String(book.publishedYear)}
                  ltr
                />
              )}
              {book.pageCount && (
                <MetaItem
                  icon={<PagesIcon />}
                  label="تعداد صفحات"
                  value={book.pageCount.toLocaleString("fa-IR")}
                />
              )}
              {book.isbn && (
                <MetaItem
                  icon={<IsbnIcon />}
                  label="شابک"
                  value={book.isbn}
                  ltr
                  mono
                />
              )}
              <MetaItem
                icon={<LanguageIcon />}
                label="زبان"
                value={LANG_MAP[book.language] ?? book.language}
              />
              <MetaItem
                icon={<IdIcon />}
                label="کد محصول"
                value={book.id.slice(0, 8).toUpperCase()}
                ltr
                mono
                small
              />
            </dl>
          </div>

          {/* Genre chips */}
          {book.bookGenres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                ژانرها:
              </span>
              {book.bookGenres.map(({ genre }) => (
                <Link
                  key={genre.id}
                  href={`/books?genre=${genre.id}`}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────── */}
      {book.description && (
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <h2 className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <span className="h-5 w-1 rounded-full bg-primary" />
              درباره این کتاب
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="whitespace-pre-wrap text-sm leading-8 text-foreground/80">
              {book.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Reviews ─────────────────────────────────────────── */}
      <section
        id="reviews"
        className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      >
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
            <span className="h-5 w-1 rounded-full bg-primary" />
            نظرات کاربران
          </h2>
        </div>
        <div className="p-6">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
            }
          >
            <ReviewList bookId={book.id} page={reviewPage} />
          </Suspense>
        </div>
      </section>

      {/* ── Related books ───────────────────────────────────── */}
      {related.length > 0 && (
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <RelatedCarousel books={related} />
        </Suspense>
      )}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────── */
function PublisherIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="2"
        width="11"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 5h5M4.5 7h5M4.5 9h3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="2.5"
        width="11"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 1.5v2M9.5 1.5v2M1.5 5.5h11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function PagesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 2a1 1 0 011-1h7a1 1 0 011 1v10a1 1 0 01-1 1h-7a1 1 0 01-1-1V2z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 5h5M4.5 7.5h5M4.5 10h3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IsbnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 2v10M5.5 2v10M8 2v10M10.5 2v6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8 10.5l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function LanguageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M7 1.5C5.5 3.5 5.5 10.5 7 12.5M7 1.5C8.5 3.5 8.5 10.5 7 12.5M1.5 7h11"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IdIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="3"
        width="11"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="5" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 5.5h3M8 7h2M8 8.5h3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── MetaItem ───────────────────────────────────────────── */
function MetaItem({
  icon,
  label,
  value,
  ltr,
  mono,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 bg-card px-4 py-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground/70">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd
          className={`mt-0.5 font-semibold text-foreground truncate ${mono ? "font-mono" : ""} ${small ? "text-[11px]" : "text-sm"}`}
          dir={ltr ? "ltr" : undefined}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

/* ── Chevron ────────────────────────────────────────────── */
function Chevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0 rotate-180"
    >
      <path
        d="M7.5 2.5l-3 3.5 3 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Page shell ─────────────────────────────────────────── */
export default function BookDetailPage({ params, searchParams }: Props) {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<BookDetailSkeleton />}>
        <BookDetailContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function BookDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="h-5 w-72 rounded-lg bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-3">
          <div className="aspect-3/4 rounded-2xl bg-muted" />
          <div className="h-10 rounded-xl bg-muted" />
        </div>
        <div className="space-y-5">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-lg bg-muted" />
            <div className="h-6 w-24 rounded-lg bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-9 w-3/4 rounded-lg bg-muted" />
            <div className="h-5 w-1/3 rounded-lg bg-muted" />
          </div>
          <div className="h-28 rounded-2xl bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
          <div className="h-36 rounded-2xl bg-muted" />
        </div>
      </div>
      <div className="h-48 rounded-2xl bg-muted" />
      <div className="h-60 rounded-2xl bg-muted" />
    </div>
  );
}
