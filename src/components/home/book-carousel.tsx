"use client";

import useEmblaCarousel from "embla-carousel-react";
import { BookCard } from "./book-card";
import type { Book } from "@/types";

interface Props {
  books: (Book & { category?: { name: string } | null })[];
}

export function BookCarousel({ books }: Props) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    direction: "rtl",
    align: "start",
    dragFree: false,
  });

  if (books.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        کتابی برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex gap-3 sm:gap-4">
        {books.map((book) => (
          <div key={book.id} className="w-40 shrink-0 sm:w-44 lg:w-48">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
}
