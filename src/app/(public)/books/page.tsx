import { Suspense } from "react";
import type { Metadata } from "next";
import { findBooks } from "@/repositories/book.repository";
import { findCategoriesWithCount } from "@/repositories/category.repository";
import { findGenresWithCount } from "@/repositories/genre.repository";
import { BookCardSkeleton } from "@/components/books/listing-book-card";
import { BooksLayoutClient } from "@/components/books/books-layout-client";
import type { BookFilters, BookSortField, SortOrder, QualityGrade } from "@/types/domain";

export const metadata: Metadata = {
  title: "همه کتاب‌ها",
  description: "مجموعه‌ای گسترده از کتاب‌های دست دوم با کیفیت عالی",
};

type SearchParams = {
  search?: string;
  category?: string;
  genre?: string;
  quality?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

type Props = { searchParams: Promise<SearchParams> };

function parseSort(sort?: string): { field: BookSortField; order: SortOrder } {
  switch (sort) {
    case "price_asc": return { field: "price", order: "asc" };
    case "price_desc": return { field: "price", order: "desc" };
    case "title_asc": return { field: "title", order: "asc" };
    default: return { field: "createdAt", order: "desc" };
  }
}

async function BooksContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const categorySlug = sp.category ?? "";
  const genreId = sp.genre ?? "";
  const qualityGrade = sp.quality ?? "";
  const minPrice = sp.minPrice ?? "";
  const maxPrice = sp.maxPrice ?? "";
  const inStock = sp.inStock === "1";
  const search = sp.search ?? "";
  const sortKey = sp.sort ?? "createdAt_desc";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [allCategories, allGenres] = await Promise.all([
    findCategoriesWithCount(),
    findGenresWithCount(),
  ]);

  /* Resolve category id from slug */
  const categoryId = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)?.id
    : undefined;
  const categoryName = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug
    : "";
  const genreName = genreId
    ? allGenres.find((g) => g.id === genreId)?.name ?? genreId
    : "";

  const filters: BookFilters = {
    isPublished: true,
    ...(search && { search }),
    ...(categoryId && { categoryId }),
    ...(genreId && { genreId }),
    ...(inStock && { inStock: true }),
    ...(qualityGrade && { qualityGrade: qualityGrade as QualityGrade }),
    ...(minPrice && { minPrice: Number(minPrice) }),
    ...(maxPrice && { maxPrice: Number(maxPrice) }),
  };

  const { items: books, meta } = await findBooks(filters, { page, pageSize: 24 }, parseSort(sortKey));

  const filterCategories = allCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    bookCount: c.bookCount,
  }));
  const filterGenres = allGenres.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    bookCount: g.bookCount,
  }));

  const activeFilters = {
    search,
    categorySlug,
    genreId,
    qualityGrade,
    minPrice,
    maxPrice,
    inStock,
    sort: sortKey,
  };

  const spRecord: Record<string, string> = {};
  if (search) spRecord.search = search;
  if (categorySlug) spRecord.category = categorySlug;
  if (genreId) spRecord.genre = genreId;
  if (qualityGrade) spRecord.quality = qualityGrade;
  if (minPrice) spRecord.minPrice = minPrice;
  if (maxPrice) spRecord.maxPrice = maxPrice;
  if (inStock) spRecord.inStock = "1";
  if (sortKey !== "createdAt_desc") spRecord.sort = sortKey;

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="breadcrumb">
        <a href="/" className="transition hover:text-primary">خانه</a>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="rtl:rotate-180">
          <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-medium text-foreground">همه کتاب‌ها</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">همه کتاب‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {meta.total.toLocaleString("fa-IR")} کتاب در مجموعه ما
        </p>
      </div>

      <BooksLayoutClient
        filterCategories={filterCategories}
        filterGenres={filterGenres}
        activeFilters={activeFilters}
        books={books as any}
        meta={meta}
        spRecord={spRecord}
        categoryName={categoryName}
        genreName={genreName}
      />
    </main>
  );
}

function BooksPageSkeleton() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-8">
        <div className="hidden w-72 shrink-0 rounded-2xl bg-muted/60 lg:block" style={{ height: 480 }} />
        <div className="flex-1 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BooksPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<BooksPageSkeleton />}>
      <BooksContent searchParams={searchParams} />
    </Suspense>
  );
}
