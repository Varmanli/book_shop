import type { Metadata } from "next";
import { Suspense } from "react";
import { findAllSlides } from "@/repositories/home-slides.repository";
import { getSetting } from "@/repositories/settings.repository";
import { SiteContentClient } from "./site-content-client";
import type { AboutContent, ContactContent } from "@/actions/site-content.actions";

export const metadata: Metadata = {
  title: "مدیریت محتوای سایت | پنل ادمین",
};

function contentOrNull<T extends object>(value: unknown): T | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : null;
}

async function SiteContent() {
  let slides;
  let aboutRaw: unknown;
  let contactRaw: unknown;

  try {
    [slides, aboutRaw, contactRaw] = await Promise.all([
      findAllSlides(),
      getSetting("aboutPage"),
      getSetting("contactPage"),
    ]);
  } catch (error) {
    // Keep the original error visible in server logs; production Server
    // Components intentionally hide its details from the browser.
    console.error("[admin/site-content] failed to load content", error);
    throw error;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">
          مدیریت محتوای سایت
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          محتوای بخش‌های اصلی سایت را بدون نیاز به تغییر کد مدیریت کنید.
        </p>
      </div>
      <SiteContentClient
        slides={slides}
        aboutData={contentOrNull<AboutContent>(aboutRaw)}
        contactData={contentOrNull<ContactContent>(contactRaw)}
      />
    </div>
  );
}

export default function SiteContentPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <SiteContent />
    </Suspense>
  );
}
