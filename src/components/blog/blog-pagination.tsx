"use client";

import { useRouter } from "next/navigation";
import type { PaginationMeta } from "@/types/api";

interface Props {
  meta: PaginationMeta;
  searchParams: Record<string, string>;
}

export function BlogPagination({ meta, searchParams }: Props) {
  const router = useRouter();
  if (meta.totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const { page, totalPages } = meta;
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <button
        type="button"
        disabled={!meta.hasPrevPage}
        onClick={() => goTo(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="صفحه قبل"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm font-medium transition ${
              p === page
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/60 bg-card text-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {p.toLocaleString("fa-IR")}
          </button>
        )
      )}
      <button
        type="button"
        disabled={!meta.hasNextPage}
        onClick={() => goTo(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="صفحه بعد"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
