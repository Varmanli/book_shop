"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Settings } from "lucide-react";

const TABS = [
  { href: "/account",           label: "داشبورد",   icon: LayoutDashboard, exact: true  },
  { href: "/account/orders",    label: "سفارش‌ها",  icon: ShoppingBag,     exact: false },
  { href: "/account/wishlist",  label: "علاقه‌مندی", icon: Heart,           exact: false },
  { href: "/account/addresses", label: "آدرس‌ها",   icon: MapPin,          exact: false },
  { href: "/account/settings",  label: "تنظیمات",   icon: Settings,        exact: false },
];

export function AccountBottomTabs() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 block border-t border-border bg-card/98 backdrop-blur-md md:hidden">
      <ul className="flex items-stretch">
        {TABS.map((tab) => {
          const active = isActive(tab.href, tab.exact);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.75}
                  className={active ? "text-primary" : ""}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
