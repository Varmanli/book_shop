"use server";

import { requireAdmin } from "@/lib/session";
import * as couponRepo from "@/repositories/coupon.repository";
import * as couponService from "@/services/coupon.service";
import { createCouponSchema, updateCouponSchema } from "@/validations/coupon.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import type { Coupon } from "@/db/schema/coupons";

export interface CouponPreview {
  code: string;
  type: string;
  value: number;
  discountAmount: number;
}

/**
 * Public-facing action: validate a coupon code against a subtotal.
 * Returns the discount amount and coupon info for UI display.
 * The actual discount is RE-VALIDATED server-side in placeOrder — this
 * endpoint is only for live feedback; it cannot be abused to create fake discounts.
 */
export async function validateCouponAction(
  code: string,
  subtotal: number
): Promise<ApiResponse<CouponPreview>> {
  if (!code || subtotal <= 0) return fail("اطلاعات نامعتبر است");

  try {
    const { coupon, discountAmount } = await couponService.validateCoupon(
      code,
      subtotal
    );
    return ok({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در بررسی کد تخفیف");
  }
}

/* ── Admin CRUD ─────────────────────────────────────────────── */

export async function createCouponAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Coupon>> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = createCouponSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("داده‌های نامعتبر", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  try {
    const coupon = await couponRepo.createCoupon(parsed.data as any);
    return ok(coupon);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "خطا در ایجاد کد تخفیف";
    if (msg.includes("unique")) return fail("این کد تخفیف قبلاً ثبت شده است");
    return fail(msg);
  }
}

export async function updateCouponAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Coupon>> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);
  const parsed = updateCouponSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("داده‌های نامعتبر", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  try {
    const coupon = await couponRepo.updateCoupon(id, parsed.data as any);
    if (!coupon) return fail("کد تخفیف یافت نشد");
    return ok(coupon);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در بروزرسانی");
  }
}

export async function deleteCouponAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();
  try {
    await couponRepo.deleteCoupon(id);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف کد تخفیف");
  }
}

export async function toggleCouponActiveAction(
  id: string,
  isActive: boolean
): Promise<ApiResponse<Coupon>> {
  await requireAdmin();
  try {
    const coupon = await couponRepo.updateCoupon(id, { isActive });
    if (!coupon) return fail("کد تخفیف یافت نشد");
    return ok(coupon);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا");
  }
}
