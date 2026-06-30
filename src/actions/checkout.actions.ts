"use server";

import { requireAuth } from "@/lib/session";
import * as orderService from "@/services/order.service";
import { checkoutSchema } from "@/validations/checkout.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type PlaceOrderResult = {
  orderId: string;
  orderNumber: string;
};

/**
 * Step 1 of checkout: validate input and create the order as PENDING.
 * Returns the new order id so the client can proceed to the payment step.
 */
export async function placeOrderCheckoutAction(
  data: unknown
): Promise<ApiResponse<PlaceOrderResult>> {
  const session = await requireAuth();

  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) {
    return fail(
      "لطفاً اطلاعات را بررسی کنید",
      parsed.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  try {
    const order = await orderService.placeOrder(
      session.user.id,
      parsed.data.addressId,
      parsed.data.notes ?? null,
      parsed.data.couponCode ?? null
    );

    revalidateTag(CACHE_TAGS.userOrders(session.user.id), "max");

    return ok({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "خطا در ثبت سفارش"
    );
  }
}

/**
 * Step 2 of checkout: simulate payment and mark order as PAID.
 * Swap this function body for real gateway verification (Zarinpal / Zibal)
 * without changing the action signature.
 */
export async function confirmMockPaymentAction(
  orderId: string
): Promise<ApiResponse<PlaceOrderResult>> {
  const session = await requireAuth();

  if (!orderId) return fail("شناسه سفارش نامعتبر است");

  try {
    const result = await orderService.simulateMockPayment(orderId);

    revalidateTag(CACHE_TAGS.userOrders(session.user.id), "max");
    revalidateTag(CACHE_TAGS.order(orderId), "max");

    return ok(result);
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "خطا در تأیید پرداخت"
    );
  }
}
