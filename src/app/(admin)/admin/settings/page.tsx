import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllSettings } from "@/repositories/settings.repository";
import { AdminSettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "تنظیمات سایت" };

async function SettingsContent() {
  const settings = await getAllSettings();
  return <AdminSettingsClient settings={settings} />;
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <SettingsContent />
    </Suspense>
  );
}
