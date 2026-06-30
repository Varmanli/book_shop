import Image from "next/image";
import Link from "next/link";
import { displayPrice } from "@/lib/currency";
import type { Book } from "@/types";

const QUALITY_BADGE: Record<string, { label: string; className: string }> = {
  "Like New": {
    label: "مثل نو",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "Very Good": {
    label: "خیلی خوب",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  Good: {
    label: "خوب",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  Acceptable: {
    label: "قابل قبول",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
};

interface Props {
  book: Book & { category?: { name: string } | null };
}

export function BookCard({ book }: Props) {
  const badge = QUALITY_BADGE[book.qualityGrade] ?? {
    label: book.qualityGrade,
    className: "border-border bg-muted text-muted-foreground",
  };

  const coverImage =
    book.images?.[0] ?? `https://picsum.photos/seed/${book.slug}/300/450`;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group block rounded-2xl border border-border/70 bg-card p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
    >
      <div className="relative overflow-hidden rounded-xl bg-muted">
        <div className="relative aspect-[2/3]">
          <Image
            src={coverImage}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>

        {book.isFeatured && !book.isSold && (
          <span className="absolute end-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-primary shadow-sm backdrop-blur">
            ویژه
          </span>
        )}

        {book.isSold && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-[2px]">
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
              فروخته شد
            </span>
          </div>
        )}
      </div>

      <div className="px-1 pb-1 pt-3">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-5 text-foreground transition-colors group-hover:text-primary">
          {book.title}
        </h3>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {book.author}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>

          {book.category && (
            <span className="min-w-0 truncate text-[10px] text-muted-foreground">
              {book.category.name}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          <span className="text-sm font-black text-foreground">
            {displayPrice(book.price)}
          </span>

          {!book.isSold && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              موجود
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
