"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { addToCartAction } from "@/actions/cart.actions";
import { emitCartUpdated } from "@/components/cart/cart-events";
import { useCart } from "@/components/cart/cart-context";
import { displayPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { QualityGrade } from "@/types/domain";

type BookCardProps = {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  isSold: boolean;
  images?: string[];
  qualityGrade: QualityGrade;
  category?: {
    name: string;
    slug: string;
  } | null;
};

type CartState = "idle" | "loading" | "added";

export function BookCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="space-y-3 p-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="border-t p-3">
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </article>
  );
}

export function ListingBookCard({
  book,
  isLoggedIn: _isLoggedIn = false,
}: {
  book: BookCardProps;
  isLoggedIn?: boolean;
}) {
  void _isLoggedIn;
  const { items, hasLoaded } = useCart();

  const [cartState, setCartState] = useState<CartState>("idle");
  const [isPending, startTransition] = useTransition();

  const isAvailable = !book.isSold;

  const isInCart = hasLoaded ? items.some((i) => i.bookId === book.id) : false;

  const image =
    book.images?.[0] ?? `https://picsum.photos/seed/${book.id}/300/420`;

  function handleAddToCart() {
    if (!isAvailable || isPending || isInCart) return;

    setCartState("loading");

    startTransition(async () => {
      const res = await addToCartAction(book.id);

      if (res.success) {
        setCartState("added");
        emitCartUpdated();
        return;
      }

      setCartState("idle");
    });
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition",
        isAvailable ? "hover:-translate-y-1 hover:shadow-xl" : "opacity-60",
      )}
    >
      {/* IMAGE */}
      <Link href={`/books/${book.slug}`}>
        <div className="relative aspect-3/4 overflow-hidden">
          <Image
            src={image}
            alt={book.title}
            fill
            className="object-cover transition group-hover:scale-105"
          />

          {!isAvailable && <div className="absolute inset-0 bg-black/30" />}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-bold">{book.title}</h3>

        <p className="text-xs text-muted-foreground">{book.author}</p>

        <div className="mt-auto pt-3">
          <p className="text-base font-extrabold text-orange-600">
            {displayPrice(book.price)}
          </p>
        </div>
      </div>

      {/* ACTION */}
      <div className="border-t p-3">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable || isPending || isInCart}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
            "active:scale-[0.98]",
            isInCart
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : isAvailable
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {isPending || cartState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isInCart || cartState === "added" ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}

          {isInCart || cartState === "added"
            ? "در سبد خرید"
            : isPending || cartState === "loading"
              ? "در حال افزودن..."
              : "افزودن به سبد خرید"}
        </button>
      </div>
    </article>
  );
}
