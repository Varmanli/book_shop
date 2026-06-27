import Link from "next/link";
import { BookScroll } from "./book-scroll";
import type { Book } from "@/types";

const GENRE_EMOJI: Record<string, string> = {
  thriller: "🔥",
  romance:  "❤️",
  biography: "👤",
  history: "🏛️",
  space: "🚀",
  dystopia: "🌑",
};

interface Props {
  genreId: string;
  genreName: string;
  genreSlug: string;
  books: (Book & { category?: { name: string } | null })[];
}

export function GenreRow({ genreId: _genreId, genreName, genreSlug, books }: Props) {
  if (books.length === 0) return null;

  const emoji = GENRE_EMOJI[genreSlug] ?? "📚";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
            {emoji}
          </span>
          <div>
            <h3 className="text-base font-extrabold text-foreground sm:text-lg">
              {genreName}
            </h3>
            <p className="text-xs text-muted-foreground">{books.length} کتاب</p>
          </div>
        </div>
        <Link
          href={`/books?genre=${genreSlug}`}
          className="group flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          مشاهده همه
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform group-hover:-translate-x-0.5"
            aria-hidden
          >
            <path
              d="M9 3l-4 4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* Scroll hint on mobile */}
      <div className="relative">
        <BookScroll books={books} />
        {/* Fade-out edge hint */}
        <div className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-s from-background/0 to-background/80 sm:hidden" />
      </div>
    </div>
  );
}
