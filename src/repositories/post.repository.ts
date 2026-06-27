import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { normalizePagination, buildPaginationMeta } from "@/lib/pagination";
import { slugify } from "@/lib/slug";
import type { PaginationParams } from "@/types/api";
import type { CreatePostInput, UpdatePostInput } from "@/validations/post.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type PostFilters = {
  search?: string;
  category?: string;
};

export async function findPublishedPosts(
  filters: PostFilters = {},
  pagination: PaginationParams = {}
) {
  "use cache";
  cacheTag(CACHE_TAGS.posts);

  const { page, pageSize, offset } = normalizePagination(pagination);

  const conditions = [eq(posts.status, "PUBLISHED")];
  if (filters.search) {
    conditions.push(ilike(posts.title, `%${filters.search}%`));
  }
  if (filters.category) {
    conditions.push(eq(posts.category, filters.category));
  }
  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db.query.posts.findMany({
      where,
      orderBy: desc(posts.publishedAt),
      limit: pageSize,
      offset,
      with: { author: true },
    }),
    db.select({ total: count() }).from(posts).where(where),
  ]);

  return { items: rows, meta: buildPaginationMeta(Number(total), page, pageSize) };
}

export async function findPostCategories(): Promise<string[]> {
  "use cache";
  cacheTag(CACHE_TAGS.posts);

  const rows = await db
    .selectDistinct({ category: posts.category })
    .from(posts)
    .where(eq(posts.status, "PUBLISHED"))
    .orderBy(posts.category);

  return rows.map((r) => r.category).filter(Boolean);
}

export async function findAllPosts(pagination: PaginationParams = {}) {
  "use cache";
  cacheTag(CACHE_TAGS.posts);

  const { page, pageSize, offset } = normalizePagination(pagination);

  const [rows, [{ total }]] = await Promise.all([
    db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      limit: pageSize,
      offset,
      with: { author: true },
    }),
    db.select({ total: count() }).from(posts),
  ]);

  return { items: rows, meta: buildPaginationMeta(Number(total), page, pageSize) };
}

export async function findPostBySlug(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.post(slug), CACHE_TAGS.posts);

  return db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.status, "PUBLISHED")),
    with: { author: true },
  });
}

export async function findPostById(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.posts);

  return db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { author: true },
  });
}

export async function findLatestPosts(limit = 3) {
  "use cache";
  cacheTag(CACHE_TAGS.posts);

  return db.query.posts.findMany({
    where: eq(posts.status, "PUBLISHED"),
    orderBy: desc(posts.publishedAt),
    limit,
    with: { author: true },
  });
}

export async function createPost(authorId: string, data: CreatePostInput) {
  const slug = data.slug || slugify(data.title);
  const [post] = await db
    .insert(posts)
    .values({
      ...data,
      slug,
      authorId,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  return post;
}

export async function updatePost(id: string, data: UpdatePostInput) {
  const current = await findPostById(id);
  const wasPublished = current?.status === "PUBLISHED";
  const nowPublished = data.status === "PUBLISHED";

  const [updated] = await db
    .update(posts)
    .set({
      ...data,
      updatedAt: new Date(),
      publishedAt:
        !wasPublished && nowPublished ? new Date() : current?.publishedAt,
    })
    .where(eq(posts.id, id))
    .returning();
  return updated;
}

export async function deletePost(id: string) {
  const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning();
  return deleted;
}
