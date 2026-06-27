"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "مدیریت محتوا",
    items: [
      {
        href: "/admin",
        label: "داشبورد",
        exact: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        href: "/admin/books",
        label: "کتاب‌ها",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect x="3" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <rect x="5" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 7h4M7 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: "/admin/categories",
        label: "دسته‌بندی‌ها",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M2 4.5A2.5 2.5 0 014.5 2h9A2.5 2.5 0 0116 4.5v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="8.5" width="14" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ),
      },
      {
        href: "/admin/genres",
        label: "ژانرها",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M5 2h8a1 1 0 011 1v12l-4-2-4 2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: "/admin/blog",
        label: "بلاگ",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 7h8M5 10h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "فروشگاه",
    items: [
      {
        href: "/admin/orders",
        label: "سفارش‌ها",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M2.5 3h1.8l2.4 7.5h6.4l1.6-5H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
            <circle cx="12.5" cy="14.5" r="1" fill="currentColor" />
          </svg>
        ),
      },
      {
        href: "/admin/reviews",
        label: "نظرات",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M9 2l1.8 3.6 4 .6-2.9 2.8.7 4L9 11.1l-3.6 1.9.7-4L3.2 6.2l4-.6L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "ارتباطات",
    items: [
      {
        href: "/admin/contacts",
        label: "پیام‌ها",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <rect x="2" y="3.5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 5.5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
      },
      {
        href: "/admin/newsletter",
        label: "خبرنامه",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 5.5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "",
    items: [
      {
        href: "/admin/settings",
        label: "تنظیمات",
        exact: false,
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M14.9 3.1l-1.4 1.4M4.5 13.5l-1.4 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-e border-border bg-card transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-border px-4 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <rect x="3" y="2" width="10" height="14" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
              <rect x="5" y="2" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          {!collapsed && (
            <span className="font-extrabold text-foreground">پنل مدیریت</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`ms-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted ${collapsed ? "mx-auto" : ""}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden style={{ transform: collapsed ? "rotate(180deg)" : "none" }}>
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {group.label && !collapsed && (
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-muted"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <span className={`shrink-0 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                          {item.icon}
                        </span>
                        {!collapsed && item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
    </>
  );
}
