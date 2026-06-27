"use client";

import Image from "next/image";
import Link from "next/link";
import { displayPrice } from "@/lib/currency";
import type { QualityGrade } from "@/types/domain";

const QUALITY_STYLES: Record<QualityGrade, { label: string; cls: string }> = {
  "Like New": { label: "مثل نو", cls: "bg-emerald-100 text-emerald-700" },
  "Very Good": { label: "خیلی خوب", cls: "bg-sky-100 text-sky-700" },
  Good: { label: "خوب", cls: "bg-amber-100 text-amber-700" },
  Acceptable: { label: "قابل قبول", cls: "bg-rose-100 text-rose-700" },
};

interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  publisher: string;
  qualityGrade: QualityGrade;
  price: number;
  stock: number;
  images: string[];
  isFeatured: boolean;
  category?: { name: string; slug: string } | null;
}

export function ListingBookCard({ book }: { book: Book }) {
  const q = QUALITY_STYLES[book.qualityGrade];
  const image =
    book.images?.[0] ??
    `https://picsum.photos/seed/book-${book.id.slice(0, 8)}/300/420`;
  const inStock = book.stock > 0;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
        <Image
          src={image}
          alt={book.title}
          fill
          sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Featured badge */}
        {book.isFeatured && (
          <div className="absolute start-2 top-2 rounded-lg bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground backdrop-blur-sm">
            ✦ منتخب
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-xl bg-black/70 px-3 py-1.5 text-xs font-bold text-white">
              ناموجود
            </span>
          </div>
        )}

        {/* Hover quick-action strip */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <div className="flex bg-foreground/90 backdrop-blur-sm">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-background transition hover:bg-primary hover:text-primary-foreground"
              aria-label="افزودن به سبد"
              onClick={(e) => e.preventDefault()}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1h2l1.5 7h6l1.5-5H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6.5" cy="12" r="1" fill="currentColor" />
                <circle cx="10.5" cy="12" r="1" fill="currentColor" />
              </svg>
              سبد
            </button>
            <div className="w-px bg-background/20" />
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-background transition hover:bg-rose-500 hover:text-white"
              aria-label="افزودن به علاقه‌مندی‌ها"
              onClick={(e) => e.preventDefault()}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 12s-5-3.5-5-7a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 3.5-5 7-9 7z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              ذخیره
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {/* Quality + category row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${q.cls}`}>
            {q.label}
          </span>
          {book.category && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {book.category.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>

        {/* Price */}
        <div className="mt-auto pt-2">
          {inStock ? (
            <p className="text-sm font-extrabold text-primary">
              {displayPrice(book.price)}
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">ناموجود</p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton loader ─────────────────────────────────────── */
export function BookCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
