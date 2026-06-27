import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findBookById } from "@/repositories/book.repository";
import { findAllCategories } from "@/repositories/category.repository";
import { findAllGenres } from "@/repositories/genre.repository";
import { updateBookAction } from "@/actions/book.actions";
import { BookForm } from "@/components/admin/book-form";
import { db } from "@/db";
import { bookGenres } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "ویرایش کتاب" };

type Params = Promise<{ id: string }>;

async function EditBookContent({ params }: { params: Params }) {
  const { id } = await params;

  const [book, categories, genres, genreRows] = await Promise.all([
    findBookById(id),
    findAllCategories(),
    findAllGenres(),
    db.query.bookGenres.findMany({
      where: eq(bookGenres.bookId, id),
      columns: { genreId: true },
    }),
  ]);

  if (!book) notFound();

  const selectedGenreIds = genreRows.map((r) => r.genreId);
  const boundAction = updateBookAction.bind(null, id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">ویرایش کتاب</h1>
        <p className="text-sm text-muted-foreground">{book.title}</p>
      </div>
      <BookForm
        book={book}
        categories={categories}
        genres={genres}
        selectedGenreIds={selectedGenreIds}
        action={boundAction}
      />
    </div>
  );
}

export default function EditBookPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <EditBookContent params={params} />
    </Suspense>
  );
}
