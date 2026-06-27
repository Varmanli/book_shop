"use client";

import { useRef } from "react";
import { BookCard } from "./book-card";
import type { Book } from "@/types";

interface Props {
  books: (Book & { category?: { name: string } | null })[];
}

export function BookScroll({ books }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (books.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        کتابی برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scroll-smooth"
      style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
    >
      {books.map((book) => (
        <div key={book.id} className="w-40 shrink-0 sm:w-44 lg:w-48">
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
}
