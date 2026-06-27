"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  additionalImages?: string[];
  priority?: boolean;
}

export function LightboxImage({ src, alt, additionalImages = [], priority }: Props) {
  const allImages = [src, ...additionalImages.filter(Boolean)];
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-muted shadow-lg"
          aria-label="بزرگ‌نمایی تصویر"
        >
          <Image
            src={allImages[selected]}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width:768px) 100vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M7.5 1.5h3v3M4.5 10.5h-3v-3M10.5 7.5v3h-3M1.5 4.5v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              بزرگ‌نمایی
            </span>
          </div>
        </button>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition focus:outline-none ${
                  i === selected
                    ? "border-primary shadow-sm"
                    : "border-border opacity-70 hover:opacity-100 hover:border-primary/40"
                }`}
                aria-label={`تصویر ${i + 1}`}
              >
                <Image src={img} alt={`تصویر ${i + 1}`} fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="بستن"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Prev / Next arrows for multiple images */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelected((s) => (s - 1 + allImages.length) % allImages.length); }}
                className="absolute start-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="قبلی"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M11 4l-6 5 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelected((s) => (s + 1) % allImages.length); }}
                className="absolute end-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="بعدی"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M7 4l6 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative mx-4 max-h-[90vh] max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[selected]}
              alt={alt}
              width={400}
              height={560}
              className="h-auto w-full rounded-2xl object-contain shadow-2xl"
              style={{ maxHeight: "90vh" }}
            />
          </div>

          {allImages.length > 1 && (
            <p className="absolute bottom-4 text-sm text-white/60">
              {(selected + 1).toLocaleString("fa-IR")} / {allImages.length.toLocaleString("fa-IR")}
            </p>
          )}
        </div>
      )}
    </>
  );
}
