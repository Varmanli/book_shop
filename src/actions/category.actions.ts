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

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || null,
    image: formData.get("image") || null,
  };
  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return fail("ثبت دسته‌بندی با خطا مواجه شد. لطفاً خطاهای فرم را بررسی کنید.", parsed.error.flatten().fieldErrors);
  }

  try {
    const category = await categoryService.createCategory(parsed.data);
    revalidateTag(CACHE_TAGS.categories, "max");
    return ok(category);
  } catch {
    return fail("ثبت دسته‌بندی با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
  }
}

export async function updateCategoryAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Category>> {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || null,
    image: formData.get("image") || null,
  };
  const parsed = updateCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return fail("ویرایش دسته‌بندی با خطا مواجه شد. لطفاً خطاهای فرم را بررسی کنید.", parsed.error.flatten().fieldErrors);
  }

  try {
    const category = await categoryService.updateCategory(id, parsed.data);
    revalidateTag(CACHE_TAGS.categories, "max");
    return ok(category);
  } catch {
    return fail("ویرایش دسته‌بندی با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
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
