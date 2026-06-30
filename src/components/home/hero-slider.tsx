"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HomeSlide } from "@/types";

interface Props {
  slides: HomeSlide[];
}

function HeroFallback() {
  return (
    <section
      className="relative overflow-hidden bg-linear-to-l from-primary via-primary/80 to-primary/60"
      aria-label="اسلایدر اصلی"
    >
      <div className="relative h-120 w-full sm:h-135 lg:h-155">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                به کتابخانه خوش آمدید
              </h1>
              <p className="mt-4 text-base font-medium text-white/85 drop-shadow sm:text-lg">
                بهترین کتاب‌های دست دوم با کیفیت و قیمت مناسب
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/books"
                  className="inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  مشاهده کتاب‌ها
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSlider({ slides }: Props) {
  const [autoplay] = useState(() => Autoplay({ delay: 5000, stopOnInteraction: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: "rtl" },
    [autoplay],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (slides.length === 0) return <HeroFallback />;

  return (
    <section className="relative overflow-hidden" aria-label="اسلایدر اصلی">
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%]">
              {/* Background image */}
              <div className="relative h-120 w-full sm:h-135 lg:h-155">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-l from-black/70 via-black/40 to-transparent" />
              </div>

              {/* Text content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto max-w-8xl px-2">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="mt-4 text-base font-medium text-white/85 drop-shadow sm:text-lg">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.ctaLink && slide.ctaText && (
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                          href={slide.ctaLink}
                          className="inline-flex items-center rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                          {slide.ctaText}
                        </Link>
                        <Link
                          href="/books"
                          className="inline-flex items-center rounded-xl border-2 border-white/60 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                        >
                          مشاهده همه کتاب‌ها
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`اسلاید ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
