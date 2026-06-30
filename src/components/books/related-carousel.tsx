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
  isSold: boolean;
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
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold text-foreground">
          <span className="h-6 w-1 rounded-full bg-primary" />
          کتاب‌های مشابه
        </h2>
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
            const inStock = !book.isSold;

            return (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="group flex w-[160px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl md:w-[180px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted/40">
                  <Image
                    src={image}
                    alt={book.title}
                    fill
                    sizes="180px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                      <span className="rounded-lg bg-black/80 px-2.5 py-1 text-xs font-bold text-white">ناموجود</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <span className={`self-start rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${q.cls}`}>
                    {q.label}
                  </span>
                  <h3 className="line-clamp-2 text-xs font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {book.title}
                  </h3>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">{book.author}</p>
                  <p className="mt-auto border-t border-border/50 pt-2 text-xs font-extrabold text-primary">
                    {inStock ? displayPrice(book.price) : <span className="text-muted-foreground font-medium">ناموجود</span>}
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
