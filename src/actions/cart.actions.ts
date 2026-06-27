"use server";

import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/session";
import * as cartService from "@/services/cart.service";
import { ok, fail, type ApiResponse } from "@/types/api";
import type { CartItem } from "@/types";

const CART_SESSION_COOKIE = "cart_session";

async function getCartOwner() {
  const userId = await getCurrentUserId();
  if (userId) return { userId };

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return { sessionId };
}

export async function getCartAction() {
  const owner = await getCartOwner();
  return cartService.getCart(owner);
}

export async function addToCartAction(
  bookId: string,
  quantity: number = 1
): Promise<ApiResponse<CartItem>> {
  const owner = await getCartOwner();
  try {
    const item = await cartService.addToCart(owner, bookId, quantity);
    return ok(item);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در افزودن به سبد خرید");
  }
}

export async function updateCartItemAction(
  itemId: string,
  quantity: number
): Promise<ApiResponse<null>> {
  const owner = await getCartOwner();
  try {
    await cartService.updateCartItem(owner, itemId, quantity);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در بروزرسانی");
  }
}

export async function removeFromCartAction(itemId: string): Promise<ApiResponse<null>> {
  try {
    await cartService.removeFromCart(itemId);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف از سبد خرید");
  }
}

export async function clearCartAction(): Promise<ApiResponse<null>> {
  const owner = await getCartOwner();
  try {
    await cartService.clearCart(owner);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در پاک کردن سبد خرید");
  }
}
