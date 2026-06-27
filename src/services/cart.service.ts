import * as cartRepo from "@/repositories/cart.repository";
import * as bookRepo from "@/repositories/book.repository";
import { siteConfig } from "@/config/site";

type CartOwner =
  | { userId: string; sessionId?: never }
  | { sessionId: string; userId?: never };

export async function getCart(owner: CartOwner) {
  const items = await cartRepo.findCartItems(owner);
  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const shippingCost =
    subtotal >= siteConfig.shipping.freeShippingThreshold
      ? 0
      : siteConfig.shipping.defaultShippingCost;
  const total = subtotal + shippingCost;

  return { items, subtotal, shippingCost, total, itemCount: items.length };
}

export async function addToCart(
  owner: CartOwner,
  bookId: string,
  quantity: number = 1
) {
  const book = await bookRepo.findBookById(bookId);
  if (!book || !book.isPublished) throw new Error("کتاب یافت نشد");
  if (book.stock < quantity) throw new Error("موجودی کافی نیست");

  return cartRepo.addCartItem(owner, bookId, quantity);
}

export async function updateCartItem(
  owner: CartOwner,
  itemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    await cartRepo.removeCartItem(itemId);
    return null;
  }
  return cartRepo.updateCartItemQuantity(itemId, quantity);
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
