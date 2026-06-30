import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    subtotal: integer("subtotal").notNull(),
    shippingCost: integer("shipping_cost").default(0).notNull(),
    /** Discount amount from coupon. Stored for immutable financial record. */
    discountAmount: integer("discount_amount").notNull().default(0),
    /** The coupon code used, if any. Stored as snapshot (coupon may later change). */
    couponCode: text("coupon_code"),
    /** total = subtotal + shippingCost − discountAmount */
    total: integer("total").notNull(),
    shippingAddress: jsonb("shipping_address").notNull(),
    notes: text("notes"),
    paidAt: timestamp("paid_at"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_order_number_idx").on(table.orderNumber),
    index("orders_created_at_idx").on(table.createdAt),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "restrict" }),
    bookSnapshot: jsonb("book_snapshot").notNull(),
    // No quantity — each order item is exactly one unique physical book
    unitPrice: integer("unit_price").notNull(),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    // A book can only appear in one order (it's a physical unique copy)
    uniqueIndex("order_items_book_unique").on(table.bookId),
  ]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  book: one(books, { fields: [orderItems.bookId], references: [books.id] }),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type ShippingAddressSnapshot = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
};

export type BookSnapshot = {
  title: string;
  author: string;
  coverImage: string;
  slug: string;
};
