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
CREATE UNIQUE INDEX IF NOT EXISTS "users_single_owner_idx"
ON "public"."users" (("role"))
WHERE "role" = 'OWNER';
--> statement-breakpoint
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
