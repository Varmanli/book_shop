"use server";

import { requireAdmin } from "@/lib/session";
import * as bookService from "@/services/book.service";
import { createBookSchema, updateBookSchema } from "@/validations/book.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Book } from "@/types";

export async function createBookAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Book>> {
  await requireAdmin();

  const raw = {
    title: formData.get("title"),
    author: formData.get("author"),
    translator: formData.get("translator") || null,
    publisher: formData.get("publisher"),
    isbn: formData.get("isbn") || null,
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    genreIds: formData.getAll("genreIds"),
    qualityGrade: formData.get("qualityGrade"),
    stock: formData.get("stock"),
    price: formData.get("price"),
    images: formData.getAll("images").filter(Boolean),
    publishedYear: formData.get("publishedYear") || null,
    pageCount: formData.get("pageCount") || null,
    language: formData.get("language") || "Persian",
    isFeatured: formData.get("isFeatured") === "true",
    isPublished: formData.get("isPublished") !== "false",
  };

  const parsed = createBookSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const book = await bookService.createBook(parsed.data);
    revalidateTag(CACHE_TAGS.books, "max");
    revalidateTag(CACHE_TAGS.booksList, "max");
    return ok(book);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ایجاد کتاب");
  }
}

export async function updateBookAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Book>> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateBookSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const book = await bookService.updateBook(id, parsed.data);
    revalidateTag(CACHE_TAGS.books, "max");
    revalidateTag(CACHE_TAGS.book(book.slug), "max");
    return ok(book);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ویرایش کتاب");
  }
}

export async function deleteBookAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();

  try {
    const book = await bookService.getBookById(id);
    await bookService.deleteBook(id);
    revalidateTag(CACHE_TAGS.books, "max");
    if (book) revalidateTag(CACHE_TAGS.book(book.slug), "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف کتاب");
  }
}
