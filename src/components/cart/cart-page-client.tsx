"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  ChevronLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Info,
} from "lucide-react";
import { useCart } from "./cart-context";
import { displayPrice } from "@/lib/currency";

/* ─── quality badge map ─────────────────────────────────────── */
const QUALITY: Record<string, { label: string; cls: string }> = {
  "Like New":   { label: "مثل نو",    cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  "Very Good":  { label: "خیلی خوب",  cls: "bg-sky-50 text-sky-700 ring-1 ring-sky-200" },
  Good:         { label: "خوب",       cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  Acceptable:   { label: "قابل قبول", cls: "bg-orange-50 text-orange-700 ring-1 ring-orange-200" },
};

/* ═══════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════ */
export function CartPageClient() {
  const { items, itemCount, subtotal, shippingCost, total, isLoading, removeItem } =
    useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemovingId(id);
    await removeItem(id);
    setRemovingId(null);
  }

  if (isLoading) return <CartSkeleton />;
  if (itemCount === 0) return <EmptyCart />;

  return (
    <div dir="rtl">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">صفحه اصلی</Link>
        <ChevronLeft size={14} />
        <span className="font-medium text-foreground">سبد خرید</span>
      </nav>

      {/* heading */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">سبد خرید</h1>
        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
          {itemCount} کتاب
        </span>
      </div>

      {/* two-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">

        {/* ── items ── */}
        <div className="space-y-3">
          {items.map((item) => {
            const badge = QUALITY[item.book.qualityGrade] ?? {
              label: item.book.qualityGrade,
              cls: "bg-muted text-muted-foreground ring-1 ring-border",
            };
            const cover =
              item.book.images?.[0] ??
              `https://picsum.photos/seed/${item.book.slug}/160/240`;
            const isRemoving = removingId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 sm:gap-5 sm:p-5 ${
                  isRemoving
                    ? "pointer-events-none scale-[0.98] opacity-50"
                    : "hover:border-border hover:shadow-md"
                }`}
              >
                {/* thumbnail */}
                <Link href={`/books/${item.book.slug}`} className="shrink-0">
                  <div className="relative h-32 w-[88px] overflow-hidden rounded-xl border border-border/40 bg-muted shadow-sm sm:h-36 sm:w-24">
                    <Image
                      src={cover}
                      alt={item.book.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>
                </Link>

                {/* info */}
                <div className="min-w-0 flex-1 py-0.5">
                  <Link href={`/books/${item.book.slug}`}>
                    <h3 className="line-clamp-2 font-bold leading-snug text-foreground transition-colors hover:text-primary sm:text-lg">
                      {item.book.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{item.book.author}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      موجود
                    </span>
                  </div>

                  {/* price + remove */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xl font-extrabold text-foreground">
                      {displayPrice(item.book.price)}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving}
                      className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      aria-label="حذف از سبد"
                    >
                      <Trash2 size={15} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* trust signals */}
          <div className="mt-2 grid grid-cols-3 gap-3">
            {[
              { icon: Truck,       text: "ارسال سریع",    sub: "به سراسر کشور" },
              { icon: ShieldCheck, text: "پرداخت امن",     sub: "درگاه معتبر" },
              { icon: RotateCcw,   text: "ضمانت بازگشت",  sub: "تا ۷ روز" },
            ].map(({ icon: Icon, text, sub }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/40 bg-card px-3 py-4 text-center shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Icon size={16} className="text-primary" />
                </div>
                <p className="text-[13px] font-semibold text-foreground">{text}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── summary card ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">

            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="font-bold text-foreground">خلاصه سفارش</h2>
            </div>

            <div className="space-y-3 px-5 py-4">
              <SummaryRow
                label={`قیمت کالاها (${itemCount} کتاب)`}
                value={displayPrice(subtotal)}
              />
              <ShippingRow shippingCost={shippingCost} />
            </div>

            <div className="mx-5 my-1 border-t border-dashed border-border" />

            {/* total */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">مبلغ قابل پرداخت</span>
                <span className="text-2xl font-extrabold text-foreground">
                  {displayPrice(total)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5">
              <Link
                href="/checkout"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-center text-[15px] font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                ادامه و پرداخت
                <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" />
              </Link>

              <Link
                href="/books"
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border py-3 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                ادامه خرید
              </Link>
            </div>

            {/* footnote */}
            <div className="border-t border-border/40 bg-muted/40 px-5 py-3">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <Info size={12} className="mt-0.5 shrink-0 text-primary/50" />
                هر کتاب یک نسخه منحصربه‌فرد است — پس از خرید، دیگر قابل سفارش نخواهد بود
              </p>
            </div>
          </div>

          {/* discount code */}
          <DiscountCode />
        </div>
      </div>
    </div>
  );
}

/* ─── shipping row ──────────────────────────────────────────── */
function ShippingRow({ shippingCost }: { shippingCost: number }) {
  if (shippingCost === 0) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">هزینه ارسال</span>
        <span className="font-semibold text-emerald-600">رایگان</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">هزینه ارسال</span>
      <span className="font-medium text-foreground">{displayPrice(shippingCost)}</span>
    </div>
  );
}

/* ─── shared summary row ────────────────────────────────────── */
function SummaryRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-foreground ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ─── discount code box ─────────────────────────────────────── */
function DiscountCode() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
        <Tag size={15} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">کد تخفیف</span>
      </div>
      <div className="flex gap-2 p-3">
        <input
          type="text"
          placeholder="کد تخفیف خود را وارد کنید"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          dir="ltr"
        />
        <button
          onClick={() => code && setApplied(true)}
          disabled={!code || applied}
          className="shrink-0 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
        >
          {applied ? "اعمال شد" : "اعمال"}
        </button>
      </div>
    </div>
  );
}

/* ─── empty state ───────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-8 py-24 text-center" dir="rtl">
      <div className="relative">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/8 ring-8 ring-primary/4">
          <ShoppingBag size={52} className="text-primary/40" strokeWidth={1.2} />
        </div>
        <div className="absolute -end-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 ring-4 ring-background text-amber-600 text-lg">
          📚
        </div>
      </div>

      <div className="max-w-sm space-y-2">
        <h2 className="text-2xl font-extrabold text-foreground">سبد خرید شما خالی است</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          هنوز کتابی انتخاب نکرده‌اید. از میان صدها عنوان کتاب دست‌دوم انتخاب کنید.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
        >
          <ArrowLeft size={18} />
          ادامه خرید
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-border px-8 py-3.5 font-medium text-foreground transition hover:bg-muted"
        >
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

/* ─── skeleton ──────────────────────────────────────────────── */
function CartSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]" dir="rtl">
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-5 rounded-2xl border border-border/40 bg-card p-5">
            <div className="h-36 w-24 shrink-0 rounded-xl bg-muted" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-5 w-3/4 rounded-lg bg-muted" />
              <div className="h-3.5 w-1/3 rounded-lg bg-muted" />
              <div className="h-3.5 w-20 rounded-lg bg-muted" />
              <div className="mt-5 h-7 w-28 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="mt-4 h-14 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
