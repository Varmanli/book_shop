"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { QualityGrade } from "@/types/domain";

/* ─── Types ─────────────────────────────────────────────── */
export interface FilterOption {
  id: string;
  name: string;
  slug: string;
  bookCount?: number;
}

export interface ActiveFilters {
  search: string;
  categorySlug: string;
  genreId: string;
  qualityGrade: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sort: string;
}

interface Props {
  categories: FilterOption[];
  genres: FilterOption[];
  current: ActiveFilters;
  maxBookPrice: number;
  /** mobile drawer open state (controlled by parent) */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/* ─── Quality grade options ─────────────────────────────── */
const QUALITY_OPTIONS: { value: QualityGrade; label: string; color: string }[] = [
  { value: "Like New", label: "مثل نو", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "Very Good", label: "خیلی خوب", color: "bg-sky-100 text-sky-700 border-sky-200" },
  { value: "Good", label: "خوب", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "Acceptable", label: "قابل قبول", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "title_asc", label: "نام (الف تا ی)" },
];

/* ─── Accordion section ──────────────────────────────────── */
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 py-3.5 text-sm font-semibold text-foreground transition hover:text-primary"
      >
        {title}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export function FilterSidebar({
  categories,
  genres,
  current,
  maxBookPrice,
  mobileOpen,
  onMobileClose,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  /* Local state mirrors URL filters for instant UI feedback */
  const [search, setSearch] = useState(current.search);
  const [categorySlug, setCategorySlug] = useState(current.categorySlug);
  const [genreId, setGenreId] = useState(current.genreId);
  const [qualityGrade, setQualityGrade] = useState(current.qualityGrade);
  const [minPrice, setMinPrice] = useState(current.minPrice);
  const [maxPrice, setMaxPrice] = useState(current.maxPrice);
  const [inStock, setInStock] = useState(current.inStock);
  const [sort, setSort] = useState(current.sort);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  /* Sync when URL changes (e.g. from active-filter removal) */
  useEffect(() => {
    setSearch(current.search);
    setCategorySlug(current.categorySlug);
    setGenreId(current.genreId);
    setQualityGrade(current.qualityGrade);
    setMinPrice(current.minPrice);
    setMaxPrice(current.maxPrice);
    setInStock(current.inStock);
    setSort(current.sort);
  }, [current]);

  const buildUrl = useCallback(
    (overrides: Partial<ActiveFilters> = {}) => {
      const f: ActiveFilters = {
        search,
        categorySlug,
        genreId,
        qualityGrade,
        minPrice,
        maxPrice,
        inStock,
        sort,
        ...overrides,
      };
      const params = new URLSearchParams();
      if (f.search) params.set("search", f.search);
      if (f.categorySlug) params.set("category", f.categorySlug);
      if (f.genreId) params.set("genre", f.genreId);
      if (f.qualityGrade) params.set("quality", f.qualityGrade);
      if (f.minPrice) params.set("minPrice", f.minPrice);
      if (f.maxPrice) params.set("maxPrice", f.maxPrice);
      if (f.inStock) params.set("inStock", "1");
      if (f.sort && f.sort !== "createdAt_desc") params.set("sort", f.sort);
      params.set("page", "1");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [search, categorySlug, genreId, qualityGrade, minPrice, maxPrice, inStock, sort, pathname]
  );

  const push = useCallback(
    (overrides: Partial<ActiveFilters> = {}) => {
      router.push(buildUrl(overrides));
    },
    [buildUrl, router]
  );

  /* Debounced search */
  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      push({ search: val });
    }, 350);
  };

  const handleReset = () => {
    setSearch("");
    setCategorySlug("");
    setGenreId("");
    setQualityGrade("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSort("createdAt_desc");
    router.push(pathname);
  };

  const activeCount = [
    search,
    categorySlug,
    genreId,
    qualityGrade,
    minPrice,
    maxPrice,
    inStock,
  ].filter(Boolean).length;

  /* ── Sidebar body ──────────────────────────────────────── */
  const body = (
    <div className="flex flex-col gap-0 divide-y-0">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="text-primary">
            <path d="M2 4h14M4 9h10M7 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="text-base font-bold text-foreground">فیلترها</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            پاک کردن
          </button>
        )}
      </div>

      <div className="space-y-0 divide-y divide-border/60">
        {/* Sort */}
        <Section title="مرتب‌سازی">
          <div className="space-y-1.5">
            {SORT_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm transition hover:bg-muted/60">
                <input
                  type="radio"
                  name="sort"
                  value={opt.value}
                  checked={sort === opt.value}
                  onChange={() => {
                    setSort(opt.value);
                    push({ sort: opt.value });
                  }}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className={sort === opt.value ? "font-semibold text-primary" : "text-foreground"}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* Search */}
        <Section title="جستجو در کتاب‌ها">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="نام کتاب، نویسنده..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pe-10 ps-3.5 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        </Section>

        {/* Categories */}
        {categories.length > 0 && (
          <Section title="دسته‌بندی">
            <div className="max-h-52 space-y-0.5 overflow-y-auto pe-1 scrollbar-thin">
              <label className="flex cursor-pointer items-center justify-between rounded-lg px-1.5 py-1.5 text-sm transition hover:bg-muted/60">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!categorySlug}
                    onChange={() => {
                      setCategorySlug("");
                      push({ categorySlug: "" });
                    }}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span className={!categorySlug ? "font-semibold text-primary" : "text-foreground"}>همه</span>
                </div>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex cursor-pointer items-center justify-between rounded-lg px-1.5 py-1.5 text-sm transition hover:bg-muted/60">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="category"
                      value={cat.slug}
                      checked={categorySlug === cat.slug}
                      onChange={() => {
                        setCategorySlug(cat.slug);
                        push({ categorySlug: cat.slug });
                      }}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span className={categorySlug === cat.slug ? "font-semibold text-primary" : "text-foreground"}>
                      {cat.name}
                    </span>
                  </div>
                  {cat.bookCount !== undefined && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {cat.bookCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </Section>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <Section title="ژانر" defaultOpen={false}>
            <div className="max-h-52 space-y-0.5 overflow-y-auto pe-1">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm transition hover:bg-muted/60">
                <input
                  type="radio"
                  name="genre"
                  value=""
                  checked={!genreId}
                  onChange={() => {
                    setGenreId("");
                    push({ genreId: "" });
                  }}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span className={!genreId ? "font-semibold text-primary" : "text-foreground"}>همه</span>
              </label>
              {genres.map((g) => (
                <label key={g.id} className="flex cursor-pointer items-center justify-between rounded-lg px-1.5 py-1.5 text-sm transition hover:bg-muted/60">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="genre"
                      value={g.id}
                      checked={genreId === g.id}
                      onChange={() => {
                        setGenreId(g.id);
                        push({ genreId: g.id });
                      }}
                      className="h-3.5 w-3.5 accent-primary"
                    />
                    <span className={genreId === g.id ? "font-semibold text-primary" : "text-foreground"}>
                      {g.name}
                    </span>
                  </div>
                  {g.bookCount !== undefined && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                      {g.bookCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </Section>
        )}

        {/* Quality grade */}
        <Section title="کیفیت کتاب" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = qualityGrade === opt.value ? "" : opt.value;
                  setQualityGrade(next);
                  push({ qualityGrade: next });
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  qualityGrade === opt.value
                    ? opt.color + " ring-1 ring-current/40"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Price range */}
        <Section title="محدوده قیمت (تومان)" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">از</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => push({ minPrice })}
                  placeholder="۰"
                  min={0}
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="mt-5 text-muted-foreground">—</div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">تا</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => push({ maxPrice })}
                  placeholder={maxBookPrice.toLocaleString("fa-IR")}
                  min={0}
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            {(minPrice || maxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  push({ minPrice: "", maxPrice: "" });
                }}
                className="text-xs text-muted-foreground underline hover:text-destructive"
              >
                حذف فیلتر قیمت
              </button>
            )}
          </div>
        </Section>

        {/* In Stock */}
        <Section title="موجودی" defaultOpen={false}>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 transition hover:border-primary/40 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked);
                  push({ inStock: e.target.checked });
                }}
                className="h-4 w-4 cursor-pointer rounded accent-primary"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">فقط موجود در انبار</p>
              <p className="text-xs text-muted-foreground">نمایش کتاب‌های در دسترس</p>
            </div>
          </label>
        </Section>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="sticky top-24 hidden w-72 shrink-0 self-start lg:block">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          {body}
        </div>
      </aside>

      {/* ── Mobile drawer overlay ────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer — slides from end (right in RTL) */}
          <div className="absolute bottom-0 end-0 top-0 flex w-80 flex-col bg-card shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <span className="text-base font-bold text-foreground">فیلترها</span>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="بستن"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{body}</div>
          </div>
        </div>
      )}
    </>
  );
}
