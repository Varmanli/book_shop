import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/session";
import { findOrdersByUserId } from "@/repositories/order.repository";
import { findWishlistItems } from "@/repositories/wishlist.repository";
import { findAddressesByUserId } from "@/repositories/address.repository";

export const metadata: Metadata = { title: "داشبورد حساب کاربری" };

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "پرداخت شده", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "در حال پردازش", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "تحویل داده شده", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-700" },
};

async function DashboardContent() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [{ items: recentOrders, meta }, wishlist, addresses] = await Promise.all([
    findOrdersByUserId(userId, { pageSize: 3 }),
    findWishlistItems(userId),
    findAddressesByUserId(userId),
  ]);

  const totalSpent = recentOrders
    .filter((o) => ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      label: "سفارش‌ها",
      value: meta.total.toLocaleString("fa-IR"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M2.5 3h1.8l2.4 7.5h6.4l1.6-5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
          <circle cx="12.5" cy="14.5" r="1" fill="currentColor" />
        </svg>
      ),
      href: "/account/orders",
      bg: "bg-blue-50",
      fg: "text-blue-600",
    },
    {
      label: "مجموع خرید",
      value: totalSpent.toLocaleString("fa-IR") + " ت",
      icon: (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 5v8M6.5 7.5h3.8c.6 0 1 .4 1 1s-.4 1-1 1H8.2c-.6 0-1 .4-1 1s.4 1 1 1H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      href: "/account/orders",
      bg: "bg-green-50",
      fg: "text-green-600",
    },
    {
      label: "علاقه‌مندی‌ها",
      value: wishlist.length.toLocaleString("fa-IR"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M9 15S2 10.5 2 6.2C2 4.4 3.4 3 5.2 3c1 0 2 .5 2.8 1.3L9 5.5l1-1.2C10.8 3.5 11.8 3 12.8 3 14.6 3 16 4.4 16 6.2 16 10.5 9 15 9 15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      href: "/account/wishlist",
      bg: "bg-rose-50",
      fg: "text-rose-600",
    },
    {
      label: "آدرس‌ها",
      value: addresses.length.toLocaleString("fa-IR"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M9 1.5C6.5 1.5 4.5 3.5 4.5 6c0 3.5 4.5 10.5 4.5 10.5S13.5 9.5 13.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="9" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      href: "/account/addresses",
      bg: "bg-amber-50",
      fg: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          خوش آمدید، {session.user.name?.split(" ")[0] ?? "کاربر"} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          خلاصه‌ای از فعالیت‌های حساب کاربری شما
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.bg} ${stat.fg}`}>
              {stat.icon}
            </div>
            <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-bold text-foreground">آخرین سفارش‌ها</h2>
          <Link href="/account/orders" className="text-xs font-medium text-primary hover:underline">
            مشاهده همه
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید</p>
            <Link
              href="/books"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              مشاهده کتاب‌ها
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentOrders.map((order) => {
              const status = ORDER_STATUS_MAP[order.status] ?? {
                label: order.status,
                color: "bg-muted text-muted-foreground",
              };
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        سفارش #{order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fa-IR")} · {order.items.length} قلم
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {order.total.toLocaleString("fa-IR")} ت
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: "/books", label: "مشاهده کتاب‌ها", desc: "خرید کتاب جدید" },
          { href: "/account/addresses", label: "مدیریت آدرس‌ها", desc: "افزودن یا ویرایش آدرس" },
          { href: "/account/settings", label: "تنظیمات حساب", desc: "ویرایش اطلاعات شخصی" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-foreground">{a.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-52 rounded-lg bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
