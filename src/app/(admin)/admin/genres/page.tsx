import { Suspense } from "react";
import type { Metadata } from "next";
import { findGenresWithCount } from "@/repositories/genre.repository";
import { GenresClient } from "./genres-client";

export const metadata: Metadata = { title: "مدیریت ژانرها" };

async function GenresContent() {
  const genres = await findGenresWithCount();
  return <GenresClient genres={genres} />;
}

export default function AdminGenresPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <GenresContent />
    </Suspense>
  );
}
