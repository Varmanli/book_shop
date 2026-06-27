import Image from "next/image";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  author: { name: string | null } | null;
}

interface Props {
  posts: Post[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function LatestPosts({ posts }: Props) {
  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              وبلاگ
            </span>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              آخرین مطالب
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              راهنماها و توصیه‌های کتابخوانی
            </p>
          </div>
          <Link
            href="/blog"
            className="group hidden items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-primary sm:flex"
          >
            همه مطالب
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-1" aria-hidden>
              <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl lg:col-span-2"
            >
              <div className="relative h-56 overflow-hidden bg-muted sm:h-72">
                {featured.coverImage ? (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted text-5xl">
                    📰
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    مقاله
                  </span>
                  {featured.publishedAt && (
                    <time className="text-xs text-muted-foreground">
                      {formatDate(featured.publishedAt)}
                    </time>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-xl">
                  {featured.title}
                </h3>
                {featured.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {featured.excerpt}
                  </p>
                )}
                <p className="mt-4 text-xs font-semibold text-primary">
                  ادامه مطلب ←
                </p>
              </div>
            </Link>
          )}

          {/* Remaining posts */}
          <div className="flex flex-col gap-4">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                {post.coverImage ? (
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-muted text-3xl">
                    📰
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {post.publishedAt && (
                      <time className="text-[11px] text-muted-foreground">
                        {formatDateShort(post.publishedAt)}
                      </time>
                    )}
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            <Link
              href="/blog"
              className="mt-auto flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:hidden"
            >
              مشاهده همه مطالب
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
