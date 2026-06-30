import * as orderRepo from "@/repositories/order.repository";
import * as cartRepo from "@/repositories/cart.repository";
import * as addressRepo from "@/repositories/address.repository";
import * as bookRepo from "@/repositories/book.repository";
import * as txRepo from "@/repositories/transaction.repository";
import { getShippingSettings } from "@/repositories/settings.repository";
import { validateCoupon, recordCouponUsage } from "@/services/coupon.service";
import { canTransition } from "@/config/order-status";
import type { OrderFilters, OrderStatus } from "@/types/domain";
import type { PaginationParams } from "@/types/api";

export async function getOrderById(id: string, requestingUserId: string, isAdmin: boolean) {
  const order = await orderRepo.findOrderById(id);
  if (!order) throw new Error("سفارش یافت نشد");
  if (!isAdmin && order.userId !== requestingUserId) throw new Error("دسترسی غیر مجاز");
  return order;
}

export async function getUserOrders(userId: string, pagination: PaginationParams = {}) {
  return orderRepo.findOrdersByUserId(userId, pagination);
}

export async function getAllOrders(filters: OrderFilters = {}, pagination: PaginationParams = {}) {
  return orderRepo.findAllOrders(filters, pagination);
}

export async function placeOrder(
  userId: string,
  addressId: string,
  notes?: string | null,
  couponCode?: string | null
) {
  const address = await addressRepo.findAddressById(addressId);
  if (!address || address.userId !== userId) throw new Error("آدرس یافت نشد");

  const cartItems = await cartRepo.findCartItems({ userId });
  if (cartItems.length === 0) throw new Error("سبد خرید خالی است");

  // Verify every book is still available (not sold since being added to cart)
  const soldBooks = cartItems.filter((item) => item.book.isSold);
  if (soldBooks.length > 0) {
    const titles = soldBooks.map((i) => `«${i.book.title}»`).join("، ");
    throw new Error(`کتاب‌های زیر دیگر موجود نیستند: ${titles}`);
  }

  const bookIds = cartItems.map((item) => item.book.id);

  // Atomically mark books as sold — if another request beat us, some IDs won't
  // be returned and we must abort before creating the order.
  const soldIds = await bookRepo.markBooksAsSold(bookIds);
  if (soldIds.length !== bookIds.length) {
    // Find which ones slipped through and build a useful error
    const failedIds = new Set(bookIds.filter((id) => !soldIds.includes(id)));
    const failedTitles = cartItems
      .filter((i) => failedIds.has(i.book.id))
      .map((i) => `«${i.book.title}»`)
      .join("، ");
    throw new Error(
      `متأسفیم، این کتاب‌ها همزمان توسط شخص دیگری خریداری شد: ${failedTitles}`
    );
  }

  // Single-copy model: quantity is always 1, total = sum of unit prices
  const subtotal = cartItems.reduce((sum, item) => sum + item.book.price, 0);

  // Shipping cost is fully DB-driven — no hardcoded thresholds.
  const { shippingCost: baseShipping, freeShippingThreshold } =
    await getShippingSettings();
  const shippingCost =
    freeShippingThreshold !== null && subtotal >= freeShippingThreshold
      ? 0
      : baseShipping;

  // Server-side coupon validation (re-validated here even if client pre-checked).
  let discountAmount = 0;
  let validatedCouponCode: string | null = null;
  if (couponCode) {
    const { discountAmount: d } = await validateCoupon(couponCode, subtotal);
    discountAmount = d;
    validatedCouponCode = couponCode.toUpperCase();
  }

  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  const order = await orderRepo.createOrder({
    userId,
    subtotal,
    shippingCost,
    discountAmount,
    couponCode: validatedCouponCode,
    total,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      street: address.street,
      postalCode: address.postalCode,
    },
    notes,
    items: cartItems.map((item) => ({
      bookId: item.book.id,
      bookSnapshot: {
        title: item.book.title,
        author: item.book.author,
        coverImage: item.book.images[0] ?? "",
        slug: item.book.slug,
      },
      unitPrice: item.book.price,
    })),
  });

  // Create financial ledger entries
  type TxType = "PAYMENT" | "REFUND" | "SHIPPING" | "DISCOUNT";
  const txRows: { orderId: string; type: TxType; amount: number; description: string }[] = [
    { orderId: order.id, type: "PAYMENT", amount: subtotal, description: "پرداخت کالاها" },
  ];
  if (shippingCost > 0) {
    txRows.push({ orderId: order.id, type: "SHIPPING", amount: shippingCost, description: "هزینه ارسال" });
  }
  if (discountAmount > 0) {
    txRows.push({ orderId: order.id, type: "DISCOUNT", amount: -discountAmount, description: `تخفیف کد ${validatedCouponCode}` });
  }
  await txRepo.createTransactions(txRows);

  // Increment coupon usage atomically after order is persisted
  if (validatedCouponCode) {
    await recordCouponUsage(validatedCouponCode);
  }

  await cartRepo.clearCart({ userId });
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminId: string
) {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw new Error("سفارش یافت نشد");

  if (!canTransition(order.status as OrderStatus, newStatus)) {
    throw new Error(
      `تغییر وضعیت از ${order.status} به ${newStatus} مجاز نیست`
    );
  }

  return orderRepo.updateOrderStatus(orderId, newStatus);
}

export async function getDashboardOrderStats() {
  return orderRepo.getOrderStats();
}

/**
 * Mock payment confirmation — bypasses the canTransition guard intentionally.
 * Replace the body with a real payment-gateway callback handler when integrating
 * Zarinpal / Zibal. The function signature and return shape are stable.
 */
export async function simulateMockPayment(
  orderId: string
): Promise<{ orderId: string; orderNumber: string }> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw new Error("سفارش یافت نشد");
  if (order.status !== "PENDING") throw new Error("سفارش قابل پرداخت نیست");

  // Directly update to PAID — real gateway would verify the transaction here.
  const paid = await orderRepo.updateOrderStatus(orderId, "PAID");
  return { orderId: paid.id, orderNumber: paid.orderNumber };
}
