"use client";

import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Props {
  currentSearch: string;
  currentCategory: string;
  categories: string[];
}

export function BlogSearch({ currentSearch, currentCategory, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const update = (params: Record<string, string>) => {
    const url = new URLSearchParams();
    const merged = { search: currentSearch, category: currentCategory, ...params };
    if (merged.search) url.set("search", merged.search);
    if (merged.category) url.set("category", merged.category);
    url.set("page", "1");
    const qs = url.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSearch = (val: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update({ search: val }), 350);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <input
          type="text"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="جستجو در مطالب..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pe-10 ps-4 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update({ category: "" })}
            className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              !currentCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            همه
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => update({ category: currentCategory === cat ? "" : cat })}
              className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                currentCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
