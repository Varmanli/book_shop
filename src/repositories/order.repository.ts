import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { normalizePagination, buildPaginationMeta } from "@/lib/pagination";
import { generateOrderNumber } from "@/lib/order-number";
import type { PaginationParams } from "@/types/api";
import type { OrderFilters } from "@/types/domain";
import type {
  ShippingAddressSnapshot,
  BookSnapshot,
} from "@/db/schema/orders";

type CreateOrderData = {
  userId: string;
  subtotal: number;
  shippingCost: number;
  /** Discount from coupon. total = subtotal + shippingCost − discountAmount */
  discountAmount: number;
  couponCode?: string | null;
  /** total = subtotal + shippingCost − discountAmount (pre-calculated by caller) */
  total: number;
  shippingAddress: ShippingAddressSnapshot;
  notes?: string | null;
  items: {
    bookId: string;
    bookSnapshot: BookSnapshot;
    unitPrice: number;
    // No quantity — single-copy model, every order item = 1 physical book
  }[];
};

export async function findOrderById(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true, user: true },
  });
}

export async function findOrdersByUserId(userId: string, pagination: PaginationParams = {}) {
  const { page, pageSize, offset } = normalizePagination(pagination);

  const [rows, [{ total }]] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: desc(orders.createdAt),
      limit: pageSize,
      offset,
      with: { items: true },
    }),
    db.select({ total: count() }).from(orders).where(eq(orders.userId, userId)),
  ]);

  return { items: rows, meta: buildPaginationMeta(Number(total), page, pageSize) };
}

export async function findAllOrders(filters: OrderFilters = {}, pagination: PaginationParams = {}) {
  const { page, pageSize, offset } = normalizePagination(pagination);

  const conditions = [];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  if (filters.userId) conditions.push(eq(orders.userId, filters.userId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.orders.findMany({
      where,
      orderBy: desc(orders.createdAt),
      limit: pageSize,
      offset,
      with: { items: true, user: true },
    }),
    db.select({ total: count() }).from(orders).where(where),
  ]);

  return { items: rows, meta: buildPaginationMeta(Number(total), page, pageSize) };
}

export async function createOrder(data: CreateOrderData) {
  const orderNumber = generateOrderNumber();

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: data.userId,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      discountAmount: data.discountAmount,
      couponCode: data.couponCode ?? null,
      total: data.total,
      shippingAddress: data.shippingAddress,
      notes: data.notes,
    })
    .returning();

  await db.insert(orderItems).values(
    data.items.map((item) => ({
      orderId: order.id,
      bookId: item.bookId,
      bookSnapshot: item.bookSnapshot,
      unitPrice: item.unitPrice,
    }))
  );

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: typeof orders.$inferSelect["status"]
) {
  const timestamps: Partial<typeof orders.$inferInsert> = { status, updatedAt: new Date() };
  if (status === "PAID") timestamps.paidAt = new Date();
  if (status === "SHIPPED") timestamps.shippedAt = new Date();
  if (status === "DELIVERED") timestamps.deliveredAt = new Date();
  if (status === "CANCELLED") timestamps.cancelledAt = new Date();

  const [updated] = await db
    .update(orders)
    .set(timestamps)
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

export async function getOrderStats() {
  const [{ total }] = await db.select({ total: count() }).from(orders);
  const [{ pending }] = await db
    .select({ pending: count() })
    .from(orders)
    .where(eq(orders.status, "PENDING"));
  return { total: Number(total), pending: Number(pending) };
}

export async function getOrderStatusCounts() {
  const [pending, paid, processing, shipped, delivered, cancelled] = await Promise.all([
    db.select({ total: count() }).from(orders).where(eq(orders.status, "PENDING")),
    db.select({ total: count() }).from(orders).where(eq(orders.status, "PAID")),
    db.select({ total: count() }).from(orders).where(eq(orders.status, "PROCESSING")),
    db.select({ total: count() }).from(orders).where(eq(orders.status, "SHIPPED")),
    db.select({ total: count() }).from(orders).where(eq(orders.status, "DELIVERED")),
    db.select({ total: count() }).from(orders).where(eq(orders.status, "CANCELLED")),
  ]);

  return {
    PENDING: Number(pending[0]?.total ?? 0),
    PAID: Number(paid[0]?.total ?? 0),
    PROCESSING: Number(processing[0]?.total ?? 0),
    SHIPPED: Number(shipped[0]?.total ?? 0),
    DELIVERED: Number(delivered[0]?.total ?? 0),
    CANCELLED: Number(cancelled[0]?.total ?? 0),
  };
}
