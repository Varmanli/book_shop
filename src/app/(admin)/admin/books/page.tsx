import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { findBooks } from "@/repositories/book.repository";
import { findAllCategories } from "@/repositories/category.repository";
import { AdminBooksClient } from "./books-client";

export const metadata: Metadata = { title: "مدیریت کتاب‌ها" };

type SearchParams = Promise<{ page?: string; search?: string; categoryId?: string }>;

async function BooksContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));

  const [{ items: bookList, meta }, categories] = await Promise.all([
    findBooks(
      {
        search: sp.search,
        categoryId: sp.categoryId,
      },
      { page, pageSize: 15 }
    ),
    findAllCategories(),
  ]);

  return (
    <AdminBooksClient
      books={bookList}
      meta={meta}
      categories={categories}
      currentPage={page}
      currentSearch={sp.search ?? ""}
      currentCategory={sp.categoryId ?? ""}
    />
  );
}

export default function AdminBooksPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 rounded-lg bg-muted" />
            <div className="h-10 w-28 rounded-xl bg-muted" />
          </div>
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      }
    >
      <BooksContent searchParams={searchParams} />
    </Suspense>
  );
}
