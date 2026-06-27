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

export function GenreShowcase({ genres }: Props) {
  const filtered = genres.filter((g) => g.books.length > 0);
  if (filtered.length === 0) return null;

  return (
    <section className="bg-muted/20 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ژانرها
          </span>
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            کتاب بر اساس ژانر
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            هر سلیقه‌ای، یک ژانر — مجموعه‌ای کامل برای هر خواننده
          </p>
        </div>

        <div className="space-y-14">
          {filtered.map((genre) => (
            <GenreRow
              key={genre.id}
              genreId={genre.id}
              genreName={genre.name}
              genreSlug={genre.slug}
              books={genre.books}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
