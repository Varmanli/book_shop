"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/api";
import type { Post } from "@/types";
import { ImageUploader, type UploadedFile } from "@/components/ui/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

const POST_CATEGORIES = [
  "عمومی", "ادبیات", "داستان", "علمی", "تاریخی", "فلسفی", "معرفی کتاب", "نقد و بررسی",
];

interface Props {
  post?: Post | null;
  action: (prev: unknown, fd: FormData) => Promise<ApiResponse<Post>>;
}

type State = ApiResponse<Post> | { success: false; error: "" };

export function PostForm({ post, action }: Props) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(action, { success: false, error: "" } as State);
  const [coverImage, setCoverImage] = useState<UploadedFile | null>(
    post?.coverImage ? { url: post.coverImage } : null
  );
  const [content, setContent] = useState(post?.content ?? "");
  const [previewMode, setPreviewMode] = useState(false);
  const [slug, setSlug] = useState(post?.slug ?? "");

  useEffect(() => {
    if (state.success) {
      toast.success(post ? "پست ویرایش شد" : "پست ایجاد شد");
      router.push("/admin/blog");
      router.refresh();
    }
    if (!state.success && (state as { error?: string }).error) {
      toast.error((state as { error: string }).error);
    }
  }, [state]);

  const fe = (!state.success ? (state as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  function inputCls(err?: string) {
    return `w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${err ? "border-destructive focus:ring-destructive/20" : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"}`;
  }

  return (
    <form action={dispatch} className="grid gap-6 lg:grid-cols-3">
      {/* Hidden controlled values */}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="slug" value={slug} />

      {/* Main content */}
      <div className="space-y-5 lg:col-span-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">محتوای پست</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">
                عنوان <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                defaultValue={post?.title}
                className={inputCls(fe.title?.[0])}
                placeholder="عنوان مقاله را وارد کنید"
              />
              {fe.title && <p className="text-xs text-destructive">{fe.title[0]}</p>}
            </div>

            {/* Slug field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">اسلاگ</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="چرا-دوباره-باید-کتاب-کاغذی-بخوانیم"
                dir="ltr"
                className={inputCls(fe.slug?.[0])}
              />
              <p className="text-xs text-muted-foreground">
                اگر خالی بماند، اسلاگ به‌صورت خودکار از عنوان ساخته می‌شود.
              </p>
              {fe.slug && <p className="text-xs text-destructive">{fe.slug[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">
                خلاصه <span className="text-destructive">*</span>
              </label>
              <textarea
                name="excerpt"
                required
                rows={2}
                defaultValue={post?.excerpt}
                placeholder="خلاصه کوتاه مقاله (۲۰ تا ۳۰۰ کاراکتر)"
                className={`${inputCls(fe.excerpt?.[0])} resize-none`}
              />
              {fe.excerpt && <p className="text-xs text-destructive">{fe.excerpt[0]}</p>}
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">
                  محتوا <span className="text-destructive">*</span>
                </label>
                <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1 transition-colors ${!previewMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1 transition-colors ${previewMode ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    پیش‌نمایش
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div
                  className="min-h-[320px] rounded-2xl border border-border bg-background px-4 py-4"
                  dir="rtl"
                >
                  {content ? (
                    <div
                      className="prose prose-sm max-w-none rtl"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">محتوایی برای پیش‌نمایش وجود ندارد.</p>
                  )}
                </div>
              ) : (
                <RichTextEditor
                  value={post?.content}
                  onChange={setContent}
                  error={fe.content?.[0]}
                  minHeight={320}
                />
              )}

              {fe.content && !previewMode && (
                <p className="text-xs text-destructive">{fe.content[0]}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">تنظیمات انتشار</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">وضعیت</label>
              <select
                name="status"
                defaultValue={post?.status ?? "DRAFT"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشر شده</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">دسته‌بندی</label>
              <select
                name="category"
                defaultValue={post?.category ?? "عمومی"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
              >
                {POST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-foreground">تصویر شاخص</h2>
          <input type="hidden" name="coverImage" value={coverImage?.url ?? ""} />
          <ImageUploader
            context="blog"
            aspectRatio="banner"
            value={coverImage}
            onChange={setCoverImage}
            maxSizeMB={5}
          />
        </section>

        <div className="space-y-2">
          {!state.success && (state as { error?: string }).error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {(state as { error: string }).error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "در حال ذخیره..." : post ? "ذخیره تغییرات" : "انتشار پست"}
          </button>
          <a
            href="/admin/blog"
            className="block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
          >
            انصراف
          </a>
        </div>
      </div>
    </form>
  );
}
