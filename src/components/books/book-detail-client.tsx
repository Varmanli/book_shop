"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/actions/cart.actions";
import { emitCartUpdated } from "@/components/cart/cart-events";
import {
  addToWishlistAction,
  removeFromWishlistAction,
} from "@/actions/wishlist.actions";

import {
  Check,
  ShoppingCart,
  Heart,
  Share2,
  Circle,
  Minus,
} from "lucide-react";

interface Props {
  bookId: string;
  stock?: number;
  price: number;
  isLoggedIn: boolean;
  initialInWishlist: boolean;
  isSold: boolean;
}

export function BookDetailClient({
  bookId,
  isLoggedIn,
  initialInWishlist,
  isSold,
}: Props) {
  const router = useRouter();

  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [alreadyInCart, setAlreadyInCart] = useState(false);

  const [cartPending, startCartTransition] = useTransition();
  const [wishPending, startWishTransition] = useTransition();

  const isAvailable = !isSold;

  function handleAddToCart() {
    startCartTransition(async () => {
      const res = await addToCartAction(bookId);

      if (res.success) {
        setAlreadyInCart(true);
        toast.success("کتاب به سبد خرید اضافه شد");
        emitCartUpdated();
        router.refresh();
      } else {
        if (res.error?.includes("قبلاً")) setAlreadyInCart(true);
        toast.error(res.error ?? "خطا");
      }
    });
  }

  function handleWishlist() {
    if (!isLoggedIn) {
      toast.error("ابتدا وارد شوید");
      router.push("/auth/login");
      return;
    }

    startWishTransition(async () => {
      const action = inWishlist
        ? removeFromWishlistAction
        : addToWishlistAction;

      const res = await action(bookId);

      if (res.success) {
        setInWishlist(!inWishlist);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* ───── STATUS ───── */}
      {isAvailable ? (
        <div className="flex items-center gap-2 text-emerald-600">
          <Circle className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
          <span className="text-sm font-semibold">موجود</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-rose-600">
          <Minus className="h-4 w-4" />
          <span className="text-sm font-semibold">فروخته شده</span>
        </div>
      )}

      {/* ───── CARD ───── */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
        {/* SOLD STATE */}
        {!isAvailable ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/30 p-6 text-center">
            <Minus className="h-5 w-5 text-rose-500" />
            <p className="text-sm font-semibold">این کتاب فروخته شده است</p>
            <p className="text-xs text-muted-foreground">
              کتاب‌های مشابه را بررسی کنید
            </p>
          </div>
        ) : (
          <>
            {/* PRIMARY CTA */}
            {alreadyInCart ? (
              <div className="flex gap-2">
                <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700">
                  <Check className="h-4 w-4" />
                  در سبد خرید
                </div>

                <a
                  href="/cart"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  مشاهده
                </a>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={cartPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartPending ? "در حال افزودن..." : "افزودن به سبد خرید"}
              </button>
            )}

            {/* SECONDARY */}
            <div className="flex gap-2">
              <button
                onClick={handleWishlist}
                disabled={wishPending}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                  inWishlist
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-border bg-background"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    inWishlist ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
                علاقه‌مندی
              </button>

              <ShareButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───── SHARE ───── */
function ShareButton() {
  function copy() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("لینک کپی شد");
  }

  return (
    <button
      onClick={copy}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-medium"
    >
      <Share2 className="h-4 w-4" />
      اشتراک
    </button>
  );
}
