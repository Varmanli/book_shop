"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { displayPrice } from "@/lib/currency";

const QUALITY_STYLES: Record<string, { label: string; cls: string }> = {
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
  qualityGrade: string;
  price: number;
  stock: number;
  images: string[];
}

interface Props {
  books: Book[];
}

export function RelatedCarousel({ books }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    direction: "rtl",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (books.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-foreground">کتاب‌های مشابه</h2>
          <div className="h-px w-16 bg-border" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={scrollNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            aria-label="بعدی"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={scrollPrev}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            aria-label="قبلی"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {books.map((book) => {
            const q = QUALITY_STYLES[book.qualityGrade] ?? { label: book.qualityGrade, cls: "bg-muted text-muted-foreground" };
            const image = book.images?.[0] ?? `https://picsum.photos/seed/book-${book.id.slice(0, 8)}/300/420`;
            const inStock = book.stock > 0;

            return (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="group relative flex w-[160px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:w-[180px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                  <Image
                    src={image}
                    alt={book.title}
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-xl bg-black/70 px-2 py-1 text-xs font-bold text-white">ناموجود</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <span className={`self-start rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${q.cls}`}>
                    {q.label}
                  </span>
                  <h3 className="line-clamp-2 text-xs font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{book.author}</p>
                  <p className="mt-auto pt-1 text-xs font-extrabold text-primary">
                    {inStock ? displayPrice(book.price) : "ناموجود"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
