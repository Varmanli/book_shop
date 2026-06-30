import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "PAYMENT",
  "REFUND",
  "SHIPPING",
  "DISCOUNT",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: transactionTypeEnum("type").notNull(),
    /**
     * Positive = revenue inflow (PAYMENT, SHIPPING).
     * Negative = outflow / reduction (DISCOUNT, REFUND).
     */
    amount: integer("amount").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transactions_order_idx").on(table.orderId),
    index("transactions_type_idx").on(table.type),
    index("transactions_created_at_idx").on(table.createdAt),
  ]
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, { fields: [transactions.orderId], references: [orders.id] }),
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
