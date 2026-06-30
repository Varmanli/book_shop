import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { books } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { sanitizePostHtml } from "@/lib/sanitize-html";

// ─── Book embed card ──────────────────────────────────────────────────────────

type EmbeddedBook = {
  id: string;
  title: string;
  author: string;
  slug: string;
  images: string[];
  price: number;
};

function BookEmbedCard({ book }: { book: EmbeddedBook }) {
  const coverImage = book.images?.[0] ?? null;
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex gap-4 p-4">
        {/* Cover */}
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={book.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              📖
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              معرفی کتاب
            </span>
            <h4 className="line-clamp-2 text-sm font-bold text-foreground leading-snug">
              {book.title}
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">{book.author}</p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            {book.price > 0 && (
              <span className="text-sm font-semibold text-primary">
                {book.price.toLocaleString("fa-IR")} تومان
              </span>
            )}
            <Link
              href={`/books/${book.slug}`}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              مشاهده کتاب
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookEmbedFallback({ bookId }: { bookId: string }) {
  void bookId;
  return (
    <div className="my-6 flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
      <span className="text-2xl">📚</span>
      <p className="text-sm text-muted-foreground">این کتاب دیگر در دسترس نیست.</p>
    </div>
  );
}

// ─── HTML → segments parser ───────────────────────────────────────────────────

type Segment =
  | { type: "html"; content: string }
  | { type: "bookEmbed"; bookId: string };

function parseSegments(html: string): Segment[] {
  const segments: Segment[] = [];
  // Match <div data-book-embed="ID" ...></div> or <div ... data-book-embed="ID" ...></div>
  const embedRe = /<div[^>]*\bdata-book-embed="([^"]+)"[^>]*>\s*<\/div>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = embedRe.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "html", content: html.slice(lastIndex, match.index) });
    }
    segments.push({ type: "bookEmbed", bookId: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    segments.push({ type: "html", content: html.slice(lastIndex) });
  }

  return segments;
}

// ─── PostContent — async server component ─────────────────────────────────────

export async function PostContent({ content }: { content: string }) {
  if (!content) return null;

  const segments = parseSegments(content);

  // Collect all book IDs to fetch in one query
  const bookIds = segments
    .filter((s): s is Extract<Segment, { type: "bookEmbed" }> => s.type === "bookEmbed")
    .map((s) => s.bookId);

  let bookMap = new Map<string, EmbeddedBook>();
  if (bookIds.length > 0) {
    const rows = await db
      .select({
        id: books.id,
        title: books.title,
        author: books.author,
        slug: books.slug,
        images: books.images,
        price: books.price,
      })
      .from(books)
      .where(inArray(books.id, bookIds));
    bookMap = new Map(rows.map((b) => [b.id, b]));
  }

  return (
    <div className="post-body">
      {segments.map((seg, i) => {
        if (seg.type === "bookEmbed") {
          const book = bookMap.get(seg.bookId);
          return book ? (
            <BookEmbedCard key={i} book={book} />
          ) : (
            <BookEmbedFallback key={i} bookId={seg.bookId} />
          );
        }
        return (
          <div
            key={i}
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(seg.content) }}
          />
        );
      })}
    </div>
  );
}
