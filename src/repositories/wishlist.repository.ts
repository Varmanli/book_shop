import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";

export async function findWishlistItems(userId: string) {
  return db.query.wishlistItems.findMany({
    where: eq(wishlistItems.userId, userId),
    with: { book: true },
    orderBy: (w, { desc }) => desc(w.createdAt),
  });
}

export async function findWishlistItem(userId: string, bookId: string) {
  return db.query.wishlistItems.findFirst({
    where: and(
      eq(wishlistItems.userId, userId),
      eq(wishlistItems.bookId, bookId)
    ),
  });
}

export async function addToWishlist(userId: string, bookId: string) {
  const [item] = await db
    .insert(wishlistItems)
    .values({ userId, bookId })
    .onConflictDoNothing()
    .returning();
  return item;
}

export async function removeFromWishlist(userId: string, bookId: string) {
  await db
    .delete(wishlistItems)
    .where(
      and(eq(wishlistItems.userId, userId), eq(wishlistItems.bookId, bookId))
    );
}
