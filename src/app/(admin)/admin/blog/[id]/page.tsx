import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updatePostAction } from "@/actions/post.actions";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "ویرایش پست" };

type Params = Promise<{ id: string }>;

async function EditPostContent({ params }: { params: Params }) {
  const { id } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post) notFound();

  const boundAction = updatePostAction.bind(null, id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">ویرایش پست</h1>
        <p className="text-sm text-muted-foreground line-clamp-1">{post.title}</p>
      </div>
      <PostForm post={post} action={boundAction} />
    </div>
  );
}

export default function EditPostPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <EditPostContent params={params} />
    </Suspense>
  );
}
