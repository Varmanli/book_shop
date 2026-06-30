import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/session";
import { findOrderById } from "@/repositories/order.repository";
import type { ShippingAddressSnapshot, BookSnapshot } from "@/db/schema/orders";

export const metadata: Metadata = { title: "جزئیات سفارش" };

const STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  PENDING: { label: "در انتظار پرداخت", color: "text-yellow-600", step: 1 },
  PAID: { label: "پرداخت شده", color: "text-blue-600", step: 2 },
  PROCESSING: { label: "در حال پردازش", color: "text-purple-600", step: 3 },
  SHIPPED: { label: "ارسال شده", color: "text-indigo-600", step: 4 },
  DELIVERED: { label: "تحویل داده شده", color: "text-green-600", step: 5 },
  CANCELLED: { label: "لغو شده", color: "text-red-600", step: 0 },
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "ثبت سفارش", icon: "📋" },
  { key: "PAID", label: "پرداخت", icon: "💳" },
  { key: "PROCESSING", label: "پردازش", icon: "⚙️" },
  { key: "SHIPPED", label: "ارسال", icon: "🚚" },
  { key: "DELIVERED", label: "تحویل", icon: "✅" },
];

type Params = Promise<{ id: string }>;

async function OrderDetailContent({ params }: { params: Params }) {
  const { id } = await params;
  const session = await requireAuth();

  const order = await findOrderById(id);
  if (!order || order.userId !== session.user.id) notFound();

  const status = STATUS_MAP[order.status] ?? { label: order.status, color: "text-foreground", step: 0 };
  const address = order.shippingAddress as ShippingAddressSnapshot;
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/account/orders"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">سفارش #{order.orderNumber}</h1>
          <p className="text-xs text-muted-foreground">
            ثبت شده در {new Date(order.createdAt).toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`ms-auto rounded-full bg-muted px-3 py-1 text-sm font-bold ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">وضعیت سفارش</h2>
          <div className="flex items-center">
            {TIMELINE_STEPS.map((step, i) => {
              const stepNum = STATUS_MAP[step.key]?.step ?? 0;
              const done = status.step >= stepNum;
              const current = stepNum === status.step;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all ${
                        current
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : done
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span className={`text-[10px] font-medium ${current ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`mx-1 h-0.5 flex-1 ${done && status.step > (STATUS_MAP[step.key]?.step ?? 0) ? "bg-green-300" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <h2 className="border-b border-border px-5 py-4 text-sm font-bold text-foreground">
              کالاها ({order.items.length})
            </h2>
            <ul className="divide-y divide-border">
              {order.items.map((item) => {
                const snap = item.bookSnapshot as BookSnapshot;
                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {snap.coverImage ? (
                        <Image
                          src={snap.coverImage}
                          alt={snap.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                            <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/books/${snap.slug}`}
                        className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1"
                      >
                        {snap.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{snap.author}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-foreground">
                        {item.unitPrice.toLocaleString("fa-IR")} ت
                      </p>
                      <p className="text-xs text-muted-foreground">یک نسخه</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">خلاصه پرداخت</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">جمع کالاها</dt>
                <dd className="font-medium">{order.subtotal.toLocaleString("fa-IR")} ت</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">هزینه ارسال</dt>
                <dd className="font-medium">
                  {order.shippingCost === 0 ? "رایگان" : `${order.shippingCost.toLocaleString("fa-IR")} ت`}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="font-bold text-foreground">جمع کل</dt>
                <dd className="font-extrabold text-primary">{order.total.toLocaleString("fa-IR")} ت</dd>
              </div>
            </dl>
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

export default function OrderDetailPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-5">
          <div className="h-10 w-64 rounded-lg bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      }
    >
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
