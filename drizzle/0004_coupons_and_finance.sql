-- Migration: coupons_and_finance
-- Adds coupon/discount support to orders and a financial transaction ledger.

-- ── 1. orders: discount tracking columns ────────────────────────────────────
ALTER TABLE "orders"
  ADD COLUMN "discount_amount" integer NOT NULL DEFAULT 0,
  ADD COLUMN "coupon_code"     text;

-- ── 2. coupon type enum ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "coupon_type" AS ENUM ('PERCENT', 'FIXED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. coupons table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "coupons" (
  "id"               text          PRIMARY KEY,
  "code"             text          NOT NULL UNIQUE,
  "type"             "coupon_type" NOT NULL,
  "value"            integer       NOT NULL,
  "min_order_amount" integer       NOT NULL DEFAULT 0,
  "max_discount"     integer,
  "usage_limit"      integer,
  "used_count"       integer       NOT NULL DEFAULT 0,
  "is_active"        boolean       NOT NULL DEFAULT true,
  "expires_at"       timestamp,
  "description"      text,
  "created_at"       timestamp     NOT NULL DEFAULT now(),
  "updated_at"       timestamp     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_idx"       ON "coupons" ("code");
CREATE        INDEX IF NOT EXISTS "coupons_is_active_idx"  ON "coupons" ("is_active");
CREATE        INDEX IF NOT EXISTS "coupons_expires_at_idx" ON "coupons" ("expires_at");

-- ── 4. transaction type enum ─────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "transaction_type" AS ENUM ('PAYMENT', 'REFUND', 'SHIPPING', 'DISCOUNT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 5. transactions table (financial ledger) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS "transactions" (
  "id"          text                NOT NULL PRIMARY KEY,
  "order_id"    text                NOT NULL
                  REFERENCES "orders"("id") ON DELETE CASCADE,
  "type"        "transaction_type"  NOT NULL,
  "amount"      integer             NOT NULL,
  "description" text,
  "created_at"  timestamp           NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "transactions_order_idx"      ON "transactions" ("order_id");
CREATE INDEX IF NOT EXISTS "transactions_type_idx"       ON "transactions" ("type");
CREATE INDEX IF NOT EXISTS "transactions_created_at_idx" ON "transactions" ("created_at");
