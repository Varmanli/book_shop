import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import * as postService from "@/services/post.service";
import { PostContent } from "@/components/blog/post-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await postService.getPostBySlug(slug);
  if (!post) return { title: "پست یافت نشد" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage }] }
      : undefined,
  };
}

async function BlogPostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await postService.getPostBySlug(slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const publishedDate = post.publishedAt ?? post.createdAt;
  const formattedDate = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(publishedDate));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        بازگشت به وبلاگ
      </Link>

      {/* Category badge */}
      {post.category && (
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {post.category}
        </span>
      )}

      {/* Title */}
      <h1 className="mb-3 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
        {post.title}
      </h1>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mb-5 text-base leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className="mb-8 flex items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={publishedDate.toString()}>{formattedDate}</time>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Article body */}
      <article className="post-article" dir="rtl">
        <Suspense
          fallback={
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 rounded bg-muted" style={{ width: `${75 + (i % 3) * 10}%` }} />
              ))}
            </div>
          }
        >
          <PostContent content={post.content} />
        </Suspense>
      </article>

      {/* Footer */}
      <div className="mt-12 border-t border-border pt-6 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl bg-muted px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
        >
          مشاهده همه مقالات
        </Link>
      </div>
    </main>
  );
}

export default function BlogPostPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="aspect-[21/9] rounded-2xl bg-muted" />
          </div>
        </div>
      }
    >
      <BlogPostContent params={params} />
    </Suspense>
  );
}
