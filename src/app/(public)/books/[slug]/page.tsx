import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findBookBySlug, findRelatedBooks } from "@/repositories/book.repository";
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

const QUALITY_CONFIG: Record<string, { label: string; cls: string; desc: string }> = {
  "Like New": { label: "مثل نو", cls: "bg-emerald-100 text-emerald-700 ring-emerald-200", desc: "کتاب در حالت کاملاً بکر، بدون هیچ‌گونه خط‌خوردگی یا آسیب" },
  "Very Good": { label: "خیلی خوب", cls: "bg-sky-100 text-sky-700 ring-sky-200", desc: "استفاده اندک با حداقل علائم کاربری" },
  Good: { label: "خوب", cls: "bg-amber-100 text-amber-700 ring-amber-200", desc: "آثار استفاده عادی وجود دارد، محتوا کامل است" },
  Acceptable: { label: "قابل قبول", cls: "bg-rose-100 text-rose-700 ring-rose-200", desc: "ممکن است یادداشت یا خط‌خوردگی داشته باشد، محتوا کامل است" },
};

const LANG_MAP: Record<string, string> = { Persian: "فارسی", Arabic: "عربی", English: "انگلیسی" };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const book = await findBookBySlug(slug);
  if (!book) return { title: "کتاب یافت نشد" };
  const description = book.description.slice(0, 160);
  const image = book.images?.[0];
  return {
    title: `${book.title} | کتاب‌فروشی`,
    description,
    keywords: [book.title, book.author, book.publisher, book.category?.name ?? "", ...book.bookGenres.map((bg) => bg.genre.name)].filter(Boolean),
    openGraph: {
      title: book.title,
      description,
      ...(image && { images: [{ url: image, width: 400, height: 560, alt: book.title }] }),
      type: "website",
    },
  };
}

/* ── Main async content ─────────────────────────────────── */
async function BookDetailContent({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const reviewPage = Math.max(1, Number(sp.reviewPage ?? 1));

  const [book, userId] = await Promise.all([findBookBySlug(slug), getCurrentUserId()]);
  if (!book) notFound();

  const [isInWishlist, { averageRating, totalApproved }, related] = await Promise.all([
    userId ? findWishlistItem(userId, book.id).then((r) => !!r) : Promise.resolve(false),
    findReviewsByBook(book.id, { page: 1, pageSize: 1 }),
    findRelatedBooks(book.id, book.categoryId, 8),
  ]);

  const quality = QUALITY_CONFIG[book.qualityGrade] ?? { label: book.qualityGrade, cls: "bg-muted text-muted-foreground", desc: "" };
  const coverImage = book.images?.[0] ?? `https://picsum.photos/seed/book-${book.id.slice(0, 8)}/400/560`;
  const additionalImages = (book.images ?? []).slice(1).filter(Boolean);

  return (
    <div className="space-y-10">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="مسیر">
        <Link href="/" className="hover:text-foreground transition-colors">خانه</Link>
        <Chevron />
        <Link href="/books" className="hover:text-foreground transition-colors">کتاب‌ها</Link>
        {book.category && (
          <>
            <Chevron />
            <Link href={`/books?category=${book.category.slug}`} className="hover:text-foreground transition-colors">
              {book.category.name}
            </Link>
          </>
        )}
        <Chevron />
        <span className="line-clamp-1 font-medium text-foreground">{book.title}</span>
      </nav>

      {/* ── Hero: image + details ─────────────────────────────── */}
      <div className="grid gap-8 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
        {/* Cover */}
        <div className="md:sticky md:top-24 md:self-start">
          <LightboxImage src={coverImage} alt={book.title} additionalImages={additionalImages} priority />
          {/* Featured badge below image */}
          {book.isFeatured && (
            <div className="mt-2 flex justify-center">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">✦ کتاب منتخب</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Quality + category chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${quality.cls}`} title={quality.desc}>
              {quality.label}
            </span>
            {book.category && (
              <Link href={`/books?category=${book.category.slug}`} className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition">
                {book.category.name}
              </Link>
            )}
          </div>

          {/* Title + author */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold leading-tight text-foreground md:text-3xl">{book.title}</h1>
            {book.translator && (
              <p className="text-sm text-muted-foreground">ترجمه: <span className="font-medium text-foreground">{book.translator}</span></p>
            )}
            <p className="text-base font-semibold text-primary">{book.author}</p>
          </div>

          {/* Rating summary */}
          {totalApproved > 0 && (
            <ReviewSummary averageRating={averageRating} totalReviews={totalApproved} compact />
          )}

          {/* Price block */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-foreground">{displayPrice(book.price)}</span>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M6.5 1.5C3.7 1.5 1.5 3.7 1.5 6.5S3.7 11.5 6.5 11.5 11.5 9.3 11.5 6.5 9.3 1.5 6.5 1.5z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              ارسال رایگان به سراسر کشور برای سفارش بالای ۵۰۰ هزار تومان
            </p>
          </div>

          {/* Quality info */}
          {quality.desc && (
            <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>
                <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7.5 6.5v4M7.5 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">کیفیت {quality.label}: </span>{quality.desc}
              </p>
            </div>
          )}

          {/* Interactive: stock, qty, cart, wishlist */}
          <BookDetailClient bookId={book.id} stock={book.stock} price={book.price} isLoggedIn={!!userId} initialInWishlist={isInWishlist} />

          {/* Metadata grid */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <MetaItem icon="🏢" label="ناشر" value={book.publisher} />
              {book.publishedYear && <MetaItem icon="📅" label="سال انتشار" value={String(book.publishedYear)} ltr />}
              {book.pageCount && <MetaItem icon="📄" label="صفحات" value={book.pageCount.toLocaleString("fa-IR")} />}
              {book.isbn && <MetaItem icon="🔖" label="شابک" value={book.isbn} ltr mono />}
              <MetaItem icon="🌐" label="زبان" value={LANG_MAP[book.language] ?? book.language} />
              <MetaItem icon="🔑" label="کد محصول" value={book.id.slice(0, 8).toUpperCase()} ltr mono small />
            </dl>
          </div>

          {/* Genre chips */}
          {book.bookGenres.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">ژانرها:</span>
              {book.bookGenres.map(({ genre }) => (
                <Link key={genre.id} href={`/books?genre=${genre.id}`} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                  {genre.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────── */}
      {book.description && (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-foreground">درباره این کتاب</h2>
          <p className="whitespace-pre-wrap text-sm leading-loose text-foreground/80">{book.description}</p>
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────── */}
      <section id="reviews" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
          <ReviewList bookId={book.id} page={reviewPage} />
        </Suspense>
      </section>

      {/* ── Related books carousel ────────────────────────────── */}
      {related.length > 0 && (
        <Suspense fallback={
          <div className="space-y-4">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => <BookCardSkeleton key={i} />)}
            </div>
          </div>
        }>
          <RelatedCarousel books={related} />
        </Suspense>
      )}
    </div>
  );
}

/* ── Small helper components ────────────────────────────── */
function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0 rotate-180">
      <path d="M7.5 2.5l-3 3.5 3 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetaItem({ icon, label, value, ltr, mono, small }: { icon: string; label: string; value: string; ltr?: boolean; mono?: boolean; small?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{icon}</span> {label}
      </dt>
      <dd className={`mt-0.5 font-semibold text-foreground ${mono ? "font-mono" : ""} ${small ? "text-xs" : "text-sm"}`} dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
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
    <div className="animate-pulse space-y-8">
      <div className="h-5 w-80 rounded bg-muted" />
      <div className="grid gap-8 md:grid-cols-[320px_1fr]">
        <div className="aspect-[3/4] rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-lg bg-muted" />
          <div className="h-5 w-1/3 rounded-lg bg-muted" />
          <div className="h-20 w-full rounded-2xl bg-muted" />
          <div className="h-10 w-full rounded-xl bg-muted" />
          <div className="h-10 w-full rounded-xl bg-muted" />
          <div className="h-28 w-full rounded-2xl bg-muted" />
        </div>
      </div>
      <div className="h-40 w-full rounded-2xl bg-muted" />
      <div className="h-48 w-full rounded-2xl bg-muted" />
    </div>
  );
}
