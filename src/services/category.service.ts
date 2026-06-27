import { cacheTag } from "next/cache";
import * as categoryRepo from "@/repositories/category.repository";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/validations/category.schema";

export async function getAllCategories() {
  "use cache";
  cacheTag("categories");
  return categoryRepo.findAllCategories();
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheTag("categories");
  return categoryRepo.findCategoryBySlug(slug);
}

export async function createCategory(data: CreateCategoryInput) {
  return categoryRepo.createCategory(data);
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const existing = await categoryRepo.findCategoryById(id);
  if (!existing) throw new Error("دسته‌بندی یافت نشد");
  return categoryRepo.updateCategory(id, data);
}

export async function deleteCategory(id: string) {
  const existing = await categoryRepo.findCategoryById(id);
  if (!existing) throw new Error("دسته‌بندی یافت نشد");
  return categoryRepo.deleteCategory(id);
}
