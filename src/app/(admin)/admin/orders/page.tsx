import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { findAllOrders } from "@/repositories/order.repository";

export const metadata: Metadata = { title: "مدیریت سفارش‌ها" };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "پرداخت شده", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "در حال پردازش", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "تحویل داده شده", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-700" },
};

type SearchParams = Promise<{ page?: string; status?: string }>;

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status as "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | undefined;

  const { items: orders, meta } = await findAllOrders(
    { status },
    { page, pageSize: 15 }
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">مدیریت سفارش‌ها</h1>
        <p className="text-sm text-muted-foreground">{meta.total.toLocaleString("fa-IR")} سفارش</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${!status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          همه
        </Link>
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${status === key ? "bg-primary text-primary-foreground" : `${val.color} hover:opacity-80`}`}
          >
            {val.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">شماره سفارش</th>
                <th className="px-4 py-3 text-start font-medium">مشتری</th>
                <th className="px-4 py-3 text-start font-medium">مبلغ</th>
                <th className="px-4 py-3 text-start font-medium">اقلام</th>
                <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th className="px-4 py-3 text-start font-medium">تاریخ</th>
                <th className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    سفارشی یافت نشد
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const s = STATUS_MAP[order.status] ?? { label: order.status, color: "bg-muted text-muted-foreground" };
                  const user = (order as { user?: { name?: string | null } }).user;
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold">{order.total.toLocaleString("fa-IR")} ت</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.items.length}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted"
                        >
                          جزئیات
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {meta.hasPrevPage && (
            <Link href={`?page=${page - 1}${status ? `&status=${status}` : ""}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
              ‹ قبلی
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page.toLocaleString("fa-IR")} / {meta.totalPages.toLocaleString("fa-IR")}
          </span>
          {meta.hasNextPage && (
            <Link href={`?page=${page + 1}${status ? `&status=${status}` : ""}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
              بعدی ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
