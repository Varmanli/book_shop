"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

/* ─── Nav config ─────────────────────────────────────────────── */

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "خلاصه",
    items: [
      {
        href: "/account",
        label: "داشبورد",
        icon: <LayoutDashboard size={16} />,
        exact: true,
      },
    ],
  },
  {
    id: "shopping",
    label: "خریدها",
    items: [
      { href: "/account/orders",   label: "سفارش‌های من",   icon: <ShoppingBag size={16} /> },
      { href: "/account/wishlist",  label: "علاقه‌مندی‌ها",  icon: <Heart       size={16} /> },
    ],
  },
  {
    id: "account",
    label: "اطلاعات حساب",
    items: [
      { href: "/account/addresses", label: "آدرس‌های من", icon: <MapPin    size={16} /> },
      { href: "/account/settings",  label: "تنظیمات",     icon: <Settings  size={16} /> },
    ],
  },
];

/* ─── helpers ────────────────────────────────────────────────── */

function useIsActive(pathname: string) {
  return (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };
}

function activeGroupId(pathname: string): string | null {
  for (const g of GROUPS) {
    if (g.items.some((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))) {
      return g.id;
    }
  }
  return null;
}

/* ─── AccountSidebar ─────────────────────────────────────────── */

interface Props {
  user: { name: string; email: string; image?: string | null };
}

export function AccountSidebar({ user }: Props) {
  const pathname = usePathname();
  const isActive = useIsActive(pathname);
  const currentGroupId = activeGroupId(pathname);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const s = new Set<string>(["overview"]);
    if (currentGroupId) s.add(currentGroupId);
    return s;
  });

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <aside className="sticky top-24 w-[212px] shrink-0 self-start">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">

        {/* User profile */}
        <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-4 py-4">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/20">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-0.5 p-2">
          {GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id) || currentGroupId === group.id;
            const isSingle = group.items.length === 1;

            if (isSingle) {
              const item = group.items[0];
              const active = isActive(item.href, item.exact);
              return (
                <div key={group.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-foreground text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`shrink-0 ${active ? "text-white" : ""}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {active && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-white/60" />}
                  </Link>
                  <div className="my-1.5 h-px bg-border/50" />
                </div>
              );
            }

            return (
              <div key={group.id}>
                {/* Group toggle */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition hover:text-muted-foreground"
                >
                  {group.label}
                  <ChevronDown
                    size={11}
                    className={`ms-auto transition-transform duration-300 ${isOpen ? "rotate-0" : "-rotate-90"}`}
                  />
                </button>

                {/* Collapsible items */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="ms-1 space-y-0.5 border-s border-border/40 py-1 ps-2">
                      {group.items.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-all duration-150 ${
                                active
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {active && (
                                <span className="absolute -start-[9px] top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-foreground" />
                              )}
                              <span className={`shrink-0 ${active ? "text-foreground" : ""}`}>
                                {item.icon}
                              </span>
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="my-1.5 h-px bg-border/50" />
              </div>
            );
          })}

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/8"
          >
            <LogOut size={15} />
            خروج از حساب
          </button>
        </nav>
      </div>
    </aside>
  );
}
