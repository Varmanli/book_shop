"use server";

import { requireAdmin } from "@/lib/session";
import * as postService from "@/services/post.service";
import { createPostSchema, updatePostSchema } from "@/validations/post.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Post } from "@/types";

function extractPostRaw(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug") || undefined, // empty string → undefined so repo auto-generates
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImage: formData.get("coverImage") || null,
    status: formData.get("status"),
    category: formData.get("category"),
  };
}

function safePostError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const msg = error.message.toLowerCase();
  if (
    msg.includes("prisma") ||
    msg.includes("unique constraint") ||
    msg.includes("database") ||
    msg.includes("zod") ||
    msg.includes("internal")
  ) {
    return fallback;
  }
  return fallback;
}

export async function createPostAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Post>> {
  const session = await requireAdmin();

  const raw = extractPostRaw(formData);
  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("ثبت مقاله با خطا مواجه شد. لطفاً خطاهای فرم را بررسی کنید.", parsed.error.flatten().fieldErrors);
  }

  try {
    const post = await postService.createPost(session.user.id, parsed.data);
    revalidateTag(CACHE_TAGS.posts, "max");
    return ok(post);
  } catch (error) {
    return fail(safePostError(error, "ثبت مقاله با خطا مواجه شد. لطفاً دوباره تلاش کنید."));
  }
}

export async function updatePostAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Post>> {
  await requireAdmin();

  const raw = extractPostRaw(formData);
  const parsed = updatePostSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("ویرایش مقاله با خطا مواجه شد. لطفاً خطاهای فرم را بررسی کنید.", parsed.error.flatten().fieldErrors);
  }

  try {
    const post = await postService.updatePost(id, parsed.data);
    revalidateTag(CACHE_TAGS.posts, "max");
    if (post) revalidateTag(CACHE_TAGS.post(post.slug), "max");
    return ok(post);
  } catch (error) {
    return fail(safePostError(error, "ویرایش مقاله با خطا مواجه شد. لطفاً دوباره تلاش کنید."));
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
  } catch {
    return fail("حذف مقاله با خطا مواجه شد.");
  }
}
