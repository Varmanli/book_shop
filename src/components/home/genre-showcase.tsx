import { GenreRow } from "./genre-row";
import type { Book } from "@/types";

interface GenreWithBooks {
  id: string;
  name: string;
  slug: string;
  books: (Book & { category?: { name: string } | null })[];
}

interface Props {
  genres: GenreWithBooks[];
}

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function GenreShowcase({ genres }: Props) {
  const filtered = genres.filter((genre) => genre.books.length > 0);
  if (filtered.length === 0) return null;

  const totalBooks = filtered.reduce(
    (sum, genre) => sum + genre.books.length,
    0,
  );

  return (
    <section className="relative overflow-hidden px-4 py-20">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-muted/20 via-background to-muted/20" />
      <div className="pointer-events-none absolute -top-32 right-1/2 h-80 w-80 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-bold text-primary shadow-sm">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 3.5h7M3 6.5h7M3 9.5h4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            ژانرها
          </span>

          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            کتاب بر اساس ژانر
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            از داستان و تاریخ تا فلسفه و کودک؛ مجموعه‌ای مرتب برای پیدا کردن
            کتاب‌هایی که با سلیقه شما هماهنگ‌اند.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              {toPersianDigits(filtered.length)} ژانر فعال
            </span>
            <span className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              {toPersianDigits(totalBooks)} کتاب
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {filtered.map((genre, index) => (
            <div
              key={genre.id}
              className=" p-4  backdrop-blur-sm transition-all duration-300 hover:border-primary/15  sm:p-5"
              style={{
                animationDelay: `${index * 90}ms`,
                animationFillMode: "both",
              }}
            >
              <GenreRow
                genreId={genre.id}
                genreName={genre.name}
                genreSlug={genre.slug}
                books={genre.books}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
