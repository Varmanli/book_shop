import Image from "next/image";
import Link from "next/link";

interface Author {
  name: string | null;
  image: string | null;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date | null;
  category: string;
  content: string;
  author: Author;
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const CATEGORY_COLORS: Record<string, string> = {
  "معرفی کتاب": "bg-violet-100 text-violet-700",
  "اخبار": "bg-sky-100 text-sky-700",
  "مصاحبه": "bg-amber-100 text-amber-700",
  "نقد و بررسی": "bg-emerald-100 text-emerald-700",
  "راهنما": "bg-rose-100 text-rose-700",
  "عمومی": "bg-muted text-muted-foreground",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "bg-primary/10 text-primary";
}

/* ── Standard card ───────────────────────────────────────── */
export function BlogCard({ post }: { post: Post }) {
  const mins = readingTime(post.content);
  const image =
    post.coverImage ??
    `https://picsum.photos/seed/post-${post.id.slice(0, 8)}/600/400`;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        <Image
          src={image}
          alt={post.title}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category badge */}
        <div className="absolute start-3 top-3">
          <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${categoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name ?? "نویسنده"}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {(post.author.name ?? "ن")[0]}
              </div>
            )}
            <span className="text-xs font-medium text-foreground line-clamp-1">
              {post.author.name ?? "نویسنده"}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {mins} دقیقه
            </span>
            {post.publishedAt && (
              <>
                <span className="opacity-40">·</span>
                <span>{formatDate(post.publishedAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Read more — slides in on hover */}
        <div className="-mb-1 translate-y-1 overflow-hidden opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            ادامه مطلب
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="rtl:rotate-180">
              <path d="M2.5 6h7M6.5 3.5L9 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
