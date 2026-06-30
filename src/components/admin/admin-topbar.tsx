"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface Props {
  user: { name: string; email: string; image?: string | null };
  onMenuClick?: () => void;
}

export function AdminTopbar({ user, onMenuClick }: Props) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile: hamburger */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
          aria-label="باز کردن منو"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {/* Mobile logo */}
        <Link href="/admin" className="flex items-center gap-2 md:hidden">
          <span className="text-sm font-extrabold text-foreground">پنل مدیریت</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted sm:flex"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 1a6 6 0 100 12A6 6 0 007 1zM1 7h12M7 1c-1.5 1.5-2 3.5-2 6s.5 4.5 2 6M7 1c1.5 1.5 2 3.5 2 6s-.5 4.5-2 6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          مشاهده سایت
        </Link>

        {/* User menu */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5">
          <div className="relative h-7 w-7 overflow-hidden rounded-full bg-primary/10">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground">{user.name}</p>
            <p className="text-[10px] text-muted-foreground">مدیر سیستم</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
          title="خروج"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 3H3.5A1.5 1.5 0 002 4.5v7A1.5 1.5 0 003.5 13H6M10 11l3-3-3-3M6 8h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
