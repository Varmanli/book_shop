"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types";
import { updateContactStatusAction, deleteContactMessageAction } from "@/actions/contact.actions";

const STATUS_LABELS: Record<ContactMessage["status"], string> = {
  UNREAD: "خوانده نشده",
  READ: "خوانده شده",
  REPLIED: "پاسخ داده شده",
  ARCHIVED: "آرشیو شده",
};

const STATUS_COLORS: Record<ContactMessage["status"], string> = {
  UNREAD: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  READ: "bg-muted text-muted-foreground",
  REPLIED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ARCHIVED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface Props {
  messages: ContactMessage[];
}

export function ContactMessagesTable({ messages }: Props) {
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: ContactMessage["status"]) {
    setLoading(id);
    const fd = new FormData();
    fd.set("status", status);
    await updateContactStatusAction(id, null, fd);
    setLoading(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("آیا مطمئن هستید؟ این پیام حذف خواهد شد.")) return;
    setLoading(id);
    await deleteContactMessageAction(id);
    setLoading(null);
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* List */}
      <div className="lg:col-span-2 space-y-2">
        {messages.map((msg) => (
          <button
            key={msg.id}
            onClick={() => setSelected(msg)}
            className={cn(
              "w-full rounded-xl border p-4 text-right transition-colors",
              selected?.id === msg.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50",
              msg.status === "UNREAD" && "font-semibold"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{msg.name}</p>
                <p className="truncate text-xs text-muted-foreground">{msg.email}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{msg.subject}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  STATUS_COLORS[msg.status]
                )}
              >
                {STATUS_LABELS[msg.status]}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {new Intl.DateTimeFormat("fa-IR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }).format(new Date(msg.createdAt))}
            </p>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {selected ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selected.subject}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  از: {selected.name} &lt;{selected.email}&gt;
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("fa-IR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  }).format(new Date(selected.createdAt))}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  STATUS_COLORS[selected.status]
                )}
              >
                {STATUS_LABELS[selected.status]}
              </span>
            </div>

            <div className="mb-6 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {selected.message}
            </div>

            {selected.adminNote && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  یادداشت داخلی
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {selected.adminNote}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(["READ", "REPLIED", "ARCHIVED"] as const).map((s) => (
                <button
                  key={s}
                  disabled={selected.status === s || loading === selected.id}
                  onClick={() => handleStatusChange(selected.id, s)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    selected.status === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <button
                disabled={loading === selected.id}
                onClick={() => handleDelete(selected.id)}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 mr-auto"
              >
                حذف پیام
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="text-4xl">👆</div>
            <p className="text-sm text-muted-foreground">یک پیام را انتخاب کنید</p>
          </div>
        )}
      </div>
    </div>
  );
}
