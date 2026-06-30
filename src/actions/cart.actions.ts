"use server";

import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/session";
import * as cartService from "@/services/cart.service";
import { ok, fail, type ApiResponse } from "@/types/api";
import type { CartItem } from "@/types";
import { getShippingSettings } from "@/repositories/settings.repository";
import { CART_SESSION_COOKIE } from "@/config/cart";

async function getCartOwner(createIfMissing = true) {
  const userId = await getCurrentUserId();
  if (userId) return { userId };

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId && createIfMissing) {
    sessionId = crypto.randomUUID();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return sessionId ? { sessionId } : null;
}

export async function getCartAction() {
  const owner = await getCartOwner(false);
  if (!owner) {
    const { shippingCost, freeShippingThreshold } = await getShippingSettings();
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      baseShippingCost: shippingCost,
      shippingCost: 0,
      freeShippingThreshold: freeShippingThreshold ?? null,
      total: 0,
    };
  }
  return cartService.getCart(owner);
}

/** Single-copy model: no quantity param — one book = one cart slot */
export async function addToCartAction(bookId: string): Promise<ApiResponse<CartItem>> {
  const owner = await getCartOwner(true);
  if (!owner) return fail("خطا در شناسایی سبد خرید");
  try {
    const item = await cartService.addToCart(owner, bookId);
    return ok(item);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در افزودن به سبد خرید");
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
  const owner = await getCartOwner(false);
  if (!owner) return ok(null);
  try {
    await cartService.clearCart(owner);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در پاک کردن سبد خرید");
  }
}
