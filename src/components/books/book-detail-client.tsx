"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuantitySelector } from "./quantity-selector";
import { addToCartAction } from "@/actions/cart.actions";
import { addToWishlistAction, removeFromWishlistAction } from "@/actions/wishlist.actions";

interface Props {
  bookId: string;
  stock: number;
  price: number;
  isLoggedIn: boolean;
  initialInWishlist: boolean;
}

export function BookDetailClient({ bookId, stock, isLoggedIn, initialInWishlist }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [cartPending, startCartTransition] = useTransition();
  const [wishPending, startWishTransition] = useTransition();

  const inStock = stock > 0;
  const lowStock = stock > 0 && stock <= 5;

  function handleAddToCart() {
    startCartTransition(async () => {
      const res = await addToCartAction(bookId, qty);
      if (res.success) {
        toast.success(`${qty} جلد به سبد خرید اضافه شد`);
        router.refresh();
      } else {
        toast.error(!res.success ? res.error : "خطا");
      }
    });
  }

  function handleWishlist() {
    if (!isLoggedIn) {
      toast.error("برای استفاده از علاقه‌مندی‌ها وارد شوید");
      router.push("/auth/login");
      return;
    }
    startWishTransition(async () => {
      if (inWishlist) {
        const res = await removeFromWishlistAction(bookId);
        if (res.success) {
          setInWishlist(false);
          toast.success("از علاقه‌مندی‌ها حذف شد");
        } else {
          toast.error(!res.success ? res.error : "خطا");
        }
      } else {
        const res = await addToWishlistAction(bookId);
        if (res.success) {
          setInWishlist(true);
          toast.success("به علاقه‌مندی‌ها اضافه شد");
        } else {
          toast.error(!res.success ? res.error : "خطا");
        }
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Stock badge */}
      {inStock ? (
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-emerald-600">
            {lowStock ? `تنها ${stock.toLocaleString("fa-IR")} عدد باقی مانده` : "موجود در انبار"}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-sm font-medium text-rose-600">ناموجود</span>
        </div>
      )}

      {/* Quantity + CTA */}
      {inStock && (
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={qty}
            min={1}
            max={stock}
            onChange={setQty}
            disabled={cartPending}
          />
          <button
            type="button"
            disabled={cartPending}
            onClick={handleAddToCart}
            className="flex flex-1 min-w-[160px] items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {cartPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                در حال افزودن...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M1.5 1.5h1.667l1.916 8.333h7l1.917-6.083H4.333" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="6.5" cy="13.5" r="1.167" fill="currentColor" />
                  <circle cx="11.167" cy="13.5" r="1.167" fill="currentColor" />
                </svg>
                افزودن به سبد خرید
              </>
            )}
          </button>
        </div>
      )}

      {/* Wishlist + Share row */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={wishPending}
          onClick={handleWishlist}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            inWishlist
              ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill={inWishlist ? "currentColor" : "none"}
            aria-hidden
          >
            <path
              d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 4-6.5 8-7.5 8z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          {inWishlist ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی"}
        </button>

        <ShareButton />
      </div>
    </div>
  );
}

function ShareButton() {
  function handleCopy() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("لینک کپی شد");
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
        <path
          d="M10 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM5 5a1.5 1.5 0 110 3A1.5 1.5 0 015 5zm5 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M8.5 6.5l-2 1M8.5 8.5l-2-1"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      اشتراک‌گذاری
    </button>
  );
}
