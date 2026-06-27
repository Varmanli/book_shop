"use client";

import { useState } from "react";
import { FilterSidebar, type FilterOption, type ActiveFilters } from "./filter-sidebar";
import { ActiveFilters as ActiveFilterBadges } from "./active-filters";
import { ListingBookCard } from "./listing-book-card";
import { BooksPagination } from "./books-pagination";
import type { PaginationMeta } from "@/types/api";
import type { QualityGrade } from "@/types/domain";

interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  publisher: string;
  qualityGrade: QualityGrade;
  price: number;
  stock: number;
  images: string[];
  isFeatured: boolean;
  category?: { name: string; slug: string } | null;
}

interface Props {
  filterCategories: FilterOption[];
  filterGenres: FilterOption[];
  activeFilters: ActiveFilters;
  books: Book[];
  meta: PaginationMeta;
  spRecord: Record<string, string>;
  categoryName: string;
  genreName: string;
}

export function BooksLayoutClient({
  filterCategories,
  filterGenres,
  activeFilters,
  books,
  meta,
  spRecord,
  categoryName,
  genreName,
}: Props) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <>
      {/* Mobile filter button */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          فیلترها
          {Object.values(activeFilters).some(Boolean) && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              !
            </span>
          )}
        </button>
        <p className="text-sm text-muted-foreground">
          {meta.total.toLocaleString("fa-IR")} نتیجه
        </p>
      </div>

      {/* Active filter badges */}
      <div className="mb-4">
        <ActiveFilterBadges
          search={activeFilters.search}
          categorySlug={activeFilters.categorySlug}
          categoryName={categoryName}
          genreId={activeFilters.genreId}
          genreName={genreName}
          qualityGrade={activeFilters.qualityGrade}
          minPrice={activeFilters.minPrice}
          maxPrice={activeFilters.maxPrice}
          inStock={activeFilters.inStock}
          sort={activeFilters.sort}
        />
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        {/* Sidebar (desktop + mobile drawer via FilterSidebar) */}
        <FilterSidebar
          categories={filterCategories}
          genres={filterGenres}
          current={activeFilters}
          maxBookPrice={500000}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />

        {/* Book grid + pagination */}
        <div className="min-w-0 flex-1">
          {/* Result count (desktop) */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted-foreground">
              نمایش{" "}
              <span className="font-semibold text-foreground">
                {Math.min((meta.page - 1) * meta.pageSize + 1, meta.total).toLocaleString("fa-IR")}
              </span>
              {" "}–{" "}
              <span className="font-semibold text-foreground">
                {Math.min(meta.page * meta.pageSize, meta.total).toLocaleString("fa-IR")}
              </span>
              {" "}از{" "}
              <span className="font-semibold text-foreground">
                {meta.total.toLocaleString("fa-IR")}
              </span>{" "}
              کتاب
            </p>
          </div>

          {books.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card py-20 text-center">
              <span className="text-5xl">📚</span>
              <div>
                <p className="text-lg font-bold text-foreground">کتابی یافت نشد</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  فیلترها را تغییر دهید یا جستجوی جدیدی امتحان کنید
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <ListingBookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {books.length > 0 && (
            <div className="mt-10">
              <BooksPagination meta={meta} searchParams={spRecord} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
