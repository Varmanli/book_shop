"use client";

import Image from "next/image";
import { ShoppingBag, Lock } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { displayPrice } from "@/lib/currency";

interface Props {
  showPayBadge?: boolean;
  /** Discount amount from an applied coupon (pre-validated on server). */
  discountAmount?: number;
  couponCode?: string;
}

export function OrderSummaryCard({
  showPayBadge = false,
  discountAmount = 0,
  couponCode,
}: Props) {
  const { items, itemCount, subtotal, shippingCost, total, isLoading } = useCart();
  const effectiveTotal = Math.max(0, total - discountAmount);

  return (
    <aside className="w-full lg:w-[340px] lg:shrink-0">
      <div className="lg:sticky lg:top-24 space-y-3">
        {/* ── main card ── */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* header */}
          <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
            <ShoppingBag size={17} className="text-primary" />
            <h2 className="font-bold text-foreground">خلاصه سفارش</h2>
            {!isLoading && (
              <span className="ms-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {itemCount} کتاب
              </span>
            )}
          </div>

          {/* items list */}
          {isLoading ? (
            <div className="animate-pulse space-y-3 px-5 py-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-14 w-10 shrink-0 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="max-h-56 divide-y divide-border/40 overflow-y-auto">
              {items.map((item) => {
                const cover =
                  item.book.images?.[0] ??
                  `https://picsum.photos/seed/${item.book.slug}/60/90`;
                return (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted">
                      <Image
                        src={cover}
                        alt={item.book.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                        {item.book.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.book.author}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-bold text-foreground">
                      {displayPrice(item.book.price)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          {/* totals */}
          <div className="space-y-2.5 border-t border-border/50 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">جمع کالاها</span>
              {isLoading ? (
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              ) : (
                <span className="font-medium">{displayPrice(subtotal)}</span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">هزینه ارسال</span>
              {isLoading ? (
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              ) : shippingCost === 0 ? (
                <span className="font-semibold text-emerald-600">رایگان</span>
              ) : (
                <span className="font-medium">{displayPrice(shippingCost)}</span>
              )}
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600">
                  تخفیف {couponCode && <code className="text-xs font-bold">({couponCode})</code>}
                </span>
                <span className="font-semibold text-emerald-600">
                  −{displayPrice(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-dashed border-border pt-2.5">
              <span className="font-semibold text-foreground">مبلغ نهایی</span>
              {isLoading ? (
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <span className="text-xl font-extrabold text-foreground">
                  {displayPrice(effectiveTotal)}
                </span>
              )}
            </div>
          </div>

          {/* security badge */}
          {showPayBadge && (
            <div className="border-t border-border/40 bg-emerald-50/60 px-5 py-3">
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Lock size={13} />
                پرداخت شما کاملاً امن و رمزگذاری‌شده است
              </p>
            </div>
          )}
        </div>

        {/* trust badges */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-muted-foreground">
          {[
            ["🔒", "درگاه امن"],
            ["📦", "ارسال سریع"],
            ["↩️", "ضمانت بازگشت"],
            ["📞", "پشتیبانی ۲۴/۷"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-card px-2 py-2 shadow-sm"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
