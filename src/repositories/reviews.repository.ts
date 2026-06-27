import { and, avg, count, desc, eq, ilike, or } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { books } from "@/db/schema/books";
import { users } from "@/db/schema/users";
import { normalizePagination, buildPaginationMeta } from "@/lib/pagination";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { PaginationParams, PaginationResult } from "@/types/api";
import type { CreateReviewInput } from "@/validations/review.schema";

export type ReviewWithUser = typeof reviews.$inferSelect & {
  user: { name: string | null; image: string | null };
};

export type ReviewWithDetails = typeof reviews.$inferSelect & {
  user: { name: string | null; image: string | null };
  book: { title: string; slug: string };
};

export async function createReview(
  userId: string,
  data: CreateReviewInput
): Promise<typeof reviews.$inferSelect> {
  const [review] = await db
    .insert(reviews)
    .values({
      userId,
      bookId: data.bookId,
      rating: data.rating,
      title: data.title || null,
      content: data.content,
      status: "PENDING",
    })
    .returning();
  return review;
}

export async function findReviewsByBook(
  bookId: string,
  options: { status?: "PENDING" | "APPROVED" | "REJECTED"; page?: number; pageSize?: number } = {}
): Promise<{ items: ReviewWithUser[]; meta: ReturnType<typeof buildPaginationMeta>; averageRating: number; totalApproved: number }> {
  "use cache";
  cacheTag(CACHE_TAGS.reviewsByBook(bookId));

  const { page, pageSize, offset } = normalizePagination({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 5,
  });

  const statusFilter = options.status
    ? eq(reviews.status, options.status)
    : eq(reviews.status, "APPROVED");

  const [rows, [{ total }], [{ avg: avgRaw }], [{ approved }]] = await Promise.all([
    db.query.reviews.findMany({
      where: and(eq(reviews.bookId, bookId), statusFilter),
      orderBy: desc(reviews.createdAt),
      limit: pageSize,
      offset,
      with: { user: { columns: { name: true, image: true } } },
    }),
    db.select({ total: count() }).from(reviews).where(and(eq(reviews.bookId, bookId), statusFilter)),
    db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(and(eq(reviews.bookId, bookId), eq(reviews.status, "APPROVED"))),
    db
      .select({ approved: count() })
      .from(reviews)
      .where(and(eq(reviews.bookId, bookId), eq(reviews.status, "APPROVED"))),
  ]);

  return {
    items: rows as ReviewWithUser[],
    meta: buildPaginationMeta(Number(total), page, pageSize),
    averageRating: avgRaw ? Math.round(Number(avgRaw) * 10) / 10 : 0,
    totalApproved: Number(approved),
  };
}

export async function findReviewById(id: string) {
  return db.query.reviews.findFirst({
    where: eq(reviews.id, id),
    with: {
      user: { columns: { name: true, email: true, image: true } },
      book: { columns: { title: true, slug: true } },
    },
  });
}

export async function findUserReviewForBook(userId: string, bookId: string) {
  "use cache";
  cacheTag(CACHE_TAGS.reviewsByBook(bookId));

  return db.query.reviews.findFirst({
    where: and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)),
  });
}

export async function updateReviewStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  adminNote?: string
) {
  const [updated] = await db
    .update(reviews)
    .set({ status, adminNote: adminNote || null, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning();
  return updated;
}

export async function deleteReview(id: string) {
  const [deleted] = await db.delete(reviews).where(eq(reviews.id, id)).returning();
  return deleted;
}

export async function findAllReviews(
  filters: { status?: "PENDING" | "APPROVED" | "REJECTED"; search?: string } = {},
  pagination: PaginationParams = {}
): Promise<PaginationResult<ReviewWithDetails>> {
  "use cache";
  cacheTag(CACHE_TAGS.reviewsAdmin);

  const { page, pageSize, offset } = normalizePagination(pagination);

  const conditions = [];
  if (filters.status) conditions.push(eq(reviews.status, filters.status));
  if (filters.search) {
    conditions.push(
      or(
        ilike(books.title, `%${filters.search}%`),
        ilike(users.email, `%${filters.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.reviews.findMany({
      where,
      orderBy: desc(reviews.createdAt),
      limit: pageSize,
      offset,
      with: {
        user: { columns: { name: true, email: true, image: true } },
        book: { columns: { title: true, slug: true } },
      },
    }),
    db.select({ total: count() }).from(reviews).where(where),
  ]);

  return {
    items: rows as ReviewWithDetails[],
    meta: buildPaginationMeta(Number(total), page, pageSize),
  };
}

export async function getReviewStats() {
  "use cache";
  cacheTag(CACHE_TAGS.reviewsAdmin);

  const [{ total }] = await db.select({ total: count() }).from(reviews);
  const [{ pending }] = await db
    .select({ pending: count() })
    .from(reviews)
    .where(eq(reviews.status, "PENDING"));
  const [{ avgRating }] = await db
    .select({ avgRating: avg(reviews.rating) })
    .from(reviews)
    .where(eq(reviews.status, "APPROVED"));

  return {
    total: Number(total),
    pending: Number(pending),
    averageRating: avgRating ? Math.round(Number(avgRating) * 10) / 10 : 0,
  };
}
