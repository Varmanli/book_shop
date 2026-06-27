import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findOrderById } from "@/repositories/order.repository";
import { OrderStatusUpdater } from "./status-updater";
import type { ShippingAddressSnapshot, BookSnapshot } from "@/db/schema/orders";

export const metadata: Metadata = { title: "جزئیات سفارش" };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار پرداخت", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "پرداخت شده", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "در حال پردازش", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "ارسال شده", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "تحویل داده شده", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-700" },
};

type Params = Promise<{ id: string }>;

async function OrderContent({ params }: { params: Params }) {
  const { id } = await params;
  const order = await findOrderById(id);
  if (!order) notFound();

  const status = STATUS_MAP[order.status] ?? { label: order.status, color: "bg-muted text-muted-foreground" };
  const address = order.shippingAddress as ShippingAddressSnapshot;
  const user = (order as { user?: { name?: string | null; email?: string | null } }).user;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card shadow-sm hover:bg-muted"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">سفارش #{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-bold text-foreground">کالاها ({order.items.length})</h2>
            </div>
            <ul className="divide-y divide-border">
              {order.items.map((item) => {
                const snap = item.bookSnapshot as BookSnapshot;
                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {snap.coverImage ? (
                        <Image src={snap.coverImage} alt={snap.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">📚</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{snap.title}</p>
                      <p className="text-xs text-muted-foreground">{snap.author}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold">{item.unitPrice.toLocaleString("fa-IR")} ت</p>
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Summary + customer */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">خلاصه مالی</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">جمع کالاها</dt>
                <dd>{order.subtotal.toLocaleString("fa-IR")} ت</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">هزینه ارسال</dt>
                <dd>{order.shippingCost === 0 ? "رایگان" : `${order.shippingCost.toLocaleString("fa-IR")} ت`}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="font-bold">جمع کل</dt>
                <dd className="font-extrabold text-primary">{order.total.toLocaleString("fa-IR")} ت</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-foreground">مشتری</h2>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">{user?.name ?? "—"}</p>
              <p className="text-muted-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-foreground">آدرس تحویل</h2>
            <address className="not-italic space-y-1 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{address.fullName}</p>
              <p>{address.phone}</p>
              <p>{address.province}، {address.city}</p>
              <p>{address.street}</p>
              <p>کد پستی: {address.postalCode}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <OrderContent params={params} />
    </Suspense>
  );
}
