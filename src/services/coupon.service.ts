import * as couponRepo from "@/repositories/coupon.repository";
import type { Coupon } from "@/db/schema/coupons";

export interface CouponValidationResult {
  coupon: Coupon;
  discountAmount: number;
}

/**
 * Validates a coupon code against a given subtotal and returns the discount.
 * ALL validation is server-side — this function must never be called from
 * client code directly.
 *
 * Throws a user-facing Persian error on any failure.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await couponRepo.findCouponByCode(code);

  if (!coupon) throw new Error("کد تخفیف یافت نشد");
  if (!coupon.isActive) throw new Error("این کد تخفیف فعال نیست");

  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
    throw new Error("این کد تخفیف منقضی شده است");
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new Error("ظرفیت استفاده از این کد تخفیف تمام شده است");
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new Error(
      `حداقل مبلغ سفارش برای استفاده از این کد ${coupon.minOrderAmount.toLocaleString("fa-IR")} ریال است`
    );
  }

  const discountAmount = computeDiscount(coupon, subtotal);

  return { coupon, discountAmount };
}

/** Calculate discount amount without side-effects (safe to call multiple times). */
export function computeDiscount(coupon: Coupon, subtotal: number): number {
  let amount: number;

  if (coupon.type === "PERCENT") {
    amount = Math.floor((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
      amount = Math.min(amount, coupon.maxDiscount);
    }
  } else {
    amount = coupon.value;
  }

  // Discount can never exceed the subtotal
  return Math.min(amount, subtotal);
}

/** Called after order is successfully persisted to increment the usage counter. */
export async function recordCouponUsage(code: string): Promise<void> {
  await couponRepo.incrementCouponUsage(code);
}
