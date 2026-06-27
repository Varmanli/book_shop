import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/session";
import { findAddressesByUserId } from "@/repositories/address.repository";
import { AddressesClient } from "./addresses-client";

export const metadata: Metadata = { title: "آدرس‌های من" };

async function AddressesContent() {
  const session = await requireAuth();
  const addresses = await findAddressesByUserId(session.user.id);
  return <AddressesClient addresses={addresses} />;
}

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-lg bg-muted" />
          {[...Array(2)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted" />)}
        </div>
      }
    >
      <AddressesContent />
    </Suspense>
  );
}
