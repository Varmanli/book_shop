import Link from "next/link";
import { BookCard } from "./book-card";
import type { Book } from "@/types";

interface Props {
  books: (Book & { category?: { name: string } | null })[];
}

export function FeaturedBooks({ books }: Props) {
  if (books.length === 0) return null;

  return (
    <section className="relative overflow-hidden px-4 py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-muted/25 to-background" />
      <div className="pointer-events-none absolute -top-28 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-secondary/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-sm">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6.5 1.5l1.35 3.05 3.15.35-2.35 2.1.7 3.1L6.5 8.45 3.65 10.1l.7-3.1L2 4.9l3.15-.35L6.5 1.5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              منتخب سردبیر
            </span>

            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              انتخاب ویژه کتاب‌ها
            </h2>
          </div>

          <Link
            href="/books?featured=true"
            className="group hidden items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-5 py-3 text-sm font-bold text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/15 sm:inline-flex"
          >
            مشاهده همه
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-muted text-foreground transition-all duration-300 group-hover:-translate-x-1 group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground">
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
              >
                <path
                  d="M10 3l-5 5 5 5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>

        {/* Books frame */}
        <div className="relative rounded-4xl border border-border/70 bg-card/55 p-3 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-4 lg:p-5">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

          <div className="mb-4 flex items-center justify-between px-1 sm:px-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-muted-foreground">
                پیشنهادهای این هفته
              </span>
            </div>

            <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
              {books.length} کتاب منتخب
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book, index) => (
              <div
                key={book.id}
                className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{
                  animationDelay: `${index * 55}ms`,
                  animationFillMode: "both",
                }}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mt-7 text-center sm:hidden">
          <Link
            href="/books?featured=true"
            className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
          >
            مشاهده همه کتاب‌های ویژه
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden
            >
              <path
                d="M10 3l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
