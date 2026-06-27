import { Suspense } from "react";
import type { Metadata } from "next";
import { findPublishedPosts, findPostCategories } from "@/repositories/post.repository";
import { FeaturedPost } from "@/components/blog/featured-post";
import { BlogCard, BlogCardSkeleton } from "@/components/blog/blog-card";
import { BlogSearch } from "@/components/blog/blog-search";
import { BlogPagination } from "@/components/blog/blog-pagination";

export const metadata: Metadata = {
  title: "وبلاگ",
  description: "آخرین مطالب، معرفی کتاب، نقد و بررسی و اخبار دنیای کتاب",
};

type SearchParams = { search?: string; category?: string; page?: string };
type Props = { searchParams: Promise<SearchParams> };

async function BlogContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const category = sp.category ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));

  const [{ items: posts, meta }, categories] = await Promise.all([
    findPublishedPosts({ search, category }, { page, pageSize: 9 }),
    findPostCategories(),
  ]);

  /* First post on page-1 with no filter becomes featured */
  const featured = page === 1 && !search && !category && posts.length > 0 ? posts[0] : null;
  const gridPosts = featured ? posts.slice(1) : posts;

  const spRecord: Record<string, string> = {};
  if (search) spRecord.search = search;
  if (category) spRecord.category = category;

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          محتوای تازه
        </span>
        <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">وبلاگ کتاب‌خانه</h1>
        <p className="mt-2 text-muted-foreground">
          معرفی کتاب، نقد و بررسی، مصاحبه با نویسندگان و بیشتر
        </p>
      </div>

      {/* Featured post */}
      {featured && (
        <div className="mb-10">
          <FeaturedPost post={featured as any} />
        </div>
      )}

      {/* Search + category filter */}
      <div className="mb-8">
        <BlogSearch
          currentSearch={search}
          currentCategory={category}
          categories={categories}
        />
      </div>

      {/* Posts grid */}
      {gridPosts.length === 0 && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card py-20 text-center">
          <span className="text-5xl">📝</span>
          <div>
            <p className="text-lg font-bold text-foreground">مطلبی یافت نشد</p>
            <p className="mt-1 text-sm text-muted-foreground">
              عبارت جستجو یا دسته‌بندی را تغییر دهید
            </p>
          </div>
        </div>
      ) : (
        <>
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post as any} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              صفحه {meta.page.toLocaleString("fa-IR")} از{" "}
              {meta.totalPages.toLocaleString("fa-IR")}
              {" — "}
              {meta.total.toLocaleString("fa-IR")} مطلب
            </p>
            <BlogPagination meta={meta} searchParams={spRecord} />
          </div>
        </>
      )}
    </main>
  );
}

function BlogSkeleton() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center space-y-3">
        <div className="mx-auto h-6 w-24 animate-pulse rounded-full bg-muted" />
        <div className="mx-auto h-10 w-64 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mb-10 aspect-[21/9] animate-pulse rounded-3xl bg-muted" />
      <div className="mb-8 h-12 animate-pulse rounded-xl bg-muted" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function BlogPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogContent searchParams={searchParams} />
    </Suspense>
  );
}
