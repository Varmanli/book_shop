interface Props {
  averageRating: number;
  totalReviews: number;
  compact?: boolean;
}

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {half ? (
        <>
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M8 1.5l1.6 3.3 3.6.5-2.6 2.6.6 3.6L8 9.8 4.8 11.5l.6-3.6L2.8 5.3l3.6-.5L8 1.5z"
            fill="url(#half-star)"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </>
      ) : (
        <path
          d="M8 1.5l1.6 3.3 3.6.5-2.6 2.6.6 3.6L8 9.8 4.8 11.5l.6-3.6L2.8 5.3l3.6-.5L8 1.5z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.2"
        />
      )}
    </svg>
  );
}

export function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeCls = size === "lg" ? "text-amber-400 gap-1" : "text-amber-400 gap-0.5";
  return (
    <span className={`flex items-center ${sizeCls}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= Math.floor(rating)} half={s === Math.ceil(rating) && rating % 1 >= 0.5} />
      ))}
    </span>
  );
}

export function ReviewSummary({ averageRating, totalReviews, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <StarRating rating={averageRating} />
        <span className="text-xs font-semibold text-amber-600">
          {averageRating > 0 ? averageRating.toLocaleString("fa-IR") : "—"}
        </span>
        <span className="text-xs text-muted-foreground">
          ({totalReviews.toLocaleString("fa-IR")} نظر)
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-3xl font-extrabold tabular-nums text-amber-500">
          {averageRating > 0 ? averageRating.toLocaleString("fa-IR") : "—"}
        </span>
        <StarRating rating={averageRating} size="lg" />
        <span className="text-xs text-muted-foreground">
          از {totalReviews.toLocaleString("fa-IR")} نظر
        </span>
      </div>
    </div>
  );
}
