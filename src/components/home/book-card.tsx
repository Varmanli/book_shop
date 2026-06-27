import Image from "next/image";
import Link from "next/link";
import { displayPrice } from "@/lib/currency";
import type { Book } from "@/types";

const QUALITY_BADGE: Record<string, { label: string; color: string }> = {
  "Like New": { label: "مثل نو", color: "bg-emerald-100 text-emerald-700" },
  "Very Good": { label: "خیلی خوب", color: "bg-sky-100 text-sky-700" },
  "Good": { label: "خوب", color: "bg-amber-100 text-amber-700" },
  "Acceptable": { label: "قابل قبول", color: "bg-orange-100 text-orange-700" },
};

interface Props {
  book: Book & { category?: { name: string } | null };
}

export function BookCard({ book }: Props) {
  const badge = QUALITY_BADGE[book.qualityGrade] ?? { label: book.qualityGrade, color: "bg-muted text-muted-foreground" };
  const coverImage = book.images?.[0] ?? `https://picsum.photos/seed/${book.slug}/300/450`;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ transform: "scale(1)" }}
          onError={undefined}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        {book.isFeatured && (
          <span className="absolute end-2 top-2 rounded-lg bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-md">
            ویژه
          </span>
        )}
        {book.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-lg bg-black/70 px-3 py-1 text-xs font-medium text-white">
              ناموجود
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {book.title}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{book.author}</p>

        <div className="mt-2 flex items-center justify-between gap-1">
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.color}`}>
            {badge.label}
          </span>
          {book.category && (
            <span className="truncate text-[10px] text-muted-foreground">
              {book.category.name}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-extrabold text-foreground">
            {displayPrice(book.price)}
          </span>
          {book.stock > 0 && book.stock <= 3 && (
            <span className="text-[10px] font-medium text-destructive">
              فقط {book.stock} عدد
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
