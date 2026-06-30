import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    sessionId: text("session_id"),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    // No quantity — each book is a unique physical copy, qty is always 1
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("cart_items_user_idx").on(table.userId),
    index("cart_items_session_idx").on(table.sessionId),
    // Partial unique indexes prevent the same book from appearing twice in a cart
    uniqueIndex("cart_items_user_book_unique")
      .on(table.userId, table.bookId)
      .where(sql`${table.userId} IS NOT NULL`),
    uniqueIndex("cart_items_session_book_unique")
      .on(table.sessionId, table.bookId)
      .where(sql`${table.sessionId} IS NOT NULL`),
  ]
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  book: one(books, { fields: [cartItems.bookId], references: [books.id] }),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
