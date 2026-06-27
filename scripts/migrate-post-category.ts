import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'عمومی' NOT NULL`;
    console.log("✓ category column added to posts");
  } catch (e: any) {
    console.log("Info:", e.message);
  } finally {
    await sql.end();
  }
}

run();
