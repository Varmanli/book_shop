import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);

  const updates: { slug: string; category: string }[] = [
    { slug: "guide-buy-second-hand-books", category: "راهنما" },
    { slug: "10-classic-books-to-read", category: "معرفی کتاب" },
    { slug: "importance-of-reading-digital-world", category: "عمومی" },
    { slug: "best-contemporary-iranian-novels", category: "معرفی کتاب" },
    { slug: "interview-old-bookshop-owner", category: "مصاحبه" },
    { slug: "review-lord-of-the-rings", category: "نقد و بررسی" },
    { slug: "tehran-book-fair-1404", category: "اخبار" },
  ];

  for (const u of updates) {
    await sql`UPDATE posts SET category = ${u.category} WHERE slug = ${u.slug}`;
  }
  console.log("✓ Post categories updated");
  await sql.end();
}

run();
