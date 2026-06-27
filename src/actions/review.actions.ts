"use server";

import { revalidateTag } from "next/cache";
import { requireAuth } from "@/lib/session";
import * as reviewRepo from "@/repositories/reviews.repository";
import { createReviewSchema, updateReviewStatusSchema } from "@/validations/review.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Review } from "@/db/schema/reviews";

export async function submitReviewAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Review>> {
  const session = await requireAuth();

  const raw = {
    bookId: formData.get("bookId") as string,
    rating: formData.get("rating") as string,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };

  const parsed = createReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("اطلاعات وارد شده معتبر نیست", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  // One review per user per book
  const existing = await reviewRepo.findUserReviewForBook(session.user.id, parsed.data.bookId);
  if (existing) {
    return fail("شما قبلاً برای این کتاب نظر ثبت کرده‌اید");
  }

  try {
    const review = await reviewRepo.createReview(session.user.id, parsed.data);
    // Don't revalidate the public reviews cache — it only shows APPROVED
    return ok(review);
  } catch {
    return fail("خطا در ثبت نظر. لطفاً دوباره تلاش کنید");
  }
}

export async function adminUpdateReviewStatusAction(
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  adminNote?: string
): Promise<ApiResponse<Review>> {
  await requireAuth();

  const parsed = updateReviewStatusSchema.safeParse({ status, adminNote });
  if (!parsed.success) return fail("وضعیت نامعتبر");

  try {
    const review = await reviewRepo.updateReviewStatus(id, parsed.data.status, parsed.data.adminNote);

    // When approving/rejecting, revalidate the public-facing book review cache
    revalidateTag(CACHE_TAGS.reviewsByBook(review.bookId), "max");
    revalidateTag(CACHE_TAGS.reviewsAdmin, "max");

    return ok(review);
  } catch {
    return fail("خطا در بروزرسانی وضعیت");
  }
}

export async function adminDeleteReviewAction(id: string): Promise<ApiResponse<null>> {
  await requireAuth();

  try {
    const review = await reviewRepo.findReviewById(id);
    if (!review) return fail("نظر یافت نشد");

    await reviewRepo.deleteReview(id);
    revalidateTag(CACHE_TAGS.reviewsByBook(review.bookId), "max");
    revalidateTag(CACHE_TAGS.reviewsAdmin, "max");

    return ok(null);
  } catch {
    return fail("خطا در حذف نظر");
  }
}
