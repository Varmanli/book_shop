import type { NextRequest } from "next/server";
import { db } from "@/db";
import { books, categories } from "@/db/schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return Response.json({ books: [], categories: [] });
  }

  const pattern = `%${q}%`;

  const [bookRows, categoryRows] = await Promise.all([
    db
      .select({
        id: books.id,
        title: books.title,
        slug: books.slug,
        author: books.author,
        price: books.price,
        images: books.images,
        rank: sql<number>`
          CASE
            WHEN lower(${books.title}) LIKE lower(${pattern}) THEN 3
            WHEN lower(${books.author}) LIKE lower(${pattern}) THEN 2
            ELSE 1
          END
        `,
      })
      .from(books)
      .where(
        and(
          eq(books.isPublished, true),
          or(
            ilike(books.title, pattern),
            ilike(books.author, pattern),
            ilike(books.description, pattern)
          )
        )
      )
      .orderBy(
        sql`CASE
          WHEN lower(${books.title}) LIKE lower(${pattern}) THEN 3
          WHEN lower(${books.author}) LIKE lower(${pattern}) THEN 2
          ELSE 1
        END DESC`
      )
      .limit(6),

    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        image: categories.image,
      })
      .from(categories)
      .where(ilike(categories.name, pattern))
      .limit(4),
  ]);

  return Response.json({ books: bookRows, categories: categoryRows });
}
