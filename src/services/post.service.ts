import { cacheTag } from "next/cache";
import * as postRepo from "@/repositories/post.repository";
import type { PaginationParams } from "@/types/api";
import type { CreatePostInput, UpdatePostInput } from "@/validations/post.schema";

export async function getPublishedPosts(pagination: PaginationParams = {}, filters: import("@/repositories/post.repository").PostFilters = {}) {
  "use cache";
  cacheTag("posts");
  return postRepo.findPublishedPosts(filters, pagination);
}

export async function getAllPosts(pagination: PaginationParams = {}) {
  "use cache";
  cacheTag("posts");
  return postRepo.findAllPosts(pagination);
}

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheTag("posts");
  return postRepo.findPostBySlug(slug);
}

export async function getPostById(id: string) {
  "use cache";
  cacheTag("posts");
  return postRepo.findPostById(id);
}

export async function getLatestPosts(limit?: number) {
  "use cache";
  cacheTag("posts");
  return postRepo.findLatestPosts(limit);
}

export async function createPost(authorId: string, data: CreatePostInput) {
  return postRepo.createPost(authorId, data);
}

export async function updatePost(id: string, data: UpdatePostInput) {
  const existing = await postRepo.findPostById(id);
  if (!existing) throw new Error("پست یافت نشد");
  return postRepo.updatePost(id, data);
}

export async function deletePost(id: string) {
  const existing = await postRepo.findPostById(id);
  if (!existing) throw new Error("پست یافت نشد");
  return postRepo.deletePost(id);
}
