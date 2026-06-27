import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { findAllReviews, getReviewStats } from "@/repositories/reviews.repository";
import { ReviewsTable } from "./reviews-table";

export const metadata: Metadata = { title: "مدیریت نظرات" };

const STATUS_OPTIONS = [
  { value: "", label: "همه" },
  { value: "PENDING", label: "در انتظار" },
  { value: "APPROVED", label: "تأیید شده" },
  { value: "REJECTED", label: "رد شده" },
] as const;

const STATUS_PILL = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
} as const;

type SearchParams = Promise<{ page?: string; status?: string; search?: string }>;

async function ReviewsContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = (sp.status as "PENDING" | "APPROVED" | "REJECTED") || undefined;
  const search = sp.search || undefined;

  const [{ items, meta }, stats] = await Promise.all([
    findAllReviews({ status, search }, { page, pageSize: 20 }),
    getReviewStats(),
  ]);

  const buildHref = (params: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { page: String(page), status: sp.status ?? "", search: sp.search ?? "", ...params };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/reviews${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">مدیریت نظرات</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.total.toLocaleString("fa-IR")} نظر در کل</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">کل نظرات</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{stats.total.toLocaleString("fa-IR")}</p>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <p className="text-xs text-yellow-700">در انتظار بررسی</p>
          <p className="mt-1 text-2xl font-extrabold text-yellow-700">{stats.pending.toLocaleString("fa-IR")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">میانگین امتیاز</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-500">
            {stats.averageRating > 0 ? stats.averageRating.toLocaleString("fa-IR") : "—"}
            <span className="ms-1 text-sm font-normal text-muted-foreground">/ ۵</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <Link
            key={value}
            href={buildHref({ status: value, page: "1" })}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              (sp.status ?? "") === value
                ? "bg-primary text-primary-foreground"
                : value
                ? `${STATUS_PILL[value as keyof typeof STATUS_PILL]} hover:opacity-80`
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </Link>
        ))}

        <form className="ms-auto flex items-center gap-2" method="get" action="/admin/reviews">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="جستجو در کتاب یا ایمیل..."
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button type="submit" className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">
            جستجو
          </button>
        </form>
      </div>

      <ReviewsTable reviews={items} />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {meta.hasPrevPage && (
            <Link href={buildHref({ page: String(page - 1) })} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
              ‹ قبلی
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page.toLocaleString("fa-IR")} / {meta.totalPages.toLocaleString("fa-IR")}
          </span>
          {meta.hasNextPage && (
            <Link href={buildHref({ page: String(page + 1) })} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
              بعدی ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <ReviewsContent searchParams={searchParams} />
    </Suspense>
  );
}
