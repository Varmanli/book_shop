import Link from "next/link";
import { BookCard } from "./book-card";
import type { Book } from "@/types";

interface Props {
  books: (Book & { category?: { name: string } | null })[];
}

export function FeaturedBooks({ books }: Props) {
  if (books.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              منتخب سردبیر
            </span>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              انتخاب ویژه
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              کتاب‌های منتخب کارشناسان ما برای این هفته
            </p>
          </div>
          <Link
            href="/books?featured=true"
            className="group hidden items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-primary sm:flex"
          >
            مشاهده همه
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden
            >
              <path
                d="M10 3l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/books?featured=true"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            مشاهده همه کتاب‌های ویژه
          </Link>
        </div>
      </div>
    </section>
  );
}
