"use server";

import { requireAdmin } from "@/lib/session";
import * as categoryService from "@/services/category.service";
import { createCategorySchema, updateCategorySchema } from "@/validations/category.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Category } from "@/types";

export async function createCategoryAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Category>> {
  await requireAdmin();

  const parsed = createCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const category = await categoryService.createCategory(parsed.data);
    revalidateTag(CACHE_TAGS.categories, "max");
    return ok(category);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ایجاد دسته‌بندی");
  }
}

export async function updateCategoryAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Category>> {
  await requireAdmin();

  const parsed = updateCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const category = await categoryService.updateCategory(id, parsed.data);
    revalidateTag(CACHE_TAGS.categories, "max");
    return ok(category);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ویرایش دسته‌بندی");
  }
}

export async function deleteCategoryAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();

  try {
    await categoryService.deleteCategory(id);
    revalidateTag(CACHE_TAGS.categories, "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف دسته‌بندی");
  }
}
