import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/session";
import { getUserById } from "@/services/user.service";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "تنظیمات حساب" };

async function SettingsContent() {
  const session = await requireAuth();
  const user = await getUserById(session.user.id);
  if (!user) return null;

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? null,
        hasPassword: !!user.password,
      }}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-44 rounded-lg bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
          <div className="h-56 rounded-2xl bg-muted" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
