import { NextRequest, NextResponse } from "next/server";
import { isAdminRole } from "@/lib/roles";

export async function GET(req: NextRequest) {
  const [{ auth }, { db }, { books }, { ilike, or, eq, and }] = await Promise.all([
    import("@/lib/auth"),
    import("@/db"),
    import("@/db/schema"),
    import("drizzle-orm"),
  ]);
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ success: false, error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const conditions = [eq(books.isPublished, true)];
  if (q) {
    conditions.push(
      or(
        ilike(books.title, `%${q}%`),
        ilike(books.author, `%${q}%`)
      )!
    );
  }

  const results = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      slug: books.slug,
      images: books.images,
      price: books.price,
    })
    .from(books)
    .where(and(...conditions))
    .limit(10)
    .orderBy(books.title);

  return NextResponse.json({
    success: true,
    books: results.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      slug: b.slug,
      coverImage: b.images?.[0] ?? null,
      price: b.price,
    })),
  });
}
