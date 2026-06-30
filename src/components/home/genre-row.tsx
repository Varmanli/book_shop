import Link from "next/link";
import { BookCarousel } from "./book-carousel";
import type { Book } from "@/types";

const GENRE_EMOJI: Record<string, string> = {
  thriller: "🔥",
  romance: "❤️",
  biography: "👤",
  history: "🏛️",
  space: "🚀",
  dystopia: "🌑",
  philosophy: "💭",
  poetry: "🌸",
  children: "🧒",
  "sci-fi": "🚀",
  fiction: "📖",
};

interface Props {
  genreId: string;
  genreName: string;
  genreSlug: string;
  books: (Book & { category?: { name: string } | null })[];
}

function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function GenreRow({ genreName, genreSlug, books }: Props) {
  if (books.length === 0) return null;

  const emoji = GENRE_EMOJI[genreSlug] ?? "📚";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border/70 bg-muted/60 text-xl shadow-sm">
            {emoji}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-black tracking-tight text-foreground sm:text-xl">
                {genreName}
              </h3>
              <span className="rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground shadow-sm">
                {toPersianDigits(books.length)} کتاب
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/books?genre=${encodeURIComponent(genreSlug)}`}
          className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-border/70 bg-background px-4 py-2 text-xs font-bold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
        >
          مشاهده همه
          <span className="grid h-6 w-6 place-items-center rounded-xl bg-muted text-foreground transition-all duration-300 group-hover:-translate-x-0.5 group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 3l-4 4 4 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>

      {/* Carousel — px-6 on desktop makes room for the arrow buttons */}
      <div className="md:px-6">
        <BookCarousel books={books} />
      </div>
    </div>
  );
}
