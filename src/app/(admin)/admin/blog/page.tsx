import { Suspense } from "react";
import type { Metadata } from "next";
import { findPublishedPosts } from "@/repositories/post.repository";
import { BlogAdminClient } from "./blog-admin-client";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";

export const metadata: Metadata = { title: "مدیریت وبلاگ" };

async function BlogContent() {
  const allPosts = await db.query.posts.findMany({
    orderBy: desc(posts.createdAt),
    columns: {
      id: true,
      title: true,
      slug: true,
      status: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return <BlogAdminClient posts={allPosts} />;
}

export default function AdminBlogPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <BlogContent />
    </Suspense>
  );
}
