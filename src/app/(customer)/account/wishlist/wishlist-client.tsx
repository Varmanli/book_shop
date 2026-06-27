"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { removeFromWishlistAction } from "@/actions/wishlist.actions";

type WishlistItemWithBook = {
  id: string;
  bookId: string;
  book: {
    id: string;
    title: string;
    author: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
    qualityGrade: string;
  } | null;
};

interface Props {
  items: WishlistItemWithBook[];
}

const QUALITY_MAP: Record<string, string> = {
  NEW: "نو",
  LIKE_NEW: "مثل نو",
  GOOD: "خوب",
  FAIR: "قابل قبول",
  POOR: "فرسوده",
};

export function WishlistClient({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(bookId: string) {
    setRemoving(bookId);
    const res = await removeFromWishlistAction(bookId);
    setRemoving(null);
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.bookId !== bookId));
      toast.success("از علاقه‌مندی‌ها حذف شد");
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">علاقه‌مندی‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} کتاب</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center shadow-sm">
          <svg width="48" height="48" viewBox="0 0 18 18" fill="none" className="text-muted-foreground/30" aria-hidden>
            <path d="M9 15S2 10.5 2 6.2C2 4.4 3.4 3 5.2 3c1 0 2 .5 2.8 1.3L9 5.5l1-1.2C10.8 3.5 11.8 3 12.8 3 14.6 3 16 4.4 16 6.2 16 10.5 9 15 9 15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <p className="font-semibold text-foreground">لیست علاقه‌مندی‌ها خالی است</p>
          <p className="text-sm text-muted-foreground">کتاب‌های مورد علاقه‌تان را اینجا ذخیره کنید</p>
          <Link
            href="/books"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            مشاهده کتاب‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => {
            if (!item.book) return null;
            const book = item.book;
            const cover = book.images?.[0];
            const inStock = book.stock > 0;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md overflow-hidden"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(book.id)}
                  disabled={removing === book.id}
                  className="absolute end-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-sm transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                  title="حذف از علاقه‌مندی"
                >
                  {removing === book.id ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M7 12S1.5 8.5 1.5 5.2C1.5 3.7 2.7 2.5 4.2 2.5c.8 0 1.5.4 2 1l.8.9.8-.9c.5-.6 1.2-1 2-1C11.3 2.5 12.5 3.7 12.5 5.2 12.5 8.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Cover */}
                <Link href={`/books/${book.slug}`} className="block">
                  <div className="relative aspect-[3/4] bg-muted">
                    {cover ? (
                      <Image src={cover} alt={book.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-muted-foreground/30" aria-hidden>
                          <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-foreground">
                          ناموجود
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <span className="mb-1 inline-block rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {QUALITY_MAP[book.qualityGrade] ?? book.qualityGrade}
                  </span>
                  <Link href={`/books/${book.slug}`}>
                    <h3 className="line-clamp-2 text-xs font-bold text-foreground hover:text-primary">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{book.author}</p>
                  <p className="mt-2 text-sm font-extrabold text-primary">
                    {book.price.toLocaleString("fa-IR")} ت
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
