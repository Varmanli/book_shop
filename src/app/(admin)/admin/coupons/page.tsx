import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { findAllCoupons } from "@/repositories/coupon.repository";
import { CouponRowActions } from "./coupon-row-actions";

export const metadata: Metadata = { title: "مدیریت کدهای تخفیف" };

function formatExpiry(date: Date | null): string {
  if (!date) return "بدون انقضا";
  return new Date(date).toLocaleDateString("fa-IR");
}

type SearchParams = Promise<{ page?: string }>;

async function CouponsContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const { items: coupons, meta } = await findAllCoupons({ page, pageSize: 20 });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">کدهای تخفیف</h1>
          <p className="text-sm text-muted-foreground">{meta.total} کد تخفیف</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          + کد جدید
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">کد</th>
                <th className="px-4 py-3 text-start font-medium">نوع</th>
                <th className="px-4 py-3 text-start font-medium">مقدار</th>
                <th className="px-4 py-3 text-start font-medium">حداقل سفارش</th>
                <th className="px-4 py-3 text-start font-medium">استفاده</th>
                <th className="px-4 py-3 text-start font-medium">انقضا</th>
                <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    هنوز کد تخفیفی ایجاد نشده است
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <code className="rounded-lg bg-muted px-2 py-0.5 text-xs font-bold tracking-widest">
                        {c.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.type === "PERCENT" ? "درصدی" : "مقداری"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {c.type === "PERCENT"
                        ? `${c.value}٪`
                        : `${c.value.toLocaleString("fa-IR")} ریال`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.minOrderAmount > 0
                        ? `${c.minOrderAmount.toLocaleString("fa-IR")} ریال`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-foreground font-medium">
                        {c.usedCount.toLocaleString("fa-IR")}
                      </span>
                      {c.usageLimit !== null && (
                        <span className="text-muted-foreground">
                          {" "}/ {c.usageLimit.toLocaleString("fa-IR")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatExpiry(c.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {c.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CouponRowActions
                        id={c.id}
                        isActive={c.isActive}
                        code={c.code}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {meta.hasPrevPage && (
            <Link
              href={`?page=${page - 1}`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              ‹ قبلی
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page.toLocaleString("fa-IR")} / {meta.totalPages.toLocaleString("fa-IR")}
          </span>
          {meta.hasNextPage && (
            <Link
              href={`?page=${page + 1}`}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              بعدی ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminCouponsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <CouponsContent searchParams={searchParams} />
    </Suspense>
  );
}
