import { cacheTag } from "next/cache";
import { db } from "@/db";
import { homeSlides } from "@/db/schema/home-slides";
import { asc, eq, gte, gt, lte, and, ne, sql } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function findActiveSlides() {
  "use cache";
  cacheTag(CACHE_TAGS.homeSlides);

  return db
    .select()
    .from(homeSlides)
    .where(eq(homeSlides.isActive, true))
    .orderBy(asc(homeSlides.order));
}

export async function findAllSlides() {
  "use cache";
  cacheTag(CACHE_TAGS.homeSlides);

  return db.select().from(homeSlides).orderBy(asc(homeSlides.order));
}

export async function findSlideById(id: string) {
  const [slide] = await db
    .select()
    .from(homeSlides)
    .where(eq(homeSlides.id, id));
  return slide ?? null;
}

export async function getMaxOrder(): Promise<number> {
  const [result] = await db
    .select({ max: sql<number>`coalesce(max(${homeSlides.order}), 0)` })
    .from(homeSlides);
  return result?.max ?? 0;
}

/** Shift all slides with order >= fromOrder up by 1, optionally excluding one id */
export async function shiftOrdersUp(fromOrder: number, excludeId?: string): Promise<void> {
  const cond = excludeId
    ? and(gte(homeSlides.order, fromOrder), ne(homeSlides.id, excludeId))
    : gte(homeSlides.order, fromOrder);
  await db
    .update(homeSlides)
    .set({ order: sql`${homeSlides.order} + 1` })
    .where(cond);
}

/** Shift slides with oldOrder < order <= newOrder (excluding id) down by 1 */
export async function shiftOrdersDown(
  oldOrder: number,
  newOrder: number,
  excludeId: string
): Promise<void> {
  await db
    .update(homeSlides)
    .set({ order: sql`${homeSlides.order} - 1` })
    .where(
      and(
        gt(homeSlides.order, oldOrder),
        lte(homeSlides.order, newOrder),
        ne(homeSlides.id, excludeId)
      )
    );
}

/** Rewrite all slide orders to 1, 2, 3… (stable by current order, then createdAt, then id) */
export async function normalizeSlideOrders(): Promise<void> {
  const slides = await db
    .select({ id: homeSlides.id })
    .from(homeSlides)
    .orderBy(asc(homeSlides.order), asc(homeSlides.createdAt), asc(homeSlides.id));

  for (let i = 0; i < slides.length; i++) {
    await db
      .update(homeSlides)
      .set({ order: i + 1 })
      .where(eq(homeSlides.id, slides[i].id));
  }
}

export async function createSlide(data: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  order: number;
}) {
  const [slide] = await db.insert(homeSlides).values(data).returning();
  return slide;
}

export async function updateSlide(
  id: string,
  data: Partial<{
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    order: number;
    isActive: boolean;
  }>
) {
  const [slide] = await db
    .update(homeSlides)
    .set(data)
    .where(eq(homeSlides.id, id))
    .returning();
  return slide;
}

export async function deleteSlide(id: string) {
  await db.delete(homeSlides).where(eq(homeSlides.id, id));
}
