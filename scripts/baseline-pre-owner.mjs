import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const CONFIRMATION = "pre-owner-v1";
const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";
const migrationsFolder = path.resolve("drizzle");
const journal = JSON.parse(
  fs.readFileSync(path.join(migrationsFolder, "meta", "_journal.json"), "utf8")
);
const ownerMigrationIndex = journal.entries.findIndex(
  (entry) => entry.tag === "0005_add_owner_role"
);

if (process.env.MIGRATION_BASELINE_CONFIRM !== CONFIRMATION) {
  throw new Error(
    `Refusing to baseline. Set MIGRATION_BASELINE_CONFIRM=${CONFIRMATION} to run this one-time operation.`
  );
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the migration baseline.");
}
if (ownerMigrationIndex <= 0) {
  throw new Error("The Owner migration boundary was not found in the journal.");
}

const baselineEntries = journal.entries.slice(0, ownerMigrationIndex);
const baselineFrontier = baselineEntries.at(-1);
const expectedTables = [
  "accounts", "sessions", "users", "verification_tokens", "categories", "genres",
  "book_genres", "books", "addresses", "order_items", "orders", "cart_items",
  "wishlist_items", "posts", "settings", "contact_messages", "newsletter_subscribers",
  "team_members", "home_slides", "reviews", "coupons", "transactions",
];
const requiredColumns = {
  users: ["id", "email", "password", "role"],
  books: ["id", "category_id", "quality_grade", "is_sold", "price", "is_published"],
  genres: ["id", "slug", "image"],
  order_items: ["id", "order_id", "book_id", "book_snapshot", "unit_price"],
  orders: ["id", "user_id", "status", "discount_amount", "coupon_code"],
  cart_items: ["id", "user_id", "session_id", "book_id"],
  reviews: ["id", "book_id", "user_id", "status"],
  coupons: ["id", "code", "type", "value"],
  transactions: ["id", "order_id", "type", "amount"],
};
const expectedEnums = {
  role: ["USER", "ADMIN"],
  quality_grade: ["Like New", "Very Good", "Good", "Acceptable"],
  order_status: ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
  post_status: ["DRAFT", "PUBLISHED"],
  contact_status: ["UNREAD", "READ", "REPLIED", "ARCHIVED"],
  review_status: ["PENDING", "APPROVED", "REJECTED"],
  coupon_type: ["PERCENT", "FIXED"],
  transaction_type: ["PAYMENT", "REFUND", "SHIPPING", "DISCOUNT"],
};

function migrationSource(entry) {
  return fs.readFileSync(path.join(migrationsFolder, `${entry.tag}.sql`), "utf8");
}

function hash(source) {
  return crypto.createHash("sha256").update(source).digest("hex");
}

function namedObjects(pattern) {
  return baselineEntries.flatMap((entry) =>
    [...migrationSource(entry).matchAll(pattern)].map((match) => match[1])
  );
}

const expectedIndexes = namedObjects(/CREATE (?:UNIQUE )?INDEX "([^"]+)"/g);
const expectedConstraints = namedObjects(/CONSTRAINT "([^"]+)"/g);

function details(error) {
  if (!error || typeof error !== "object") return String(error);
  return ["code", "message", "detail", "hint", "where"]
    .filter((key) => key in error && typeof error[key] === "string" && error[key])
    .map((key) => `${key}: ${error[key]}`)
    .join("\n") || "Unknown baseline error";
}

function assertContains(actual, expected, label) {
  const missing = expected.filter((item) => !actual.has(item));
  if (missing.length) throw new Error(`Schema check failed: missing ${label}: ${missing.join(", ")}`);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  await sql.begin(async (transaction) => {
    await transaction.unsafe("SELECT pg_advisory_xact_lock(821064239)");
    await transaction.unsafe(`CREATE SCHEMA IF NOT EXISTS "${MIGRATIONS_SCHEMA}"`);
    await transaction.unsafe(`
      CREATE TABLE IF NOT EXISTS "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    const history = await transaction.unsafe(
      `SELECT hash, created_at FROM "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" ORDER BY created_at`
    );
    const latestAppliedAt = Number(history.at(-1)?.created_at ?? 0);
    if (latestAppliedAt > baselineFrontier.when) {
      console.log("Migration history is already beyond the pre-Owner baseline; nothing to do.");
      return;
    }
    if (history.length) {
      throw new Error("Migration history is partially populated; refusing to create a mixed baseline.");
    }

    const tables = new Set(
      (await transaction.unsafe(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      )).map((row) => row.table_name)
    );
    assertContains(tables, expectedTables, "tables");

    const columns = await transaction.unsafe(
      "SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'"
    );
    for (const [table, expected] of Object.entries(requiredColumns)) {
      const actual = new Set(
        columns.filter((column) => column.table_name === table).map((column) => column.column_name)
      );
      assertContains(actual, expected, `${table} columns`);
    }
    const obsoleteColumns = new Set(columns.map((column) => `${column.table_name}.${column.column_name}`));
    if (obsoleteColumns.has("books.stock") || obsoleteColumns.has("order_items.quantity") || obsoleteColumns.has("cart_items.quantity")) {
      throw new Error("Schema check failed: the database has not reached the expected pre-Owner column state.");
    }

    const enumRows = await transaction.unsafe(`
      SELECT type.typname, enum.enumlabel
      FROM pg_type AS type
      JOIN pg_enum AS enum ON enum.enumtypid = type.oid
      JOIN pg_namespace AS namespace ON namespace.oid = type.typnamespace
      WHERE namespace.nspname = 'public'
      ORDER BY type.typname, enum.enumsortorder
    `);
    for (const [enumName, labels] of Object.entries(expectedEnums)) {
      const actual = enumRows.filter((row) => row.typname === enumName).map((row) => row.enumlabel);
      if (actual.join("|") !== labels.join("|")) {
        throw new Error(`Schema check failed: enum ${enumName} does not match the expected pre-Owner values.`);
      }
    }

    const indexes = new Set(
      (await transaction.unsafe(
        "SELECT indexname FROM pg_indexes WHERE schemaname = 'public'"
      )).map((row) => row.indexname)
    );
    assertContains(indexes, expectedIndexes, "indexes");

    const constraints = new Set(
      (await transaction.unsafe(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
      `)).map((row) => row.constraint_name)
    );
    assertContains(constraints, expectedConstraints, "constraints");

    if (tables.has("owner_control") || tables.has("role_audit_logs") || indexes.has("users_single_owner_idx")) {
      throw new Error("Schema check failed: Owner schema objects already exist; this is not a pre-Owner baseline.");
    }

    for (const entry of baselineEntries) {
      const source = migrationSource(entry);
      await transaction.unsafe(
        `INSERT INTO "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}" (hash, created_at) VALUES ($1, $2)`,
        [hash(source), entry.when]
      );
    }
    console.log(`Baselined migrations through ${baselineFrontier.tag}.`);
  });
} catch (error) {
  console.error("Migration baseline failed:");
  console.error(details(error));
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
