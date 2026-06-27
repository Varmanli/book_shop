import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import { books, orders, users } from "@/db/schema";
import { count, eq, sum, lte } from "drizzle-orm";
import { findAllOrders } from "@/repositories/order.repository";

export const metadata: Metadata = { title: "داشبورد مدیریت" };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "پرداخت شده", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "در حال پردازش", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "تحویل داده شده", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-700" },
};

async function DashboardContent() {
  const [
    [{ totalBooks }],
    [{ totalOrders }],
    [{ pendingOrders }],
    [{ totalUsers }],
    [{ revenue }],
    { items: recentOrders },
    lowStockBooks,
  ] = await Promise.all([
    db.select({ totalBooks: count() }).from(books),
    db.select({ totalOrders: count() }).from(orders),
    db.select({ pendingOrders: count() }).from(orders).where(eq(orders.status, "PENDING")),
    db.select({ totalUsers: count() }).from(users),
    db.select({ revenue: sum(orders.total) }).from(orders).where(eq(orders.status, "DELIVERED")),
    findAllOrders({}, { pageSize: 8 }),
    db.query.books.findMany({
      where: lte(books.stock, 5),
      orderBy: (b, { asc }) => asc(b.stock),
      limit: 5,
      columns: { id: true, title: true, stock: true, slug: true },
    }),
  ]);

  const stats = [
    {
      label: "کل کتاب‌ها",
      value: Number(totalBooks).toLocaleString("fa-IR"),
      href: "/admin/books",
      bg: "bg-amber-50",
      fg: "text-amber-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden>
          <rect x="3" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="5" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "کل سفارش‌ها",
      value: Number(totalOrders).toLocaleString("fa-IR"),
      href: "/admin/orders",
      bg: "bg-blue-50",
      fg: "text-blue-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M2.5 3h1.8l2.4 7.5h6.4l1.6-5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
          <circle cx="12.5" cy="14.5" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "سفارش‌های معلق",
      value: Number(pendingOrders).toLocaleString("fa-IR"),
      href: "/admin/orders",
      bg: "bg-yellow-50",
      fg: "text-yellow-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 5.5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "کاربران",
      value: Number(totalUsers).toLocaleString("fa-IR"),
      href: "#",
      bg: "bg-green-50",
      fg: "text-green-600",
      icon: (
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 15.5c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">داشبورد</h1>
        <p className="mt-1 text-sm text-muted-foreground">خلاصه وضعیت فروشگاه</p>
      </div>

      {/* Revenue card */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.666 0.179 60.4) 0%, oklch(0.6 0.18 50) 100%)" }}
      >
        <p className="text-sm font-medium opacity-80">درآمد کل (سفارش‌های تحویل‌شده)</p>
        <p className="mt-1 text-3xl font-extrabold">
          {revenue ? Number(revenue).toLocaleString("fa-IR") : "۰"} تومان
        </p>
        <Link
          href="/admin/orders"
          className="mt-3 inline-block rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30"
        >
          مشاهده سفارش‌ها ←
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.bg} ${stat.fg}`}>
              {stat.icon}
            </div>
            <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders table */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-bold text-foreground">آخرین سفارش‌ها</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-primary hover:underline">
              مشاهده همه
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-start font-medium">شماره سفارش</th>
                  <th className="px-4 py-3 text-start font-medium">مشتری</th>
                  <th className="px-4 py-3 text-start font-medium">مبلغ</th>
                  <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-start font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => {
                  const status = STATUS_MAP[order.status] ?? {
                    label: order.status,
                    color: "bg-muted text-muted-foreground",
                  };
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {(order as { user?: { name?: string | null } }).user?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {order.total.toLocaleString("fa-IR")} ت
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold text-foreground">موجودی کم</h2>
          </div>
          <ul className="divide-y divide-border">
            {lowStockBooks.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                همه کتاب‌ها موجودی کافی دارند ✓
              </li>
            ) : (
              lowStockBooks.map((book) => (
                <li key={book.id} className="flex items-center justify-between px-5 py-3">
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    {book.title}
                  </Link>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      book.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {book.stock === 0 ? "ناموجود" : `${book.stock} عدد`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/admin/books/new", label: "کتاب جدید", icon: "📚" },
          { href: "/admin/blog/new", label: "پست جدید", icon: "✍️" },
          { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: "🗂️" },
          { href: "/admin/settings", label: "تنظیمات", icon: "⚙️" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-md"
          >
            <p className="text-2xl">{link.icon}</p>
            <p className="mt-1 text-xs font-semibold text-foreground">{link.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 rounded-lg bg-muted" />
          <div className="h-28 rounded-2xl bg-muted" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted" />)}
          </div>
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
