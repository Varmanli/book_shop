"use server";

import { requireAuth, requireAdmin } from "@/lib/session";
import * as orderService from "@/services/order.service";
import { createOrderSchema, updateOrderStatusSchema } from "@/validations/order.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
import type { Order } from "@/types";
import type { OrderStatus } from "@/types/domain";

export async function placeOrderAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Order>> {
  const session = await requireAuth();

  const parsed = createOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const order = await orderService.placeOrder(
      session.user.id,
      parsed.data.addressId,
      parsed.data.notes
    );
    revalidateTag(CACHE_TAGS.userOrders(session.user.id), "max");
    redirect(`/checkout/success?orderId=${order.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
    return fail(error instanceof Error ? error.message : "خطا در ثبت سفارش");
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus
): Promise<ApiResponse<Order>> {
  const session = await requireAdmin();

  const parsed = updateOrderStatusSchema.safeParse({ status: newStatus });
  if (!parsed.success) {
    return fail("وضعیت نامعتبر است");
  }

  try {
    const order = await orderService.updateOrderStatus(orderId, parsed.data.status, session.user.id);
    revalidateTag(CACHE_TAGS.order(orderId), "max");
    revalidateTag(CACHE_TAGS.orders, "max");
    return ok(order);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در بروزرسانی وضعیت");
  }
}
