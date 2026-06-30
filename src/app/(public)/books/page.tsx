import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { findBooks } from "@/repositories/book.repository";
import { findCartItems } from "@/repositories/cart.repository";
import { findCategoriesWithCount } from "@/repositories/category.repository";
import { findGenresWithCount } from "@/repositories/genre.repository";
import { findWishlistItems } from "@/repositories/wishlist.repository";
import { BookCardSkeleton } from "@/components/books/listing-book-card";
import { BooksLayoutClient } from "@/components/books/books-layout-client";
import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE } from "@/config/cart";
import type { BookFilters, BookSortField, SortOrder, QualityGrade } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

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

type BooksPageBook = {
  id: string;
  title: string;
  slug: string;
  author: string;
  publisher: string;
  qualityGrade: QualityGrade;
  price: number;
  isSold: boolean;
  images: string[];
  isFeatured: boolean;
  initialInCart: boolean;
  initialInWishlist: boolean;
  category?: { name: string; slug: string } | null;
};

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
  const session = await auth();
  const cookieStore = await cookies();
  const guestCartSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  const categorySlug = sp.category ?? "";
  const genreId = sp.genre ?? "";
  const qualityGrade = sp.quality ?? "";
  const minPrice = sp.minPrice ?? "";
  const maxPrice = sp.maxPrice ?? "";
  const inStock = sp.inStock === "1";
  const search = sp.search ?? "";
  const sortKey = sp.sort ?? "createdAt_desc";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [allCategories, allGenres, wishlistItems, cartItems] = await Promise.all([
    findCategoriesWithCount(),
    findGenresWithCount(),
    session?.user?.id ? findWishlistItems(session.user.id) : Promise.resolve([]),
    session?.user?.id
      ? findCartItems({ userId: session.user.id })
      : guestCartSessionId
        ? findCartItems({ sessionId: guestCartSessionId })
        : Promise.resolve([]),
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
  const wishlistBookIds = new Set(wishlistItems.map((item) => item.bookId));
  const cartBookIds = new Set(cartItems.map((item) => item.bookId));
  const booksWithState = books.map((book) => ({
    ...book,
    initialInCart: cartBookIds.has(book.id),
    initialInWishlist: wishlistBookIds.has(book.id),
  }));

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="breadcrumb">
        <Link href="/" className="transition hover:text-primary">خانه</Link>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="rtl:rotate-180">
          <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-medium text-foreground">همه کتاب‌ها</span>
      </nav>

      <BooksLayoutClient
        filterCategories={filterCategories}
        filterGenres={filterGenres}
        activeFilters={activeFilters}
        isLoggedIn={Boolean(session?.user)}
        books={booksWithState as BooksPageBook[]}
        meta={meta as PaginationMeta}
        spRecord={spRecord}
        categoryName={categoryName}
        genreName={genreName}
      />
    </main>
  );
}

function BooksPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search + sort skeleton */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-14 flex-1 animate-pulse rounded-2xl bg-muted" />
        <div className="h-12 w-48 shrink-0 animate-pulse rounded-2xl bg-muted" />
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
