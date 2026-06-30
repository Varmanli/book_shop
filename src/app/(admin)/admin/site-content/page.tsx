import type { Metadata } from "next";
import {
  findAllSlides,
  normalizeSlideOrders,
} from "@/repositories/home-slides.repository";
import { getSetting } from "@/repositories/settings.repository";
import { SiteContentClient } from "./site-content-client";
import type { AboutContent, ContactContent } from "@/actions/site-content.actions";

export const metadata: Metadata = {
  title: "مدیریت محتوای سایت | پنل ادمین",
};

export default async function SiteContentPage() {
  // Normalize orders on load to fix any pre-existing duplicates
  await normalizeSlideOrders();

  const [slides, aboutRaw, contactRaw] = await Promise.all([
    findAllSlides(),
    getSetting("aboutPage"),
    getSetting("contactPage"),
  ]);

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
        aboutData={(aboutRaw ?? null) as AboutContent | null}
        contactData={(contactRaw ?? null) as ContactContent | null}
      />
    </div>
  );
}
