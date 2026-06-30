"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function BookSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get("search") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const push = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleChange = (val: string) => {
    setValue(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(val), 350);
  };

  const handleClear = () => {
    setValue("");
    push("");
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="جستجوی کتاب، نویسنده..."
        dir="rtl"
        className={`w-full rounded-2xl border border-border bg-card py-3.5 ps-12 text-sm shadow-sm transition placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-base ${value ? "pe-10" : "pe-5"}`}
      />
      {/* Search icon — right side in RTL (start) */}
      <span className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 12l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      {/* Clear button — left side in RTL (end) */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="پاک کردن جستجو"
          className="absolute inset-e-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
