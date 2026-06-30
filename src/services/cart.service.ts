import * as cartRepo from "@/repositories/cart.repository";
import * as bookRepo from "@/repositories/book.repository";
import { getShippingSettings } from "@/repositories/settings.repository";

type CartOwner =
  | { userId: string; sessionId?: never }
  | { sessionId: string; userId?: never };

export async function getCart(owner: CartOwner) {
  const [items, { shippingCost: baseShipping, freeShippingThreshold }] =
    await Promise.all([
      cartRepo.findCartItems(owner),
      getShippingSettings(),
    ]);

  const subtotal = items.reduce((sum, item) => sum + item.book.price, 0);

  // Free-shipping threshold is optional and admin-controlled.
  // When not configured (null) shipping always applies.
  const shippingCost =
    freeShippingThreshold !== null && subtotal >= freeShippingThreshold
      ? 0
      : baseShipping;

  const total = subtotal + shippingCost;

  return {
    items,
    subtotal,
    baseShippingCost: baseShipping,
    shippingCost,
    freeShippingThreshold,
    total,
    itemCount: items.length,
  };
}

export async function addToCart(owner: CartOwner, bookId: string) {
  const book = await bookRepo.findBookById(bookId);
  if (!book || !book.isPublished) throw new Error("کتاب یافت نشد");
  if (book.isSold) throw new Error("این کتاب قبلاً فروخته شده است");

  return cartRepo.addCartItem(owner, bookId);
}

export async function removeFromCart(itemId: string) {
  await cartRepo.removeCartItem(itemId);
}

export async function clearCart(owner: CartOwner) {
  await cartRepo.clearCart(owner);
}

export async function mergeGuestCart(sessionId: string, userId: string) {
  await cartRepo.mergeGuestCartIntoUserCart(sessionId, userId);
}
