"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/api";

const QUALITY_OPTIONS = [
  { value: "Like New", label: "مثل نو" },
  { value: "Very Good", label: "خیلی خوب" },
  { value: "Good", label: "خوب" },
  { value: "Acceptable", label: "قابل قبول" },
];

type Book = {
  id: string;
  title: string;
  author: string;
  translator?: string | null;
  publisher: string;
  isbn?: string | null;
  description: string;
  categoryId: string;
  qualityGrade: string;
  stock: number;
  price: number;
  images: string[];
  publishedYear?: number | null;
  pageCount?: number | null;
  language: string;
  isFeatured: boolean;
  isPublished: boolean;
};

type Category = { id: string; name: string };
type Genre = { id: string; name: string };

interface Props {
  book?: Book | null;
  categories: Category[];
  genres: Genre[];
  selectedGenreIds?: string[];
  action: (prev: unknown, fd: FormData) => Promise<ApiResponse<Book>>;
  redirectTo?: string;
}

function Field({
  label,
  name,
  required,
  defaultValue,
  error,
  placeholder,
  type = "text",
  dir,
  hint,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | number | null;
  error?: string;
  placeholder?: string;
  type?: string;
  dir?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        dir={dir}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
          error
            ? "border-destructive bg-destructive/5 focus:ring-destructive/20"
            : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
        }`}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

type ActionState = ApiResponse<Book> | { success: false; error: "" };

export function BookForm({ book, categories, genres, selectedGenreIds = [], action, redirectTo = "/admin/books" }: Props) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(action, { success: false as const, error: "" });

  useEffect(() => {
    if (state.success) {
      toast.success(book ? "کتاب ویرایش شد" : "کتاب ایجاد شد");
      router.push(redirectTo);
      router.refresh();
    }
    if (!state.success && (state as { error?: string }).error) {
      toast.error((state as { error: string }).error);
    }
  }, [state]);

  const fe = (!state.success ? (state as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  return (
    <form action={dispatch} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main fields */}
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">اطلاعات اصلی</h2>
            <div className="space-y-4">
              <Field label="عنوان کتاب" name="title" required defaultValue={book?.title} error={fe.title?.[0]} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="نویسنده" name="author" required defaultValue={book?.author} error={fe.author?.[0]} />
                <Field label="مترجم" name="translator" defaultValue={book?.translator} placeholder="اختیاری" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="ناشر" name="publisher" required defaultValue={book?.publisher} error={fe.publisher?.[0]} />
                <Field label="شابک (ISBN)" name="isbn" defaultValue={book?.isbn} placeholder="اختیاری" dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  توضیحات <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  defaultValue={book?.description}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 resize-none ${
                    fe.description ? "border-destructive focus:ring-destructive/20" : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
                  }`}
                />
                {fe.description && <p className="text-xs text-destructive">{fe.description[0]}</p>}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">جزئیات کتاب</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="سال انتشار" name="publishedYear" type="number" defaultValue={book?.publishedYear} />
              <Field label="تعداد صفحه" name="pageCount" type="number" defaultValue={book?.pageCount} />
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">زبان</label>
                <select
                  name="language"
                  defaultValue={book?.language ?? "Persian"}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none"
                >
                  <option value="Persian">فارسی</option>
                  <option value="Arabic">عربی</option>
                  <option value="English">انگلیسی</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  درجه کیفیت <span className="text-destructive">*</span>
                </label>
                <select
                  name="qualityGrade"
                  required
                  defaultValue={book?.qualityGrade ?? "Good"}
                  className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none ${fe.qualityGrade ? "border-destructive" : "border-border"}`}
                >
                  {QUALITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {fe.qualityGrade && <p className="text-xs text-destructive">{fe.qualityGrade[0]}</p>}
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">تصاویر کتاب</h2>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">
                    تصویر {i + 1} {i === 0 ? "(اصلی)" : "(اختیاری)"}
                  </label>
                  <input
                    type="url"
                    name="images"
                    defaultValue={book?.images?.[i] ?? ""}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">قیمت و موجودی</h2>
            <div className="space-y-4">
              <Field
                label="قیمت (تومان)"
                name="price"
                type="number"
                required
                defaultValue={book?.price}
                error={fe.price?.[0]}
                dir="ltr"
              />
              <Field
                label="موجودی (عدد)"
                name="stock"
                type="number"
                required
                defaultValue={book?.stock ?? 0}
                error={fe.stock?.[0]}
                dir="ltr"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">دسته‌بندی</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">
                دسته‌بندی <span className="text-destructive">*</span>
              </label>
              <select
                name="categoryId"
                required
                defaultValue={book?.categoryId ?? ""}
                className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none ${fe.categoryId ? "border-destructive" : "border-border"}`}
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {fe.categoryId && <p className="text-xs text-destructive">{fe.categoryId[0]}</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">ژانرها</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <label key={genre.id} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="genreIds"
                    value={genre.id}
                    defaultChecked={selectedGenreIds.includes(genre.id)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  <span className="text-xs text-foreground">{genre.name}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-foreground">انتشار</h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/30 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
                <input
                  type="checkbox"
                  name="isPublished"
                  value="true"
                  defaultChecked={book?.isPublished ?? true}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">منتشر شده</p>
                  <p className="text-xs text-muted-foreground">کتاب در سایت نمایش داده می‌شود</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/30 has-[:checked]:border-amber-300 has-[:checked]:bg-amber-50">
                <input
                  type="checkbox"
                  name="isFeatured"
                  value="true"
                  defaultChecked={book?.isFeatured ?? false}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">کتاب ویژه</p>
                  <p className="text-xs text-muted-foreground">در بخش کتاب‌های ویژه نمایش یابد</p>
                </div>
              </label>
            </div>
          </section>

          {/* Submit */}
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
              {pending ? "در حال ذخیره..." : book ? "ذخیره تغییرات" : "افزودن کتاب"}
            </button>
            <a
              href="/admin/books"
              className="block w-full rounded-xl border border-border py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
            >
              انصراف
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
