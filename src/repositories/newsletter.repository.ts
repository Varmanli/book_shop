import { cacheTag } from "next/cache";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema/newsletter";
import { eq, desc } from "drizzle-orm";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function subscribeEmail(email: string) {
  const [existing] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email));

  if (existing) {
    if (existing.isActive) return existing;
    const [reactivated] = await db
      .update(newsletterSubscribers)
      .set({ isActive: true, unsubscribedAt: null })
      .where(eq(newsletterSubscribers.email, email))
      .returning();
    return reactivated;
  }

  const [subscriber] = await db
    .insert(newsletterSubscribers)
    .values({ email })
    .returning();
  return subscriber;
}

export async function unsubscribeEmail(email: string) {
  const [subscriber] = await db
    .update(newsletterSubscribers)
    .set({ isActive: false, unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.email, email))
    .returning();
  return subscriber;
}

export async function getAllSubscribers() {
  "use cache";
  cacheTag(CACHE_TAGS.newsletterSubscribers);

  return db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.subscribedAt));
}

export async function getActiveSubscriberCount() {
  "use cache";
  cacheTag(CACHE_TAGS.newsletterSubscribers);

  const rows = await db
    .select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true));
  return rows.length;
}
