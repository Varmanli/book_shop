import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { requireAuth } from "@/lib/session";
import { findAddressesByUserId } from "@/repositories/address.repository";
import { findCartItems } from "@/repositories/cart.repository";

export const metadata: Metadata = { title: "تکمیل خرید" };

async function CheckoutContent() {
  const session = await requireAuth();
  const userId = session.user.id;

  // Guard: empty cart → back to cart page
  const cartItems = await findCartItems({ userId });
  if (cartItems.length === 0) redirect("/cart");

  const addresses = await findAddressesByUserId(userId);

  return <CheckoutWizard addresses={addresses} />;
}

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<div className="h-16 border-b border-border bg-background/95" />}>
        <Header />
      </Suspense>

      <main className="flex-1 bg-muted/20">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-8">
              <div className="h-12 w-full rounded-2xl bg-muted" />
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <div className="h-64 rounded-2xl bg-muted" />
                </div>
                <div className="w-80 h-96 rounded-2xl bg-muted" />
              </div>
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
