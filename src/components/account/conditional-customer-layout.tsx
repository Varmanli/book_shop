"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  backToTop: ReactNode;
  /** Sidebar + bottom tabs (server-rendered, passed as slot) */
  sidebar: ReactNode;
  bottomTabs: ReactNode;
}

/** Routes that supply their own header + footer and must bypass the sidebar. */
const STANDALONE_PREFIXES = ["/cart", "/checkout"];

/**
 * Renders the full account dashboard layout for all customer routes.
 * Routes listed in STANDALONE_PREFIXES receive a transparent pass-through so
 * each page can mount its own Header / Footer shell (ecommerce layout).
 */
export function ConditionalCustomerLayout({
  children,
  header,
  footer,
  backToTop,
  sidebar,
  bottomTabs,
}: Props) {
  const pathname = usePathname();

  if (
    STANDALONE_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.09),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.3),rgba(245,245,244,0.9))]">
      {header}
      <main className="flex-1 pb-24 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <p className="text-xs font-bold tracking-[0.24em] text-primary/80">
                  ACCOUNT CENTER
                </p>
                <h1 className="mt-2 text-xl font-black text-foreground sm:text-2xl">
                  حساب کاربری شما
                </h1>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="hidden md:block">{sidebar}</div>
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </div>
        </div>
      </main>
      {footer}
      {backToTop}
      {bottomTabs}
    </div>
  );
}
