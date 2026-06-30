"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, Package, ShoppingCart, Trash, X } from "lucide-react";
import { useCart } from "./cart-context";
import { displayPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface MiniCartProps {
  onClose: () => void;
}

export function MiniCart({ onClose }: MiniCartProps) {
  const router = useRouter();
  const { items, itemCount, total, isLoading, hasLoaded, refresh, removeItem } = useCart();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const visibleItems = items.slice(0, 5);
  const isEmpty = itemCount === 0;

  const requestClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosing) return;
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        afterClose?.();
        onClose();
      }, 140);
    },
    [isClosing, onClose],
  );

  const navigateTo = useCallback(
    (pathname: "/cart" | "/checkout", options?: { requireItems?: boolean }) => {
      if (options?.requireItems && isEmpty) return;

      if (pathname === "/checkout") {
        setCheckoutPending(true);
      }

      requestClose(() => {
        router.push(pathname);
      });
    },
    [isEmpty, requestClose, router],
  );

  async function handleRemove(itemId: string) {
    if (removingId) return;
    setRemovingId(itemId);
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    await removeItem(itemId);
    setRemovingId(null);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        requestClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [requestClose]);

  // Close on ESC
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [requestClose]);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void refresh();
    }
  }, [hasLoaded, isLoading, refresh]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-150",
          isClosing ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      />

      {/* Dropdown panel */}
      <div
        ref={ref}
        className={cn(
          "absolute end-0 top-full z-50 mt-3 flex max-h-[min(36rem,calc(100vh-5rem))] w-[22rem] flex-col overflow-hidden rounded-[28px] border border-border/60 bg-background/95 shadow-2xl shadow-black/10 backdrop-blur-xl transition-all duration-150",
          isClosing ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
        )}
        dir="rtl"
        role="dialog"
        aria-label="سبد خرید"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" />
            <span className="font-semibold text-foreground">سبد خرید</span>
            {itemCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {itemCount} کتاب
              </span>
            )}
          </div>
          <button
            onClick={() => requestClose()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:scale-[1.02] hover:bg-muted hover:text-foreground active:scale-[0.98]"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isEmpty ? (
          /* Empty state */
          <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">سبد خرید خالی است</p>
              <p className="text-xs text-muted-foreground">
                برای ادامه، ابتدا یک کتاب به سبد خرید اضافه کنید.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <ul className="max-h-80 flex-1 divide-y divide-border/40 overflow-y-auto px-2 py-2">
              {visibleItems.map((item) => {
                const cover =
                  item.book.images?.[0] ??
                  `https://picsum.photos/seed/${item.book.slug}/60/90`;
                const isRemoving = removingId === item.id;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-2 py-3 transition-all duration-200 hover:bg-muted/40",
                      isRemoving && "translate-x-3 opacity-0",
                    )}
                  >
                    {/* Cover */}
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted">
                      <Image
                        src={cover}
                        alt={item.book.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                        {item.book.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.book.author}
                      </p>
                      <p className="mt-1 text-xs font-bold text-primary">
                        {displayPrice(item.book.price)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => void handleRemove(item.id)}
                      disabled={isRemoving}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:scale-[1.02] hover:bg-red-50 hover:text-red-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                      aria-label="حذف"
                    >
                      <Trash size={15} />
                    </button>
                  </li>
                );
              })}

              {items.length > 5 && (
                <li className="px-4 py-2 text-center text-xs text-muted-foreground">
                  و {items.length - 5} کتاب دیگر …
                </li>
              )}
            </ul>
          </>
        )}

        <MiniCartFooter
          isEmpty={isEmpty}
          total={total}
          checkoutPending={checkoutPending}
          onOpenCart={() => navigateTo("/cart")}
          onCheckout={() => navigateTo("/checkout", { requireItems: true })}
        />
      </div>
    </>
  );
}

interface MiniCartFooterProps {
  checkoutPending: boolean;
  isEmpty: boolean;
  total: number;
  onOpenCart: () => void;
  onCheckout: () => void;
}

function MiniCartFooter({
  checkoutPending,
  isEmpty,
  total,
  onOpenCart,
  onCheckout,
}: MiniCartFooterProps) {
  return (
    <div className="sticky bottom-0 mt-auto border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className={cn(
          "mb-4 rounded-2xl border px-4 py-3",
          isEmpty
            ? "border-border/60 bg-muted/40 text-muted-foreground"
            : "border-primary/15 bg-primary/5",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">جمع کل</span>
          <span
            className={cn(
              "text-base font-extrabold",
              isEmpty ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {displayPrice(total)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenCart}
          disabled={isEmpty}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-all duration-150 hover:scale-[1.02] hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <ShoppingCart size={16} />
          سبد خرید
        </button>

        <button
          type="button"
          onClick={onCheckout}
          disabled={isEmpty || checkoutPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-150 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:scale-100"
        >
          <CreditCard size={16} />
          {checkoutPending ? "در حال انتقال..." : "خرید"}
        </button>
      </div>
    </div>
  );
}
