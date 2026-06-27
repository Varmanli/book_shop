import { cacheTag } from "next/cache";
import { db } from "@/db";
import { homeSlides } from "@/db/schema/home-slides";
import { asc, eq } from "drizzle-orm";
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

export async function createSlide(data: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  order?: number;
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
