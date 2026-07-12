CREATE TABLE IF NOT EXISTS "owner_control" (
  "id" integer PRIMARY KEY CHECK ("id" = 1),
  "owner_user_id" text UNIQUE REFERENCES "public"."users"("id") ON DELETE RESTRICT,
  "assigned_at" timestamp
);
--> statement-breakpoint
INSERT INTO "owner_control" ("id", "owner_user_id", "assigned_at")
VALUES (1, NULL, NULL)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- The guarded update of this single row in assignInitialOwner is the database
-- concurrency guard for the one-owner invariant. Do not add a partial index
-- using the new OWNER enum value here: Drizzle runs pending migrations in one
-- transaction, while PostgreSQL makes a newly added enum value usable only
-- after that transaction commits.
CREATE TABLE IF NOT EXISTS "role_audit_logs" (
  "id" text PRIMARY KEY,
  "actor_user_id" text REFERENCES "public"."users"("id") ON DELETE RESTRICT,
  "target_user_id" text NOT NULL REFERENCES "public"."users"("id") ON DELETE RESTRICT,
  "action" text NOT NULL,
  "previous_role" "public"."role",
  "new_role" "public"."role" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_audit_logs_target_idx"
ON "role_audit_logs" USING btree ("target_user_id");
