"use server";

import { requireAdmin } from "@/lib/session";
import * as genreRepo from "@/repositories/genre.repository";
import { createGenreSchema, updateGenreSchema } from "@/validations/genre.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Genre } from "@/types";

export async function createGenreAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Genre>> {
  await requireAdmin();

  const parsed = createGenreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const genre = await genreRepo.createGenre(parsed.data);
    revalidateTag(CACHE_TAGS.genres, "max");
    return ok(genre);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ایجاد ژانر");
  }
}

export async function updateGenreAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Genre>> {
  await requireAdmin();

  const parsed = updateGenreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const genre = await genreRepo.updateGenre(id, parsed.data);
    revalidateTag(CACHE_TAGS.genres, "max");
    return ok(genre);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ویرایش ژانر");
  }
}

export async function deleteGenreAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();
  try {
    await genreRepo.deleteGenre(id);
    revalidateTag(CACHE_TAGS.genres, "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف ژانر");
  }
}
