import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { books, bookGenres } from "@/db/schema";
import { normalizePagination, buildPaginationMeta } from "@/lib/pagination";
import type { BookFilters, BookSortField, SortOrder } from "@/types/domain";
import type { PaginationParams, PaginationResult } from "@/types/api";
import type { CreateBookInput, UpdateBookInput } from "@/validations/book.schema";
import { slugify } from "@/lib/slug";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function findBooks(
  filters: BookFilters = {},
  pagination: PaginationParams = {},
  sort: { field: BookSortField; order: SortOrder } = {
    field: "createdAt",
    order: "desc",
  }
): Promise<PaginationResult<typeof books.$inferSelect>> {
  "use cache";
  cacheTag(CACHE_TAGS.booksList, CACHE_TAGS.books);

  const { page, pageSize, offset } = normalizePagination(pagination);

  const conditions = [];
  if (filters.isPublished !== undefined) {
    conditions.push(eq(books.isPublished, filters.isPublished));
  } else {
    conditions.push(eq(books.isPublished, true));
  }
  if (filters.categoryId) conditions.push(eq(books.categoryId, filters.categoryId));
  if (filters.qualityGrade) conditions.push(eq(books.qualityGrade, filters.qualityGrade));
  if (filters.isFeatured !== undefined) conditions.push(eq(books.isFeatured, filters.isFeatured));
  if (filters.minPrice !== undefined) conditions.push(gte(books.price, filters.minPrice));
  if (filters.maxPrice !== undefined) conditions.push(lte(books.price, filters.maxPrice));
  if (filters.search) {
    conditions.push(
      or(
        ilike(books.title, `%${filters.search}%`),
        ilike(books.author, `%${filters.search}%`),
        ilike(books.publisher, `%${filters.search}%`)
      )
    );
  }
  if (filters.inStock) {
    conditions.push(gt(books.stock, 0));
  }
  if (filters.genreId) {
    conditions.push(
      inArray(
        books.id,
        db
          .select({ bookId: bookGenres.bookId })
          .from(bookGenres)
          .where(eq(bookGenres.genreId, filters.genreId))
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderFn = sort.order === "asc" ? asc : desc;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(books)
      .where(where)
      .orderBy(orderFn(books[sort.field]))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(books).where(where),
  ]);

  return { items: rows, meta: buildPaginationMeta(Number(total), page, pageSize) };
}

export async function findBookBySlug(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.book(slug), CACHE_TAGS.books);

  return db.query.books.findFirst({
    where: and(eq(books.slug, slug), eq(books.isPublished, true)),
    with: {
      category: true,
      bookGenres: { with: { genre: true } },
    },
  });
}

export async function findBookById(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.bookById(id), CACHE_TAGS.books);

  return db.query.books.findFirst({
    where: eq(books.id, id),
    with: {
      category: true,
      bookGenres: { with: { genre: true } },
    },
  });
}

export async function findFeaturedBooks(limit = 8) {
  "use cache";
  cacheTag(CACHE_TAGS.booksFeatured, CACHE_TAGS.books);

  return db.query.books.findMany({
    where: and(eq(books.isFeatured, true), eq(books.isPublished, true)),
    limit,
    orderBy: desc(books.createdAt),
    with: { category: true },
  });
}

export async function findNewArrivals(limit = 8) {
  "use cache";
  cacheTag(CACHE_TAGS.booksNew, CACHE_TAGS.books);

  return db.query.books.findMany({
    where: eq(books.isPublished, true),
    limit,
    orderBy: desc(books.createdAt),
    with: { category: true },
  });
}

export async function findRelatedBooks(bookId: string, categoryId: string, limit = 4) {
  "use cache";
  cacheTag(CACHE_TAGS.books);

  return db.query.books.findMany({
    where: and(
      eq(books.categoryId, categoryId),
      eq(books.isPublished, true),
      sql`${books.id} != ${bookId}`
    ),
    limit,
    orderBy: desc(books.createdAt),
  });
}

export async function findBooksByCategory(categoryId: string, limit = 6) {
  "use cache";
  cacheTag(CACHE_TAGS.books, CACHE_TAGS.categories);

  return db.query.books.findMany({
    where: and(eq(books.categoryId, categoryId), eq(books.isPublished, true)),
    limit,
    orderBy: desc(books.createdAt),
    with: { category: true },
  });
}

export async function findBooksByGenre(genreId: string, limit = 6) {
  "use cache";
  cacheTag(CACHE_TAGS.books, CACHE_TAGS.genres);

  const rows = await db
    .select({ bookId: bookGenres.bookId })
    .from(bookGenres)
    .where(eq(bookGenres.genreId, genreId));

  if (rows.length === 0) return [];

  const bookIds = rows.map((r) => r.bookId);
  return db.query.books.findMany({
    where: and(inArray(books.id, bookIds), eq(books.isPublished, true)),
    limit,
    orderBy: desc(books.createdAt),
    with: { category: true },
  });
}

export async function createBook(data: CreateBookInput) {
  const slug = data.slug || slugify(data.title);
  const { genreIds, ...bookData } = data;

  const [book] = await db.insert(books).values({ ...bookData, slug }).returning();

  if (genreIds && genreIds.length > 0) {
    await db.insert(bookGenres).values(
      genreIds.map((genreId) => ({ bookId: book.id, genreId }))
    );
  }

  return book;
}

export async function updateBook(id: string, data: UpdateBookInput) {
  const { genreIds, ...bookData } = data;

  const updateData = {
    ...bookData,
    ...(data.title && !data.slug && { slug: slugify(data.title) }),
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(books)
    .set(updateData)
    .where(eq(books.id, id))
    .returning();

  if (genreIds !== undefined) {
    await db.delete(bookGenres).where(eq(bookGenres.bookId, id));
    if (genreIds.length > 0) {
      await db.insert(bookGenres).values(
        genreIds.map((genreId) => ({ bookId: id, genreId }))
      );
    }
  }

  return updated;
}

export async function deleteBook(id: string) {
  const [deleted] = await db.delete(books).where(eq(books.id, id)).returning();
  return deleted;
}

export async function countBooks() {
  const [{ total }] = await db.select({ total: count() }).from(books);
  return Number(total);
}
