import type { Metadata } from "next";
import { createPostAction } from "@/actions/post.actions";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "پست جدید" };

export default function NewPostPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">پست جدید</h1>
        <p className="text-sm text-muted-foreground">یک پست جدید در وبلاگ ایجاد کنید</p>
      </div>
      <PostForm action={createPostAction} />
    </div>
  );
}
