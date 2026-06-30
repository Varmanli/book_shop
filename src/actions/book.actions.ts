"use server";

import { requireAdmin } from "@/lib/session";
import * as bookService from "@/services/book.service";
import { createBookSchema, updateBookSchema } from "@/validations/book.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Book } from "@/types";

function extractBookRaw(formData: FormData) {
  return {
    title: formData.get("title"),
    author: formData.get("author"),
    translator: formData.get("translator") || null,
    publisher: formData.get("publisher"),
    isbn: formData.get("isbn") || null,
    description: formData.get("description") || null,
    categoryId: formData.get("categoryId"),
    genreIds: formData.getAll("genreIds"),
    qualityGrade: formData.get("qualityGrade"),
    price: formData.get("price"),
    images: formData.getAll("images").filter(Boolean),
    publishedYear: formData.get("publishedYear") || null,
    pageCount: formData.get("pageCount") || null,
    language: formData.get("language") || "Persian",
    isFeatured: formData.get("isFeatured") === "true",
    isPublished: formData.get("isPublished") === "true",
    isSold: formData.get("isSold") === "true",
  };
}

function safeServerError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const msg = error.message.toLowerCase();
  // Never expose raw DB / Zod / technical messages to admins
  if (
    msg.includes("prisma") ||
    msg.includes("unique constraint") ||
    msg.includes("foreign key") ||
    msg.includes("database") ||
    msg.includes("zod") ||
    msg.includes("invalid") ||
    msg.includes("internal")
  ) {
    return fallback;
  }
  return fallback;
}

export async function createBookAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Book>> {
  await requireAdmin();

  const raw = extractBookRaw(formData);
  const parsed = createBookSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(
      "امکان ثبت کتاب وجود ندارد. لطفاً خطاهای فرم را بررسی کنید.",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const book = await bookService.createBook(parsed.data);
    revalidateTag(CACHE_TAGS.books, "max");
    revalidateTag(CACHE_TAGS.booksList, "max");
    return ok(book);
  } catch (error) {
    return fail(safeServerError(error, "ثبت کتاب با خطا مواجه شد. لطفاً دوباره تلاش کنید"));
  }
}

export async function updateBookAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Book>> {
  await requireAdmin();

  const raw = extractBookRaw(formData);
  const parsed = updateBookSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(
      "امکان ذخیره تغییرات وجود ندارد. لطفاً خطاهای فرم را بررسی کنید.",
      parsed.error.flatten().fieldErrors
    );
  }

  try {
    const book = await bookService.updateBook(id, parsed.data);
    revalidateTag(CACHE_TAGS.books, "max");
    revalidateTag(CACHE_TAGS.book(book.slug), "max");
    return ok(book);
  } catch (error) {
    return fail(safeServerError(error, "ذخیره تغییرات با خطا مواجه شد. لطفاً دوباره تلاش کنید"));
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
