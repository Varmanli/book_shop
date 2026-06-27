"use client";

import { useRouter, usePathname } from "next/navigation";

interface Props {
  search: string;
  categorySlug: string;
  categoryName: string;
  genreId: string;
  genreName: string;
  qualityGrade: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sort: string;
}

const QUALITY_LABELS: Record<string, string> = {
  "Like New": "مثل نو",
  "Very Good": "خیلی خوب",
  Good: "خوب",
  Acceptable: "قابل قبول",
};

export function ActiveFilters({
  search,
  categorySlug,
  categoryName,
  genreId,
  genreName,
  qualityGrade,
  minPrice,
  maxPrice,
  inStock,
  sort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const badges: { key: string; label: string; removeParam: string }[] = [];
  if (search) badges.push({ key: "search", label: `جستجو: ${search}`, removeParam: "search" });
  if (categorySlug) badges.push({ key: "category", label: categoryName || categorySlug, removeParam: "category" });
  if (genreId) badges.push({ key: "genre", label: genreName || genreId, removeParam: "genre" });
  if (qualityGrade) badges.push({ key: "quality", label: QUALITY_LABELS[qualityGrade] ?? qualityGrade, removeParam: "quality" });
  if (minPrice || maxPrice) {
    const label =
      minPrice && maxPrice
        ? `${Number(minPrice).toLocaleString("fa-IR")} — ${Number(maxPrice).toLocaleString("fa-IR")} تومان`
        : minPrice
          ? `از ${Number(minPrice).toLocaleString("fa-IR")} تومان`
          : `تا ${Number(maxPrice).toLocaleString("fa-IR")} تومان`;
    badges.push({ key: "price", label, removeParam: "price" });
  }
  if (inStock) badges.push({ key: "inStock", label: "فقط موجود", removeParam: "inStock" });

  if (badges.length === 0) return null;

  const removeBadge = (removeParam: string) => {
    const url = new URL(window.location.href);
    if (removeParam === "price") {
      url.searchParams.delete("minPrice");
      url.searchParams.delete("maxPrice");
    } else {
      url.searchParams.delete(removeParam);
    }
    url.searchParams.set("page", "1");
    router.push(url.pathname + (url.search || ""));
  };

  const clearAll = () => router.push(pathname);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">فیلترهای فعال:</span>
      {badges.map((b) => (
        <span
          key={b.key}
          className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
        >
          {b.label}
          <button
            type="button"
            onClick={() => removeBadge(b.removeParam)}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full transition hover:bg-primary/20"
            aria-label={`حذف فیلتر ${b.label}`}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-muted-foreground underline transition hover:text-destructive"
      >
        حذف همه
      </button>
    </div>
  );
}
