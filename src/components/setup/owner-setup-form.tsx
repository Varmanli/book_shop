"use client";

import { useState } from "react";
import { assignInitialOwnerAction } from "@/actions/role.actions";
import type { RoleUser } from "@/services/role.service";

interface Props {
  users: RoleUser[];
}

export function OwnerSetupForm({ users }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const selected = users.find((user) => user.id === selectedId);

  return (
    <form action={assignInitialOwnerAction} className="space-y-5 rounded-2xl border border-amber-300 bg-amber-50/50 p-5 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">انتخاب کاربر</label>
        <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-2">
          {users.map((user) => (
            <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted">
              <input
                type="radio"
                name="userId"
                value={user.id}
                checked={selectedId === user.id}
                onChange={() => setSelectedId(user.id)}
                required
              />
              <span className="min-w-0">
                <span className="block font-medium">{user.name || "بدون نام"}</span>
                <span className="block truncate text-sm text-muted-foreground" dir="ltr">{user.email}</span>
              </span>
              <span className="ms-auto rounded-full bg-muted px-2 py-0.5 text-xs">{user.role}</span>
            </label>
          ))}
        </div>
      </div>

      {selected && (
        <div className="space-y-2">
          <label htmlFor="confirmationEmail" className="text-sm font-semibold text-foreground">
            برای تأیید، ایمیل «{selected.email}» را وارد کنید
          </label>
          <input
            id="confirmationEmail"
            name="confirmationEmail"
            type="email"
            required
            dir="ltr"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!selected}
        className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        انتخاب به‌عنوان مالک سیستم
      </button>
    </form>
  );
}
