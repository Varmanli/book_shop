import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories";
import { genres } from "./genres";
import { orderItems } from "./orders";
import { cartItems } from "./cart";
import { wishlistItems } from "./wishlist";
import { reviews } from "./reviews";

export const qualityGradeEnum = pgEnum("quality_grade", [
  "Like New",
  "Very Good",
  "Good",
  "Acceptable",
]);

export const books = pgTable(
  "books",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    author: text("author").notNull(),
    translator: text("translator"),
    publisher: text("publisher").notNull(),
    isbn: text("isbn"),
    description: text("description").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    qualityGrade: qualityGradeEnum("quality_grade").notNull(),
    // Single-copy model: books are either available or sold, no numeric quantity
    isSold: boolean("is_sold").default(false).notNull(),
    price: integer("price").notNull(),
    images: text("images").array().default([]).notNull(),
    publishedYear: integer("published_year"),
    pageCount: integer("page_count"),
    language: text("language").default("Persian").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isPublished: boolean("is_published").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("books_slug_idx").on(table.slug),
    index("books_category_idx").on(table.categoryId),
    index("books_is_featured_idx").on(table.isFeatured),
    index("books_is_published_idx").on(table.isPublished),
    index("books_is_sold_idx").on(table.isSold),
    index("books_created_at_idx").on(table.createdAt),
    index("books_title_idx").on(table.title),
    index("books_author_idx").on(table.author),
  ]
);

export const bookGenres = pgTable(
  "book_genres",
  {
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    genreId: text("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.bookId, table.genreId] })]
);

export const booksRelations = relations(books, ({ one, many }) => ({
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  bookGenres: many(bookGenres),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  reviews: many(reviews),
}));

export const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, { fields: [bookGenres.bookId], references: [books.id] }),
  genre: one(genres, { fields: [bookGenres.genreId], references: [genres.id] }),
}));

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type BookGenre = typeof bookGenres.$inferSelect;
