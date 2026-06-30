"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deleteBookAction } from "@/actions/book.actions";
import type { PaginationMeta } from "@/types/api";

const QUALITY_MAP: Record<string, string> = {
  "Like New": "مثل نو",
  "Very Good": "خیلی خوب",
  Good: "خوب",
  Acceptable: "قابل قبول",
};

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  isSold: boolean;
  qualityGrade: string;
  images: string[];
  slug: string;
  isPublished: boolean;
  isFeatured: boolean;
  category?: { name: string } | null;
};

type Category = { id: string; name: string };

interface Props {
  books: Book[];
  meta: PaginationMeta;
  categories: Category[];
  currentPage: number;
  currentSearch: string;
  currentCategory: string;
}

export function AdminBooksClient({ books, meta, categories, currentPage, currentSearch, currentCategory }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);
  const [deleting, setDeleting] = useState<string | null>(null);

  function applyFilters(s = search, c = category) {
    const params = new URLSearchParams();
    if (s) params.set("search", s);
    if (c) params.set("categoryId", c);
    router.push(`/admin/books?${params.toString()}`);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`آیا از حذف کتاب "${title}" مطمئن هستید؟`)) return;
    setDeleting(id);
    const res = await deleteBookAction(id);
    setDeleting(null);
    if (res.success) {
      toast.success("کتاب حذف شد");
      router.refresh();
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">مدیریت کتاب‌ها</h1>
          <p className="text-sm text-muted-foreground">{meta.total.toLocaleString("fa-IR")} کتاب</p>
        </div>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          کتاب جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="جستجو در عنوان یا نویسنده..."
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); applyFilters(search, e.target.value); }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          onClick={() => applyFilters()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          جستجو
        </button>
        {(search || category) && (
          <button
            onClick={() => { setSearch(""); setCategory(""); router.push("/admin/books"); }}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            پاک کردن
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">کتاب</th>
                <th className="px-4 py-3 text-start font-medium">دسته‌بندی</th>
                <th className="px-4 py-3 text-start font-medium">قیمت</th>
                <th className="px-4 py-3 text-start font-medium">موجودی</th>
                <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    کتابی یافت نشد
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-muted">
                          {book.images?.[0] ? (
                            <Image src={book.images[0]} alt={book.title} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 text-xs">📚</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{book.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold">{book.price.toLocaleString("fa-IR")} ت</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${book.isSold ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {book.isSold ? "فروخته شده" : "موجود"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${book.isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                          {book.isPublished ? "منتشر شده" : "پیش‌نویس"}
                        </span>
                        {book.isFeatured && (
                          <span className="inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            ویژه
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/books/${book.id}`}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                        >
                          ویرایش
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          disabled={deleting === book.id}
                          className="rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                        >
                          {deleting === book.id ? "..." : "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {meta.hasPrevPage && (
            <Link href={`?page=${currentPage - 1}&search=${search}&categoryId=${category}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
              ‹ قبلی
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {currentPage.toLocaleString("fa-IR")} / {meta.totalPages.toLocaleString("fa-IR")}
          </span>
          {meta.hasNextPage && (
            <Link href={`?page=${currentPage + 1}&search=${search}&categoryId=${category}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
              بعدی ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
