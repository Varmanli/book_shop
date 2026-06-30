import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems } from "@/db/schema";

type CartIdentifier =
  | { userId: string; sessionId?: never }
  | { sessionId: string; userId?: never };

export async function findCartItems(identifier: CartIdentifier) {
  const where =
    "userId" in identifier && identifier.userId
      ? eq(cartItems.userId, identifier.userId)
      : eq(cartItems.sessionId, identifier.sessionId!);

  return db.query.cartItems.findMany({
    where,
    with: { book: true },
  });
}

export async function findCartItem(identifier: CartIdentifier, bookId: string) {
  const ownerCondition =
    "userId" in identifier && identifier.userId
      ? eq(cartItems.userId, identifier.userId)
      : eq(cartItems.sessionId, identifier.sessionId!);

  return db.query.cartItems.findFirst({
    where: and(ownerCondition, eq(cartItems.bookId, bookId)),
  });
}

/**
 * Adds a book to the cart. Throws if the book is already in this cart —
 * each physical book can appear only once.
 */
export async function addCartItem(identifier: CartIdentifier, bookId: string) {
  const existing = await findCartItem(identifier, bookId);
  if (existing) {
    throw new Error("این کتاب قبلاً در سبد خرید شماست");
  }

  const [created] = await db
    .insert(cartItems)
    .values({
      userId: "userId" in identifier ? identifier.userId : null,
      sessionId: "sessionId" in identifier ? identifier.sessionId : null,
      bookId,
    })
    .returning();
  return created;
}

export async function removeCartItem(id: string) {
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(identifier: CartIdentifier) {
  const where =
    "userId" in identifier && identifier.userId
      ? eq(cartItems.userId, identifier.userId)
      : eq(cartItems.sessionId, identifier.sessionId!);
  await db.delete(cartItems).where(where);
}

/**
 * Merges guest cart into user cart after login.
 * Skips any book already present in the user's cart (no duplicates).
 */
export async function mergeGuestCartIntoUserCart(
  sessionId: string,
  userId: string
) {
  const guestItems = await db.query.cartItems.findMany({
    where: eq(cartItems.sessionId, sessionId),
  });

  for (const item of guestItems) {
    const alreadyInCart = await findCartItem({ userId }, item.bookId);
    if (!alreadyInCart) {
      await addCartItem({ userId }, item.bookId);
    }
  }

  await clearCart({ sessionId });
}
