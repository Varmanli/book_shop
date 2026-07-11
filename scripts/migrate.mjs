import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const migrationsFolder = path.resolve("drizzle");
const journal = JSON.parse(
  fs.readFileSync(path.join(migrationsFolder, "meta", "_journal.json"), "utf8")
);
const sql = postgres(databaseUrl, { max: 1 });

function migrationErrorDetails(error) {
  if (!error || typeof error !== "object") return String(error);

  const details = [];
  for (const key of ["code", "message", "detail", "hint", "where"]) {
    if (key in error && typeof error[key] === "string" && error[key]) {
      details.push(`${key}: ${error[key]}`);
    }
  }
  return details.join("\n") || "Unknown migration error";
}

try {
  await sql.unsafe('CREATE SCHEMA IF NOT EXISTS "drizzle"');
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const [lastAppliedMigration] = await sql.unsafe(
    'SELECT hash, created_at FROM "drizzle"."__drizzle_migrations" ORDER BY created_at DESC LIMIT 1'
  );
  const lastAppliedAt = Number(lastAppliedMigration?.created_at ?? 0);
  console.log(
    lastAppliedMigration
      ? `Migration history ends at ${lastAppliedMigration.created_at}.`
      : "No applied migrations found."
  );

  let previousMigrationAt = 0;

  for (const entry of journal.entries) {
    if (entry.when <= previousMigrationAt) {
      throw new Error("Migration journal entries must be ordered by increasing timestamp.");
    }
    previousMigrationAt = entry.when;
    if (entry.when <= lastAppliedAt) continue;

    const migrationPath = path.join(migrationsFolder, `${entry.tag}.sql`);
    const contents = fs.readFileSync(migrationPath, "utf8");
    const hash = crypto.createHash("sha256").update(contents).digest("hex");

    const statements = contents
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    console.log(`Applying migration ${entry.tag}...`);
    await sql.begin(async (transaction) => {
      for (const statement of statements) {
        await transaction.unsafe(statement);
      }
      await transaction.unsafe(
        'INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)',
        [hash, entry.when]
      );
    });
    console.log(`Applied migration ${entry.tag}.`);
  }
} catch (error) {
  console.error("Migration failed:");
  console.error(migrationErrorDetails(error));
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
