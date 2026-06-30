"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Bookmark,
  ShoppingCart,
  Ticket,
  Star,
  BarChart3,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Layers,
  ChevronLeft,
  ChevronDown,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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
  groupIcon: React.ReactNode;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "داشبورد",
    groupIcon: <LayoutDashboard size={16} />,
    items: [
      {
        href: "/admin",
        label: "خلاصه وضعیت",
        icon: <LayoutDashboard size={16} />,
        exact: true,
      },
    ],
  },
  {
    id: "catalog",
    label: "کاتالوگ",
    groupIcon: <BookOpen size={16} />,
    items: [
      { href: "/admin/books",      label: "کتاب‌ها",       icon: <BookOpen   size={16} /> },
      { href: "/admin/categories", label: "دسته‌بندی‌ها",  icon: <FolderOpen size={16} /> },
      { href: "/admin/genres",     label: "ژانرها",        icon: <Bookmark   size={16} /> },
    ],
  },
  {
    id: "store",
    label: "فروشگاه",
    groupIcon: <ShoppingCart size={16} />,
    items: [
      { href: "/admin/orders",  label: "سفارش‌ها",        icon: <ShoppingCart size={16} /> },
      { href: "/admin/coupons", label: "کدهای تخفیف",    icon: <Ticket       size={16} /> },
      { href: "/admin/reviews", label: "نظرات مشتریان",  icon: <Star         size={16} /> },
    ],
  },
  {
    id: "finance",
    label: "مالی",
    groupIcon: <BarChart3 size={16} />,
    items: [
      { href: "/admin/finance", label: "داشبورد مالی", icon: <BarChart3 size={16} /> },
    ],
  },
  {
    id: "marketing",
    label: "بازاریابی",
    groupIcon: <Mail size={16} />,
    items: [
      { href: "/admin/blog",       label: "بلاگ",    icon: <FileText      size={16} /> },
      { href: "/admin/newsletter", label: "خبرنامه", icon: <Mail          size={16} /> },
      { href: "/admin/contacts",   label: "پیام‌ها", icon: <MessageSquare size={16} /> },
    ],
  },
  {
    id: "content",
    label: "محتوای سایت",
    groupIcon: <Layers size={16} />,
    items: [
      { href: "/admin/site-content", label: "محتوای سایت", icon: <Layers size={16} /> },
    ],
  },
  {
    id: "settings",
    label: "تنظیمات",
    groupIcon: <Settings size={16} />,
    items: [
      { href: "/admin/settings", label: "تنظیمات سایت", icon: <Settings size={16} /> },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────── */

function useIsActive(pathname: string) {
  return (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };
}

/** Which group contains the currently active route? */
function activeGroupId(pathname: string): string | null {
  for (const g of GROUPS) {
    if (g.items.some((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)))) {
      return g.id;
    }
  }
  return null;
}

/* ─── SidebarContent (shared between desktop and mobile drawer) ── */

interface SidebarContentProps {
  collapsed: boolean;
  onLinkClick?: () => void;
}

function SidebarContent({ collapsed, onLinkClick }: SidebarContentProps) {
  const pathname = usePathname();
  const isActive = useIsActive(pathname);
  const currentGroupId = activeGroupId(pathname);

  // Default: open the active group; others start closed
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (currentGroupId) s.add(currentGroupId);
    return s;
  });

  // Re-open active group when pathname changes (navigation)
  useEffect(() => {
    if (currentGroupId) {
      setOpenGroups((prev) => new Set(prev).add(currentGroupId));
    }
  }, [currentGroupId]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
      {GROUPS.map((group) => {
        const isGroupOpen = openGroups.has(group.id);
        const isSingleItem = group.items.length === 1;

        if (collapsed) {
          // ── Icon-only mode: flat list, no headers, tooltip on hover ──
          return (
            <div key={group.id} className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    onClick={onLinkClick}
                    className={`group relative flex h-9 w-9 mx-auto items-center justify-center rounded-xl transition-all duration-150 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    {/* Tooltip */}
                    <span className="pointer-events-none absolute end-full me-3 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              <div className="h-px bg-border/50 mx-2 my-1" />
            </div>
          );
        }

        // ── Expanded mode ──
        if (isSingleItem) {
          const item = group.items[0];
          const active = isActive(item.href, item.exact);
          return (
            <div key={group.id}>
              <Link
                href={item.href}
                onClick={onLinkClick}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
                )}
              </Link>
            </div>
          );
        }

        return (
          <div key={group.id}>
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/70 transition hover:bg-muted/60 hover:text-foreground"
            >
              <span className="shrink-0 opacity-70">{group.groupIcon}</span>
              <span>{group.label}</span>
              <ChevronDown
                size={13}
                className={`ms-auto transition-transform duration-300 ${
                  isGroupOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {/* Collapsible items */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isGroupOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <ul className="ms-2 mt-0.5 space-y-0.5 border-s border-border/50 ps-3 pb-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onLinkClick}
                          className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                            active
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          }`}
                        >
                          {active && (
                            <span className="absolute -start-[13px] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                          )}
                          <span className="shrink-0">{item.icon}</span>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/* ─── AdminSidebar ───────────────────────────────────────────── */

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ mobileOpen, onClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on navigation
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden md:flex flex-col border-e border-border bg-card transition-all duration-300 ease-out ${
          collapsed ? "w-[68px]" : "w-[224px]"
        }`}
        style={{ minHeight: "100vh" }}
      >
        {/* Header */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-border px-3 ${
            collapsed ? "justify-center" : "gap-2.5"
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen size={16} />
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-extrabold text-foreground">
              پنل مدیریت
            </span>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "باز کردن منو" : "بستن منو"}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground ${
              collapsed ? "mx-auto" : "ms-auto"
            }`}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* ── Mobile drawer ── */}
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 end-0 z-50 flex w-72 flex-col border-s border-border bg-card shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <BookOpen size={16} />
          </div>
          <span className="text-sm font-extrabold text-foreground">پنل مدیریت</span>
          <button
            onClick={onClose}
            className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        <SidebarContent collapsed={false} onLinkClick={onClose} />
      </div>
    </>
  );
}
