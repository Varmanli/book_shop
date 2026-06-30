/**
 * One-time backfill script: generates valid Persian slugs for all blog posts
 * that currently have an empty, very short, or duplicate slug.
 *
 * Run with:  npx tsx scripts/backfill-blog-slugs.ts
 */

import { eq, ne, and } from "drizzle-orm";
import { db } from "../src/db";
import { posts } from "../src/db/schema";
import { slugify } from "../src/lib/slug";

async function createUniqueSlug(base: string, excludeId: string): Promise<string> {
  const normalized = slugify(base) || `post-${Date.now().toString(36)}`;
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.slug, candidate), ne(posts.id, excludeId)))
      .limit(1);
    if (existing.length === 0) return candidate;
    candidate = `${normalized}-${suffix}`;
    suffix++;
  }
}

async function main() {
  console.log("🔍 Scanning blog posts for broken slugs…\n");

  const allPosts = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug })
    .from(posts);

  const seen = new Set<string>();
  let fixed = 0;

  for (const post of allPosts) {
    const currentSlug = post.slug ?? "";
    const isInvalid = !currentSlug || currentSlug.length < 2 || seen.has(currentSlug);

    if (isInvalid) {
      const newSlug = await createUniqueSlug(post.title, post.id);
      await db.update(posts).set({ slug: newSlug }).where(eq(posts.id, post.id));
      console.log(`✅  [${post.id.slice(0, 8)}] "${post.title}"`);
      console.log(`     ${currentSlug || "(empty)"} → ${newSlug}\n`);
      seen.add(newSlug);
      fixed++;
    } else {
      seen.add(currentSlug);
    }
  }

  if (fixed === 0) {
    console.log("✓ All posts already have valid slugs. Nothing to fix.");
  } else {
    console.log(`\nDone. Fixed ${fixed} post(s).`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
