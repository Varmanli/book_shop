import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = { title: "سبد خرید" };

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<div className="h-16 border-b border-border bg-background/95" />}>
        <Header />
      </Suspense>

      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CartPageClient />
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
