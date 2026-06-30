import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookGenres } from "./books";

export const genres = pgTable(
  "genres",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("genres_slug_idx").on(table.slug)]
);

export const genresRelations = relations(genres, ({ many }) => ({
  bookGenres: many(bookGenres),
}));

export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
