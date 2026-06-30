"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "title_asc", label: "نام (الف تا ی)" },
];

export function BookSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const currentSort = searchParams.get("sort") ?? "createdAt_desc";

  const selectedOption =
    SORT_OPTIONS.find((option) => option.value === currentSort) ??
    SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "createdAt_desc") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    params.set("page", "1");

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);

    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative z-30 flex items-center gap-3">
      <span className="hidden text-xs font-bold text-muted-foreground sm:inline">
        مرتب‌سازی:
      </span>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-l from-primary/15 via-primary/5 to-transparent opacity-0 blur-xl transition-opacity duration-300 data-[open=true]:opacity-100" />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="مرتب‌سازی کتاب‌ها"
          className={[
            "relative flex h-12 min-w-48 items-center gap-3 overflow-hidden rounded-2xl",
            "border bg-card/95 px-2.5 shadow-sm backdrop-blur-sm",
            "ring-1 ring-black/2 transition-all duration-300",
            open
              ? "border-primary/35 shadow-lg shadow-primary/10 ring-4 ring-primary/10"
              : "border-border/70 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5",
          ].join(" ")}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <svg
              width="17"
              height="17"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 5h10M6 9h6M8 13h2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span className="min-w-0 flex-1 truncate text-right text-sm font-black text-foreground">
            {selectedOption.label}
          </span>

          <span
            className={[
              "grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground",
              "transition-all duration-300",
              open
                ? "rotate-180 bg-primary/10 text-primary"
                : "hover:text-primary",
            ].join(" ")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 5l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="گزینه‌های مرتب‌سازی"
            className={[
              "absolute left-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden",
              "rounded-2xl border border-border/70 bg-background/95 p-1.5",
              "shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl",
              "animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150",
            ].join(" ")}
          >
            {SORT_OPTIONS.map((option) => {
              const active = option.value === currentSort;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleChange(option.value)}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right",
                    "text-sm transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  <span className="font-bold">{option.label}</span>

                  <span
                    className={[
                      "grid h-6 w-6 place-items-center rounded-lg transition",
                      active
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : "text-transparent",
                    ].join(" ")}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3.5 8.2l2.8 2.8 6.2-6.5"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
