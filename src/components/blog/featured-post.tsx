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

export function FeaturedPost({ post }: { post: Post }) {
  const mins = readingTime(post.content);
  const image =
    post.coverImage ??
    `https://picsum.photos/seed/featured-${post.id.slice(0, 8)}/1200/630`;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex min-h-[380px] overflow-hidden rounded-3xl bg-muted shadow-xl sm:min-h-[440px]"
      aria-label={`مطلب ویژه: ${post.title}`}
    >
      {/* Background image */}
      <Image
        src={image}
        alt={post.title}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative mt-auto p-6 sm:p-8">
        {/* Category + reading time */}
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-xl bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground backdrop-blur-sm">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-white/70">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {mins} دقیقه مطالعه
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
            ✦ مطلب ویژه
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-xl font-extrabold leading-snug text-white drop-shadow-md sm:text-2xl lg:text-3xl line-clamp-3">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="mb-5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/80">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name ?? "نویسنده"}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-white/40 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white ring-2 ring-white/40 backdrop-blur-sm">
                {(post.author.name ?? "ن")[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {post.author.name ?? "نویسنده"}
              </p>
              {post.publishedAt && (
                <p className="text-xs text-white/60">{formatDate(post.publishedAt)}</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <span className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
            ادامه مطلب
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="rtl:rotate-180">
              <path d="M3 7h8M8 4.5L10.5 7 8 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
