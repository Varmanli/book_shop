import { eq, count } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db";
import { genres, bookGenres } from "@/db/schema";
import { slugify } from "@/lib/slug";
import type { CreateGenreInput, UpdateGenreInput } from "@/validations/genre.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function findAllGenres() {
  "use cache";
  cacheTag(CACHE_TAGS.genres);

  return db.query.genres.findMany({
    orderBy: (g, { asc }) => asc(g.name),
  });
}

export async function findGenresWithCount() {
  "use cache";
  cacheTag(CACHE_TAGS.genres, CACHE_TAGS.books);

  return db
    .select({
      id: genres.id,
      name: genres.name,
      slug: genres.slug,
      image: genres.image,
      bookCount: count(bookGenres.bookId),
    })
    .from(genres)
    .leftJoin(bookGenres, eq(bookGenres.genreId, genres.id))
    .groupBy(genres.id, genres.name, genres.slug, genres.image)
    .orderBy(genres.name);
}

export async function findGenreById(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.genre(id), CACHE_TAGS.genres);

  return db.query.genres.findFirst({ where: eq(genres.id, id) });
}

export async function createGenre(data: CreateGenreInput) {
  const slug = data.slug || slugify(data.name);
  const [genre] = await db.insert(genres).values({ ...data, slug }).returning();
  return genre;
}

export async function updateGenre(id: string, data: UpdateGenreInput) {
  const [updated] = await db
    .update(genres)
    .set(data)
    .where(eq(genres.id, id))
    .returning();
  return updated;
}

export async function deleteGenre(id: string) {
  const [deleted] = await db
    .delete(genres)
    .where(eq(genres.id, id))
    .returning();
  return deleted;
}
