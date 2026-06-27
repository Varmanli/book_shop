import { cacheTag } from "next/cache";
import * as bookRepo from "@/repositories/book.repository";
import type { BookFilters, BookSortField, SortOrder } from "@/types/domain";
import type { PaginationParams } from "@/types/api";
import type { CreateBookInput, UpdateBookInput } from "@/validations/book.schema";

export async function getBooks(
  filters: BookFilters = {},
  pagination: PaginationParams = {},
  sort: { field: BookSortField; order: SortOrder } = { field: "createdAt", order: "desc" }
) {
  "use cache";
  cacheTag("books");
  return bookRepo.findBooks(filters, pagination, sort);
}

export async function getBookBySlug(slug: string) {
  "use cache";
  cacheTag("books");
  const book = await bookRepo.findBookBySlug(slug);
  if (!book) return null;

  const related = await bookRepo.findRelatedBooks(book.id, book.categoryId);
  return { ...book, related };
}

export async function getBookById(id: string) {
  "use cache";
  cacheTag("books");
  return bookRepo.findBookById(id);
}

export async function getFeaturedBooks(limit?: number) {
  "use cache";
  cacheTag("books");
  return bookRepo.findFeaturedBooks(limit);
}

export async function getNewArrivals(limit?: number) {
  "use cache";
  cacheTag("books");
  return bookRepo.findNewArrivals(limit);
}

export async function getDashboardBookStats() {
  "use cache";
  cacheTag("books");
  const total = await bookRepo.countBooks();
  const featured = await bookRepo.findFeaturedBooks(100);
  return { total, featuredCount: featured.length };
}

export async function createBook(data: CreateBookInput) {
  return bookRepo.createBook(data);
}

export async function updateBook(id: string, data: UpdateBookInput) {
  const existing = await bookRepo.findBookById(id);
  if (!existing) throw new Error("کتاب یافت نشد");
  return bookRepo.updateBook(id, data);
}

export async function deleteBook(id: string) {
  const existing = await bookRepo.findBookById(id);
  if (!existing) throw new Error("کتاب یافت نشد");
  return bookRepo.deleteBook(id);
}
