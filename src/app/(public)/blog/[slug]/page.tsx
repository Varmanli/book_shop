import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import * as postService from "@/services/post.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug);
  if (!post) return { title: "پست یافت نشد" };
  return { title: post.title, description: post.excerpt ?? undefined };
}

async function BlogPostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">{post.title}</h1>
    </main>
  );
}

export default function BlogPostPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 animate-pulse">
          <div className="h-8 w-64 rounded bg-muted" />
        </div>
      }
    >
      <BlogPostContent params={params} />
    </Suspense>
  );
}
