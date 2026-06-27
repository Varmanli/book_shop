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

export async function addCartItem(
  identifier: CartIdentifier,
  bookId: string,
  quantity: number
) {
  const existing = await findCartItem(identifier, bookId);

  if (existing) {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(cartItems)
    .values({
      userId: "userId" in identifier ? identifier.userId : null,
      sessionId: "sessionId" in identifier ? identifier.sessionId : null,
      bookId,
      quantity,
    })
    .returning();
  return created;
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  const [updated] = await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItems.id, id))
    .returning();
  return updated;
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

export async function mergeGuestCartIntoUserCart(
  sessionId: string,
  userId: string
) {
  const guestItems = await db.query.cartItems.findMany({
    where: eq(cartItems.sessionId, sessionId),
  });

  for (const item of guestItems) {
    await addCartItem({ userId }, item.bookId, item.quantity);
  }

  await clearCart({ sessionId });
}
