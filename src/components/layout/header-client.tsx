"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/books", label: "کتاب‌ها" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

interface UserMenuProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string | null;
}

function UserMenu({ isLoggedIn, isAdmin, userName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition hover:text-primary"
        >
          ورود
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary/20"
        aria-label="منوی کاربری"
      >
        {userName?.[0] ?? "U"}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{userName}</p>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              حساب کاربری
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              سفارش‌ها
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-primary transition hover:bg-muted"
              >
                پنل مدیریت
              </Link>
            )}
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="w-full px-4 py-2 text-right text-sm text-destructive transition hover:bg-muted"
              >
                خروج
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchBarProps {
  className?: string;
  onClose?: () => void;
}

function SearchBar({ className = "", onClose }: SearchBarProps) {
  return (
    <form
      action="/books"
      method="get"
      className={`relative ${className}`}
      onSubmit={onClose}
    >
      <input
        type="search"
        name="q"
        placeholder="جستجوی کتاب، نویسنده..."
        className="w-full rounded-xl border border-border bg-muted/60 py-2 pe-10 ps-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        dir="rtl"
      />
      <button
        type="submit"
        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        aria-label="جستجو"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

interface HeaderClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string | null;
  cartCount: number;
}

export function HeaderClient({ isLoggedIn, isAdmin, userName, cartCount }: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-md shadow-black/5" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold text-foreground"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <rect x="3" y="4" width="16" height="20" rx="2" fill="currentColor" className="text-primary" />
            <rect x="9" y="4" width="16" height="20" rx="2" fill="currentColor" className="text-primary/50" />
            <path d="M7 9h8M7 13h8M7 17h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">کتاب‌فروشی</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right: search + cart + user */}
        <div className="flex items-center gap-2 ms-auto">
          <SearchBar className="hidden w-52 xl:block" />

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 transition hover:bg-muted hover:text-foreground"
            aria-label="سبد خرید"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M2 3h2l2 9h8l2-7H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="16" r="1.25" fill="currentColor" />
              <circle cx="14" cy="16" r="1.25" fill="currentColor" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <UserMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={userName} />

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 transition hover:bg-muted lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          <SearchBar className="mb-3" onClose={() => setMenuOpen(false)} />
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
