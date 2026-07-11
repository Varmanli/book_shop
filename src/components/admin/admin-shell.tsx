"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import type { UserRole } from "@/lib/roles";

interface Props {
  user: { name: string; email: string; image?: string | null; role: UserRole };
  children: React.ReactNode;
}

/**
 * Thin client wrapper that owns the mobile-drawer open/close state and
 * passes it as props to AdminSidebar and AdminTopbar.  Keeps both those
 * components small and focused.
 */
export function AdminShell({ user, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5f4]" dir="rtl">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isOwner={user.role === "OWNER"}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
