import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const couponTypeEnum = pgEnum("coupon_type", ["PERCENT", "FIXED"]);

export const coupons = pgTable(
  "coupons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    type: couponTypeEnum("type").notNull(),
    /**
     * PERCENT: integer 1–100 (percentage off subtotal).
     * FIXED:   integer amount in Rials.
     */
    value: integer("value").notNull(),
    /** Minimum cart subtotal required to use this coupon. */
    minOrderAmount: integer("min_order_amount").notNull().default(0),
    /** For PERCENT coupons: maximum discount ceiling. null = no cap. */
    maxDiscount: integer("max_discount"),
    /** null = unlimited uses. */
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    expiresAt: timestamp("expires_at"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("coupons_code_idx").on(table.code),
    index("coupons_is_active_idx").on(table.isActive),
    index("coupons_expires_at_idx").on(table.expiresAt),
  ]
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
