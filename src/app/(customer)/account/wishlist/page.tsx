import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/session";
import { findWishlistItems } from "@/repositories/wishlist.repository";
import { WishlistClient } from "./wishlist-client";

export const metadata: Metadata = { title: "علاقه‌مندی‌ها" };

async function WishlistContent() {
  const session = await requireAuth();
  const items = await findWishlistItems(session.user.id);
  return <WishlistClient items={items} />;
}

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-44 rounded-lg bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted" />)}
          </div>
        </div>
      }
    >
      <WishlistContent />
    </Suspense>
  );
}
