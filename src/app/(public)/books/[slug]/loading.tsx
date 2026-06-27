import { BookCardSkeleton } from "@/components/books/listing-book-card";

export default function BookDetailLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-10 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>

      {/* Main grid */}
      <div className="grid gap-8 md:grid-cols-[320px_1fr] lg:grid-cols-[360px_1fr]">
        {/* Cover image */}
        <div className="space-y-3">
          <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted" />
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-lg bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="h-5 w-1/3 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Price */}
          <div className="h-9 w-1/2 animate-pulse rounded-lg bg-muted" />

          {/* Info box */}
          <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />

          {/* Stock + qty + add to cart */}
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="flex gap-3">
            <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
          </div>

          {/* Wishlist + share */}
          <div className="flex gap-3">
            <div className="h-10 w-40 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
          </div>

          {/* Metadata card */}
          <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />

          {/* Genres */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${85 + (i % 3) * 5}%` }} />
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="h-48 w-full animate-pulse rounded-2xl bg-muted" />

      {/* Related books */}
      <div className="space-y-5">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
