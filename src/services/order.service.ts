import * as orderRepo from "@/repositories/order.repository";
import * as cartRepo from "@/repositories/cart.repository";
import * as addressRepo from "@/repositories/address.repository";
import { canTransition } from "@/config/order-status";
import { siteConfig } from "@/config/site";
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
  notes?: string | null
) {
  const address = await addressRepo.findAddressById(addressId);
  if (!address || address.userId !== userId) throw new Error("آدرس یافت نشد");

  const cartItems = await cartRepo.findCartItems({ userId });
  if (cartItems.length === 0) throw new Error("سبد خرید خالی است");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const shippingCost =
    subtotal >= siteConfig.shipping.freeShippingThreshold
      ? 0
      : siteConfig.shipping.defaultShippingCost;

  const order = await orderRepo.createOrder({
    userId,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
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
      quantity: item.quantity,
      unitPrice: item.book.price,
    })),
  });

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
