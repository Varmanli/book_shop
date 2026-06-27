import { Suspense } from "react";
import type { Metadata } from "next";
import { findAllCategories } from "@/repositories/category.repository";
import { findAllGenres } from "@/repositories/genre.repository";
import { createBookAction } from "@/actions/book.actions";
import { BookForm } from "@/components/admin/book-form";

export const metadata: Metadata = { title: "افزودن کتاب جدید" };

async function NewBookContent() {
  const [categories, genres] = await Promise.all([
    findAllCategories(),
    findAllGenres(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">افزودن کتاب جدید</h1>
        <p className="text-sm text-muted-foreground">اطلاعات کتاب جدید را وارد کنید</p>
      </div>
      <BookForm categories={categories} genres={genres} action={createBookAction} />
    </div>
  );
}

export default function NewBookPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <NewBookContent />
    </Suspense>
  );
}
