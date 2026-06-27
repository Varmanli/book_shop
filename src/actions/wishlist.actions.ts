"use server";

import { requireAuth } from "@/lib/session";
import * as wishlistRepo from "@/repositories/wishlist.repository";
import { ok, fail, type ApiResponse } from "@/types/api";

export async function addToWishlistAction(bookId: string): Promise<ApiResponse<null>> {
  const session = await requireAuth();
  try {
    await wishlistRepo.addToWishlist(session.user.id, bookId);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در افزودن به علاقه‌مندی");
  }
}

export async function removeFromWishlistAction(bookId: string): Promise<ApiResponse<null>> {
  const session = await requireAuth();
  try {
    await wishlistRepo.removeFromWishlist(session.user.id, bookId);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف از علاقه‌مندی");
  }
}
