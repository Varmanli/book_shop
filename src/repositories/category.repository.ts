import { eq, count } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, books } from "@/db/schema";
import { slugify } from "@/lib/slug";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function findAllCategories() {
  "use cache";
  cacheTag(CACHE_TAGS.categories);

  return db.query.categories.findMany({
    orderBy: (c, { asc }) => asc(c.name),
  });
}

export async function findCategoriesWithCount() {
  "use cache";
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.books);

  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      image: categories.image,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      bookCount: count(books.id),
    })
    .from(categories)
    .leftJoin(books, eq(books.categoryId, categories.id))
    .groupBy(
      categories.id,
      categories.name,
      categories.slug,
      categories.description,
      categories.image,
      categories.createdAt,
      categories.updatedAt
    )
    .orderBy(categories.name);
}

export async function findCategoryBySlug(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.category(slug), CACHE_TAGS.categories);

  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}

export async function findCategoryById(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.categories);

  return db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
}

export async function createCategory(data: CreateCategoryInput) {
  const slug = data.slug || slugify(data.name);
  const [category] = await db
    .insert(categories)
    .values({ ...data, slug })
    .returning();
  return category;
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const [updated] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return updated;
}

export async function deleteCategory(id: string) {
  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();
  return deleted;
}
