import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { books } from "./books";
import { users } from "./users";

export const reviewStatusEnum = pgEnum("review_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    status: reviewStatusEnum("status").default("PENDING").notNull(),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("reviews_book_id_idx").on(table.bookId),
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_status_idx").on(table.status),
    unique("reviews_user_book_unique").on(table.userId, table.bookId),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  book: one(books, { fields: [reviews.bookId], references: [books.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
