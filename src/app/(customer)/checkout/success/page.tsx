import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Package, ArrowLeft, ShoppingBag, Receipt } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { requireAuth } from "@/lib/session";
import { findOrderById } from "@/repositories/order.repository";
import { displayPrice } from "@/lib/currency";
import type { BookSnapshot, ShippingAddressSnapshot } from "@/db/schema/orders";

export const metadata: Metadata = { title: "سفارش ثبت شد" };

type SearchParams = Promise<{ orderId?: string }>;

async function SuccessContent({ searchParams }: { searchParams: SearchParams }) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const session = await requireAuth();
  const order = await findOrderById(orderId);
  if (!order || order.userId !== session.user.id) notFound();

  const address = order.shippingAddress as ShippingAddressSnapshot;
  const createdAt = new Date(order.createdAt).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* ── success hero ── */}
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
          <CheckCircle2 size={48} className="text-emerald-600" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground">پرداخت موفق!</h1>
          <p className="text-muted-foreground">سفارش شما با موفقیت ثبت و پرداخت شد</p>
        </div>
        {/* order badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-2.5">
          <Receipt size={16} className="text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">
            شماره سفارش: #{order.orderNumber}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{createdAt}</p>
      </div>

      {/* ── order items ── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
          <ShoppingBag size={17} className="text-primary" />
          <h2 className="font-bold text-foreground">کتاب‌های خریداری‌شده</h2>
          <span className="ms-auto text-sm text-muted-foreground">{order.items.length} کتاب</span>
        </div>

        <ul className="divide-y divide-border/40">
          {order.items.map((item) => {
            const snap = item.bookSnapshot as BookSnapshot;
            return (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted shadow-sm">
                  {snap.coverImage ? (
                    <Image
                      src={snap.coverImage}
                      alt={snap.title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xl">
                      📚
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/books/${snap.slug}`}
                    className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {snap.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{snap.author}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-foreground">
                  {displayPrice(item.unitPrice)}
                </p>
              </li>
            );
          })}
        </ul>

        {/* totals */}
        <div className="space-y-2.5 border-t border-border/50 bg-muted/30 px-5 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">جمع کالاها</span>
            <span className="font-medium">{displayPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">هزینه ارسال</span>
            <span className={order.shippingCost === 0 ? "font-semibold text-emerald-600" : "font-medium"}>
              {order.shippingCost === 0 ? "رایگان" : displayPrice(order.shippingCost)}
            </span>
          </div>
          <div className="flex justify-between border-t border-dashed border-border pt-2.5">
            <span className="font-bold text-foreground">مبلغ پرداخت‌شده</span>
            <span className="text-xl font-extrabold text-emerald-600">
              {displayPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ── delivery info ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span>📍</span> آدرس تحویل
          </h3>
          <address className="not-italic space-y-0.5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{address.fullName}</p>
            <p>{address.province}، {address.city}</p>
            <p>{address.street}</p>
            <p>کد پستی: {address.postalCode}</p>
            <p>📱 {address.phone}</p>
          </address>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span>🚚</span> وضعیت سفارش
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-emerald-700">پرداخت تأیید شد</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">در حال پردازش</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">ارسال</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            اطلاع‌رسانی از طریق پیامک انجام می‌شود
          </p>
        </div>
      </div>

      {/* ── note ── */}
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        <Package size={17} className="mt-0.5 shrink-0" />
        <p>
          هر کتاب یک نسخه منحصربه‌فرد است. پس از پردازش، بسته‌بندی شده و ارسال می‌شود.
          می‌توانید وضعیت سفارش را از پنل کاربری پیگیری کنید.
        </p>
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Receipt size={18} />
          پیگیری سفارش
        </Link>
        <Link
          href="/books"
          className="flex items-center gap-2 rounded-2xl border border-border px-6 py-3 font-medium text-foreground transition hover:bg-muted"
        >
          <ArrowLeft size={18} />
          ادامه خرید
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<div className="h-16 border-b border-border bg-background/95" />}>
        <Header />
      </Suspense>

      <main className="flex-1 bg-muted/20">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-12">
              <div className="mx-auto h-24 w-24 rounded-full bg-muted" />
              <div className="mx-auto h-8 w-48 rounded-lg bg-muted" />
              <div className="h-64 rounded-2xl bg-muted" />
            </div>
          }
        >
          <SuccessContent searchParams={searchParams} />
        </Suspense>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
