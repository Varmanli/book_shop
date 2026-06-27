import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/config/site";
import { HeroSlider } from "@/components/home/hero-slider";
import { FeaturedBooks } from "@/components/home/featured-books";
import { CategoryGrid } from "@/components/home/category-grid";
import { GenreShowcase } from "@/components/home/genre-showcase";
import { LatestPosts } from "@/components/home/latest-posts";
import { FeaturesStrip } from "@/components/home/features-strip";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import { findActiveSlides } from "@/repositories/home-slides.repository";
import { findFeaturedBooks } from "@/repositories/book.repository";
import { findCategoriesWithCount } from "@/repositories/category.repository";
import { findGenresWithCount } from "@/repositories/genre.repository";
import { findBooksByGenre } from "@/repositories/book.repository";
import { findLatestPosts } from "@/repositories/post.repository";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";

export const metadata: Metadata = {
  title: `${siteConfig.name} | فروشگاه کتاب دست دوم`,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
  },
};

const SHOWCASE_GENRE_SLUGS = ["thriller", "romance", "history", "dystopia"];

async function HeroSection() {
  const slides = await findActiveSlides();
  return <HeroSlider slides={slides} />;
}

async function FeaturedSection() {
  const books = await findFeaturedBooks(6);
  return <FeaturedBooks books={books} />;
}

async function CategorySection() {
  const categories = await findCategoriesWithCount();
  return <CategoryGrid categories={categories} />;
}

async function GenreSection() {
  const genresWithCount = await findGenresWithCount();
  const showcaseGenres = genresWithCount.filter((g) =>
    SHOWCASE_GENRE_SLUGS.includes(g.slug)
  );
  const genreBooksResults = await Promise.all(
    showcaseGenres.map((g) => findBooksByGenre(g.id, 8))
  );
  const genresWithBooks = showcaseGenres
    .map((genre, i) => ({ ...genre, books: genreBooksResults[i] }))
    .filter((g) => g.books.length > 0)
    .sort(
      (a, b) =>
        SHOWCASE_GENRE_SLUGS.indexOf(a.slug) -
        SHOWCASE_GENRE_SLUGS.indexOf(b.slug)
    );
  return <GenreShowcase genres={genresWithBooks} />;
}

async function PostsSection() {
  const posts = await findLatestPosts(3);
  return <LatestPosts posts={posts} />;
}

function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return <div className={`${height} animate-pulse bg-muted/60`} />;
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b border-border bg-background/95" />}>
        <Header />
      </Suspense>

      <main className="flex-1 bg-background">
        <Suspense fallback={<SectionSkeleton height="h-[480px] sm:h-[540px] lg:h-[620px]" />}>
          <HeroSection />
        </Suspense>

        <FeaturesStrip />

        <Suspense fallback={<SectionSkeleton height="h-80" />}>
          <FeaturedSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-72" />}>
          <CategorySection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-96" />}>
          <GenreSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <PostsSection />
        </Suspense>

        <HomeNewsletter />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
