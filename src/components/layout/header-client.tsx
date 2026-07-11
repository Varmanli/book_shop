"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { MiniCart } from "@/components/cart/mini-cart";
import { useCart } from "@/components/cart/cart-context";
import { logoutAction } from "@/actions/auth.actions";

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
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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
          ثبت نام
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-sm transition-all hover:scale-105 hover:shadow-md"
        aria-label="منوی کاربری"
      >
        <span className="text-sm font-bold">
          {userName?.[0]?.toUpperCase() ?? "U"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={16} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground">حساب کاربری</p>
            </div>
          </div>

          {/* Menu */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition hover:bg-muted/60"
            >
              <Settings size={16} />
              تنظیمات حساب
            </Link>

            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition hover:bg-muted/60"
            >
              <ShoppingBag size={16} />
              سفارش‌ها
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
              >
                <Shield size={16} />
                پنل مدیریت
              </Link>
            )}

            <div className="my-1 border-t border-border" />

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut size={16} />
                خروج از حساب
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface HeaderClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string | null;
  cartCount: number;
}

function CartButton({ initialCount }: { initialCount: number }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { itemCount, hasLoaded } = useCart();
  const count = hasLoaded ? itemCount : initialCount;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 transition hover:bg-muted hover:text-foreground"
        aria-label="سبد خرید"
      >
        <ShoppingCart size={19} aria-hidden />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && <MiniCart onClose={() => setOpen(false)} />}
    </div>
  );
}

export function HeaderClient({
  isLoggedIn,
  isAdmin,
  userName,
  cartCount,
}: HeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

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
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden
          >
            <rect
              x="3"
              y="4"
              width="16"
              height="20"
              rx="2"
              fill="currentColor"
              className="text-primary"
            />
            <rect
              x="9"
              y="4"
              width="16"
              height="20"
              rx="2"
              fill="currentColor"
              className="text-primary/50"
            />
            <path
              d="M7 9h8M7 13h8M7 17h5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden sm:inline">کتاب‌فروشی</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
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

        {/* Desktop search — grows to fill available space */}
        <div className="hidden flex-1 px-4 lg:block">
          <SearchBar />
        </div>

        {/* Desktop right: cart + user */}
        <div className="flex items-center gap-2 ms-auto lg:ms-0">
          {/* Cart */}
          <CartButton initialCount={cartCount} />

          <UserMenu
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            userName={userName}
          />

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 transition hover:bg-muted lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={20} aria-hidden />
            ) : (
              <Menu size={20} aria-hidden />
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
                onClick={() => setMenuOpen(false)}
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
