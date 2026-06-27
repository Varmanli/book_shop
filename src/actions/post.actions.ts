"use server";

import { requireAdmin } from "@/lib/session";
import * as postService from "@/services/post.service";
import { createPostSchema, updatePostSchema } from "@/validations/post.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Post } from "@/types";

export async function createPostAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Post>> {
  const session = await requireAdmin();

  const parsed = createPostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const post = await postService.createPost(session.user.id, parsed.data);
    revalidateTag(CACHE_TAGS.posts, "max");
    return ok(post);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ایجاد پست");
  }
}

export async function updatePostAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Post>> {
  await requireAdmin();

  const parsed = updatePostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const post = await postService.updatePost(id, parsed.data);
    revalidateTag(CACHE_TAGS.posts, "max");
    if (post) revalidateTag(CACHE_TAGS.post(post.slug), "max");
    return ok(post);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ویرایش پست");
  }
}

export async function deletePostAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();
  try {
    const post = await postService.getPostById(id);
    await postService.deletePost(id);
    revalidateTag(CACHE_TAGS.posts, "max");
    if (post) revalidateTag(CACHE_TAGS.post(post.slug), "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف پست");
  }
}
