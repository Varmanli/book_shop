import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { books, posts } from "@/db/schema";
import { siteConfig } from "@/config/site";

const staticRoutes = ["", "/books", "/about", "/contact", "/blog", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  // Dynamic routes are best-effort: if the database is unreachable at build
  // time, fall back to just the static routes instead of failing the build.
  try {
    const [publishedBooks, publishedPosts] = await Promise.all([
      db
        .select({ slug: books.slug, updatedAt: books.updatedAt })
        .from(books)
        .where(eq(books.isPublished, true)),
      db
        .select({ slug: posts.slug, updatedAt: posts.updatedAt })
        .from(posts)
        .where(eq(posts.status, "PUBLISHED")),
    ]);

    const bookEntries: MetadataRoute.Sitemap = publishedBooks.map((book) => ({
      url: `${baseUrl}/books/${book.slug}`,
      lastModified: book.updatedAt,
    }));

    const postEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    }));

    return [...staticEntries, ...bookEntries, ...postEntries];
  } catch (error) {
    console.error("sitemap: failed to load dynamic routes from the database", error);
    return staticEntries;
  }
}
