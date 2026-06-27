"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NewsletterSubscriber } from "@/types";

interface Props {
  subscribers: NewsletterSubscriber[];
}

export function NewsletterTable({ subscribers }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = subscribers.filter((s) => {
    const matchesSearch = s.email
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && s.isActive) ||
      (filter === "inactive" && !s.isActive);
    return matchesSearch && matchesFilter;
  });

  function exportCsv() {
    const rows = [
      ["ایمیل", "تاریخ عضویت", "وضعیت"],
      ...filtered.map((s) => [
        s.email,
        new Intl.DateTimeFormat("fa-IR").format(new Date(s.subscribedAt)),
        s.isActive ? "فعال" : "لغو شده",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="جستجو در ایمیل‌ها..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          dir="ltr"
        />

        <div className="flex overflow-hidden rounded-xl border border-border">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-muted"
              )}
            >
              {f === "all" ? "همه" : f === "active" ? "فعال" : "لغو شده"}
            </button>
          ))}
        </div>

        <button
          onClick={exportCsv}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          خروجی CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  ایمیل
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  تاریخ عضویت
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  تاریخ لغو
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    نتیجه‌ای یافت نشد
                  </td>
                </tr>
              ) : (
                filtered.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-mono text-foreground" dir="ltr">
                      {subscriber.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Intl.DateTimeFormat("fa-IR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(subscriber.subscribedAt))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          subscriber.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}
                      >
                        {subscriber.isActive ? "فعال" : "لغو شده"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {subscriber.unsubscribedAt
                        ? new Intl.DateTimeFormat("fa-IR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(subscriber.unsubscribedAt))
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            نمایش {filtered.length} از {subscribers.length} مشترک
          </div>
        )}
      </div>
    </div>
  );
}
