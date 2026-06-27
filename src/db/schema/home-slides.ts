import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const homeSlides = pgTable("home_slides", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  ctaText: text("cta_text"),
  ctaLink: text("cta_link"),
  imageUrl: text("image_url").notNull(),
  order: integer("order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HomeSlide = typeof homeSlides.$inferSelect;
export type NewHomeSlide = typeof homeSlides.$inferInsert;
