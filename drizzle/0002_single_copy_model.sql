-- Migration: single_copy_model
-- Converts the bookstore from quantity-based to single-copy marketplace model.
-- Each book is a unique physical copy: no numeric stock, no quantity in carts/orders.

-- ── 1. books: replace `stock` with `is_sold` ────────────────────────────────
ALTER TABLE "books" ADD COLUMN "is_sold" boolean NOT NULL DEFAULT false;

-- Populate: any book with stock = 0 is considered sold
UPDATE "books" SET "is_sold" = true WHERE "stock" = 0;

ALTER TABLE "books" DROP COLUMN "stock";

-- Index for fast availability queries
CREATE INDEX IF NOT EXISTS "books_is_sold_idx" ON "books" ("is_sold");

-- ── 2. cart_items: remove `quantity`, add unique constraints ─────────────────
ALTER TABLE "cart_items" DROP COLUMN IF EXISTS "quantity";

-- Prevent the same book from appearing twice in a user cart
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_user_book_unique"
  ON "cart_items" ("user_id", "book_id")
  WHERE "user_id" IS NOT NULL;

-- Prevent the same book from appearing twice in a guest (session) cart
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_session_book_unique"
  ON "cart_items" ("session_id", "book_id")
  WHERE "session_id" IS NOT NULL;

-- ── 3. order_items: remove `quantity`, add unique book constraint ─────────────
ALTER TABLE "order_items" DROP COLUMN IF EXISTS "quantity";

-- A physical book can only ever appear in one order
CREATE UNIQUE INDEX IF NOT EXISTS "order_items_book_unique"
  ON "order_items" ("book_id");
