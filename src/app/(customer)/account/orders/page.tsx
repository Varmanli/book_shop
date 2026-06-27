import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/session";
import { findOrdersByUserId } from "@/repositories/order.repository";

export const metadata: Metadata = { title: "سفارش‌های من" };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "پرداخت شده", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "در حال پردازش", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "تحویل داده شده", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-700" },
};

type SearchParams = Promise<{ page?: string }>;

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const session = await requireAuth();
  const page = Math.max(1, Number(sp.page ?? 1));
  const { items: orders, meta } = await findOrdersByUserId(session.user.id, {
    page,
    pageSize: 10,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">سفارش‌های من</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.total.toLocaleString("fa-IR")} سفارش</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center shadow-sm">
          <svg width="48" height="48" viewBox="0 0 18 18" fill="none" className="text-muted-foreground/30" aria-hidden>
            <path d="M2.5 3h1.8l2.4 7.5h6.4l1.6-5H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
            <circle cx="12.5" cy="14.5" r="1" fill="currentColor" />
          </svg>
          <p className="font-semibold text-foreground">هنوز سفارشی ندارید</p>
          <p className="text-sm text-muted-foreground">با خرید اولین کتاب سفارش‌تان اینجا نمایش می‌یابد</p>
          <Link
            href="/books"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            مشاهده کتاب‌ها
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] ?? {
                label: order.status,
                color: "bg-muted text-muted-foreground",
              };
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">سفارش #{order.orderNumber}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-foreground">
                        {order.total.toLocaleString("fa-IR")} تومان
                      </p>
                      <p className="text-xs text-muted-foreground">{order.items.length} قلم کالا</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => {
                      const snap = item.bookSnapshot as { title: string };
                      return (
                        <span key={item.id} className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {snap.title}
                        </span>
                      );
                    })}
                    {order.items.length > 3 && (
                      <span className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                        +{order.items.length - 3} کالای دیگر
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {meta.hasPrevPage && (
                <Link href={`?page=${page - 1}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
                  ‹ قبلی
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                صفحه {page.toLocaleString("fa-IR")} از {meta.totalPages.toLocaleString("fa-IR")}
              </span>
              {meta.hasNextPage && (
                <Link href={`?page=${page + 1}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
                  بعدی ›
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-40 rounded-lg bg-muted" />
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted" />)}
        </div>
      }
    >
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
