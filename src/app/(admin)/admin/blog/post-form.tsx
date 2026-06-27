"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/api";
import type { Post } from "@/types";

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
              />
              {fe.title && <p className="text-xs text-destructive">{fe.title[0]}</p>}
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
                placeholder="خلاصه کوتاه پست (۲۰ تا ۳۰۰ کاراکتر)"
                className={`${inputCls(fe.excerpt?.[0])} resize-none`}
              />
              {fe.excerpt && <p className="text-xs text-destructive">{fe.excerpt[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">
                محتوا <span className="text-destructive">*</span>
              </label>
              <textarea
                name="content"
                required
                rows={12}
                defaultValue={post?.content}
                placeholder="محتوای کامل پست..."
                className={`${inputCls(fe.content?.[0])} resize-y font-mono`}
              />
              {fe.content && <p className="text-xs text-destructive">{fe.content[0]}</p>}
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
          <div className="space-y-1.5">
            <input
              type="url"
              name="coverImage"
              defaultValue={post?.coverImage ?? ""}
              placeholder="https://..."
              dir="ltr"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none"
            />
          </div>
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
