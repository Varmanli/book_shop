"use client";

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  keywords?: string[];
  badge?: string;
};

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
  className?: string;
  triggerRef?: (node: HTMLButtonElement | null) => void;
}

function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/[آأإ]/g, "ا")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .trim();
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) return <>{text}</>;

  const normalizedText = normalizeForSearch(text);
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) return <>{text}</>;

  const end = index + normalizedQuery.length;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-primary/15 px-0.5 text-primary">{text.slice(index, end)}</mark>
      {text.slice(end)}
    </>
  );
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  error,
  loading,
  className,
  triggerRef,
}: SearchableSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeForSearch(deferredQuery);

    if (!normalizedQuery) return options;

    return options.filter((option) => {
      const haystack = [
        option.label,
        option.value,
        ...(option.keywords ?? []),
      ]
        .map(normalizeForSearch)
        .join(" ");

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, options]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resolvedActiveIndex =
    activeIndex >= 0 && activeIndex < filteredOptions.length ? activeIndex : 0;

  function closeSelect() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function openSelect() {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(0);
  }

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    closeSelect();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openSelect();
      return;
    }

    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(filteredOptions.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + Math.max(filteredOptions.length, 1)) % Math.max(filteredOptions.length, 1));
      return;
    }

    if (event.key === "Enter" && filteredOptions[resolvedActiveIndex]) {
      event.preventDefault();
      handleSelect(filteredOptions[resolvedActiveIndex].value);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSelect();
    }
  }

  const panel = (
    <div
      className={cn(
        "z-40 overflow-hidden rounded-2xl border border-border/70 bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200",
        "sm:absolute sm:start-0 sm:top-[calc(100%+12px)] sm:w-full",
        "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-b-none max-sm:rounded-t-[28px]"
      )}
      role="listbox"
      aria-labelledby={id}
    >
      <div className="border-b border-border/70 bg-gradient-to-b from-background to-muted/40 px-4 pb-4 pt-4 sm:px-3 sm:pt-3">
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <span className="text-sm font-bold text-foreground">انتخاب گزینه</span>
          <button
            type="button"
            onClick={closeSelect}
            className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
          >
            بستن
          </button>
        </div>
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="h-12 w-full rounded-2xl border border-border/70 bg-background pe-10 ps-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto p-2 sm:max-h-64">
        {loading ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">در حال دریافت گزینه‌ها...</div>
        ) : filteredOptions.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          filteredOptions.map((option, index) => {
            const active = index === resolvedActiveIndex;
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-right transition",
                  active || selected
                    ? "bg-primary/8 text-foreground"
                    : "text-foreground hover:bg-muted/70"
                )}
              >
                <span className="text-sm font-medium">
                  <HighlightedText text={option.label} query={deferredQuery} />
                </span>
                <span className="flex items-center gap-2">
                  {option.badge ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      {option.badge}
                    </span>
                  ) : null}
                  {selected ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary" aria-hidden>
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {open ? (
        <button
          type="button"
          onClick={closeSelect}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] sm:hidden"
          aria-label="بستن لیست"
        />
      ) : null}

      <button
        id={id}
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => {
          if (open) {
            closeSelect();
            return;
          }

          openSelect();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-2xl border bg-background px-4 text-sm transition outline-none",
          error
            ? "border-destructive/40 bg-destructive/5 focus:ring-4 focus:ring-destructive/10"
            : "border-border/70 hover:border-primary/25 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
          disabled && "cursor-not-allowed bg-muted/50 text-muted-foreground",
          open && !error && "border-primary/40 ring-4 ring-primary/10"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn(selectedOption ? "text-foreground" : "text-muted-foreground")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className={cn("shrink-0 text-muted-foreground transition", open && "rotate-180")}
          aria-hidden
        >
          <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? panel : null}
    </div>
  );
}
