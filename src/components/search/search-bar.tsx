"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Tag, X, Loader2 } from "lucide-react";
import Image from "next/image";

/* ---------------- Types ---------------- */

interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  images: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SearchResponse {
  books: Book[];
  categories: Category[];
}

/* ---------------- Utils ---------------- */

function highlight(text: string, query: string) {
  if (!query) return text;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="bg-primary/15 text-primary rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

/* ---------------- Component ---------------- */

export function SearchBar({
  className = "",
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const items = [
    ...(data?.books || []).map((b) => ({ type: "book" as const, data: b })),
    ...(data?.categories || []).map((c) => ({
      type: "category" as const,
      data: c,
    })),
  ];

  /* ---------------- Search ---------------- */

  const fetchSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });

      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Input Effect ---------------- */

  useEffect(() => {
    if (!query.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchSearch(query.trim());
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSearch]);

  /* ---------------- Close on outside click ---------------- */

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- Navigation ---------------- */

  function go(path: string) {
    setOpen(false);
    setQuery("");
    onClose?.();
    router.push(path);
  }

  /* ---------------- Keyboard ---------------- */

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (e.key === "Escape") setOpen(false);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((v) => Math.min(v + 1, items.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((v) => Math.max(v - 1, -1));
    }

    if (e.key === "Enter" && active >= 0) {
      const item = items[active];

      if (!item) return;

      if (item.type === "book") {
        go(`/books/${item.data.slug}`);
      } else {
        go(`/books?category=${item.data.slug}`);
      }
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setActive(-1);
            if (!val.trim()) {
              setOpen(false);
              setData(null);
            } else {
              setOpen(true);
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="جستجوی کتاب، نویسنده..."
          className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pr-9 pl-3 text-sm shadow-sm transition-shadow outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/25 focus:shadow-md"
        />

        {loading && (
          <Loader2
            className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-primary"
            size={14}
          />
        )}

        {query && !loading && (
          <button
            onClick={() => {
              setQuery("");
              setData(null);
              setOpen(false);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full rounded-2xl border border-border bg-background/95 shadow-xl backdrop-blur-xl overflow-hidden">
          {/* loading */}
          {loading && !data && (
            <div className="p-3 text-sm text-muted-foreground">
              در حال جستجو...
            </div>
          )}

          {/* empty */}
          {data && data.books.length === 0 && data.categories.length === 0 && (
            <div className="p-5 text-center text-sm text-muted-foreground">
              نتیجه‌ای پیدا نشد
            </div>
          )}

          {/* results */}
          {data && (
            <div className="max-h-85 overflow-auto">
              {/* books */}
              {data.books.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <BookOpen size={12} /> کتاب‌ها
                  </div>

                  {data.books.map((b, i) => (
                    <button
                      key={b.id}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(`/books/${b.slug}`)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-right transition ${
                        active === i ? "bg-muted" : "hover:bg-muted/60"
                      }`}
                    >
                      <div className="h-10 w-8 bg-muted rounded overflow-hidden">
                        {b.images?.[0] && (
                          <Image
                            src={b.images[0]}
                            alt=""
                            width={32}
                            height={40}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {highlight(b.title, query)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {b.author}
                        </p>
                      </div>

                      <span className="text-xs text-primary font-semibold">
                        {b.price.toLocaleString()} ₺
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* categories */}
              {data.categories.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                    <Tag size={12} /> دسته‌بندی
                  </div>

                  {data.categories.map((c, i) => {
                    const index = data.books.length + i;

                    return (
                      <button
                        key={c.id}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(`/books?category=${c.slug}`)}
                        className={`w-full px-3 py-2 text-right transition ${
                          active === index ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        <p className="text-sm">{highlight(c.name, query)}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
