CREATE TYPE "public"."coupon_type" AS ENUM('PERCENT', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('PAYMENT', 'REFUND', 'SHIPPING', 'DISCOUNT');--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "coupon_type" NOT NULL,
	"value" integer NOT NULL,
	"min_order_amount" integer DEFAULT 0 NOT NULL,
	"max_discount" integer,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" RENAME COLUMN "stock" TO "is_sold";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_code" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_is_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_expires_at_idx" ON "coupons" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "transactions_order_idx" ON "transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "books_is_sold_idx" ON "books" USING btree ("is_sold");--> statement-breakpoint
CREATE INDEX "books_title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE INDEX "books_author_idx" ON "books" USING btree ("author");--> statement-breakpoint
CREATE UNIQUE INDEX "order_items_book_unique" ON "order_items" USING btree ("book_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_user_book_unique" ON "cart_items" USING btree ("user_id","book_id") WHERE "cart_items"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_session_book_unique" ON "cart_items" USING btree ("session_id","book_id") WHERE "cart_items"."session_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "quantity";