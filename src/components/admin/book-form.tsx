"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/api";
import {
  ImageUploader,
  type UploadedFile,
} from "@/components/ui/image-uploader";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";

// ─── Persian helpers ────────────────────────────────────────────────────────

function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

function normalizePersianDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

function formatToman(raw: string): string {
  const normalized = normalizePersianDigits(raw).replace(/\D/g, "");
  if (!normalized) return "";
  return toPersianDigits(Number(normalized).toLocaleString("en-US"));
}

// ─── Static option sets ─────────────────────────────────────────────────────

const QUALITY_OPTIONS = [
  { value: "Like New", label: "مثل نو" },
  { value: "Very Good", label: "خیلی خوب" },
  { value: "Good", label: "خوب" },
  { value: "Acceptable", label: "قابل قبول" },
];

const LANGUAGE_OPTIONS = [
  { value: "Persian", label: "فارسی" },
  { value: "Arabic", label: "عربی" },
  { value: "English", label: "انگلیسی" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Book = {
  id: string;
  title: string;
  author: string;
  translator?: string | null;
  publisher: string;
  isbn?: string | null;
  description?: string | null;
  categoryId: string;
  qualityGrade: string;
  isSold: boolean;
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <h2 className="mb-5 border-b border-border/60 pb-3 text-sm font-extrabold tracking-wide text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function TextInput({
  name,
  required,
  defaultValue,
  placeholder,
  type = "text",
  dir,
  error,
  autoFocus,
  inputMode,
}: {
  name: string;
  required?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  dir?: string;
  error?: boolean;
  autoFocus?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      type={type}
      name={name}
      required={required}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      dir={dir}
      autoFocus={autoFocus}
      inputMode={inputMode}
      className={cn(
        "h-11 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:ring-4",
        error
          ? "border-destructive/50 bg-destructive/5 focus:border-destructive/40 focus:ring-destructive/10"
          : "border-border/70 hover:border-primary/25 focus:border-primary/40 focus:ring-primary/10",
      )}
    />
  );
}

function PriceInput({
  name,
  defaultValue,
  error,
}: {
  name: string;
  defaultValue?: number | null;
  error?: string;
}) {
  const [raw, setRaw] = useState(defaultValue ? String(defaultValue) : "");
  const preview = raw ? `${formatToman(raw)} تومان` : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const normalized = normalizePersianDigits(e.target.value).replace(
      /\D/g,
      "",
    );
    setRaw(normalized);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={raw} />

      <div
        className={cn(
          "flex h-11 w-full items-center overflow-hidden rounded-2xl border bg-background transition focus-within:ring-4",
          error
            ? "border-destructive/50 bg-destructive/5 focus-within:border-destructive/40 focus-within:ring-destructive/10"
            : "border-border/70 hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-primary/10",
        )}
      >
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={raw ? toPersianDigits(raw) : ""}
          onChange={handleChange}
          placeholder="مثلاً ۲۵۰۰۰۰"
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-left text-sm outline-none"
        />

        <div className="flex h-full shrink-0 items-center border-s border-border/70 bg-muted/40 px-4 text-xs font-medium text-muted-foreground">
          تومان
        </div>
      </div>

      {preview ? (
        <p className="text-xs font-semibold text-primary">{preview}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          قیمت را به تومان وارد کنید
        </p>
      )}
    </div>
  );
}

// ─── Main form ───────────────────────────────────────────────────────────────

type ActionState = ApiResponse<Book> | { success: false; error: "" };

export function BookForm({
  book,
  categories,
  genres,
  selectedGenreIds = [],
  action,
  redirectTo = "/admin/books",
}: Props) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(
    action as (prev: ActionState, fd: FormData) => Promise<ActionState>,
    { success: false, error: "" },
  );

  const initialImages: (UploadedFile | null)[] = [0, 1, 2].map((i) => {
    const url = book?.images?.[i];
    return url ? { url } : null;
  });
  const [images, setImages] = useState<(UploadedFile | null)[]>(initialImages);

  const [categoryId, setCategoryId] = useState(book?.categoryId ?? "");
  const [qualityGrade, setQualityGrade] = useState(
    book?.qualityGrade ?? "Good",
  );
  const [language, setLanguage] = useState(book?.language ?? "Persian");

  useEffect(() => {
    if (state.success) {
      toast.success(book ? "کتاب ویرایش شد" : "کتاب ایجاد شد");
      router.push(redirectTo);
      router.refresh();
    }
    if (!state.success && (state as { error?: string }).error) {
      toast.error((state as { error: string }).error);
    }
  }, [state, book, redirectTo, router]);

  const fe =
    (!state.success
      ? (state as { fieldErrors?: Record<string, string[]> }).fieldErrors
      : undefined) ?? ({} as Record<string, string[]>);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const IMAGE_LABELS = [
    "تصویر اصلی",
    "تصویر دوم (اختیاری)",
    "تصویر سوم (اختیاری)",
  ];

  const formError =
    !state.success && (state as { error?: string }).error
      ? (state as { error: string }).error
      : null;

  const hasFieldErrors =
    !state.success &&
    (state as { fieldErrors?: Record<string, string[]> }).fieldErrors &&
    Object.keys(
      (state as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {},
    ).length > 0;

  return (
    <form action={dispatch} className="space-y-6 pb-28 lg:pb-0">
      {/* Form-level error banner */}
      {(formError || hasFieldErrors) && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {formError ||
            "امکان ثبت کتاب وجود ندارد. لطفاً خطاهای فرم را بررسی کنید."}
        </div>
      )}

      {/* Hidden controlled values */}
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="qualityGrade" value={qualityGrade} />
      <input type="hidden" name="language" value={language} />
      {images.map((img, i) => (
        <input key={i} type="hidden" name="images" value={img?.url ?? ""} />
      ))}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main column ── */}
        <div className="space-y-5 lg:col-span-2">
          <FormSection title="اطلاعات اصلی کتاب">
            <div className="space-y-4">
              <FormField label="عنوان کتاب" required error={fe.title?.[0]}>
                <TextInput
                  name="title"
                  required
                  defaultValue={book?.title}
                  placeholder="عنوان کتاب را وارد کنید"
                  error={!!fe.title?.[0]}
                  autoFocus
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="نویسنده" required error={fe.author?.[0]}>
                  <TextInput
                    name="author"
                    required
                    defaultValue={book?.author}
                    placeholder="نام نویسنده"
                    error={!!fe.author?.[0]}
                  />
                </FormField>
                <FormField label="مترجم" hint="در صورت وجود وارد کنید">
                  <TextInput
                    name="translator"
                    defaultValue={book?.translator}
                    placeholder="نام مترجم (اختیاری)"
                  />
                </FormField>
              </div>

              <FormField label="ناشر" required error={fe.publisher?.[0]}>
                <TextInput
                  name="publisher"
                  required
                  defaultValue={book?.publisher}
                  placeholder="نام ناشر"
                  error={!!fe.publisher?.[0]}
                />
              </FormField>

              <FormField
                label="توضیحات"
                error={fe.description?.[0]}
                hint={
                  !fe.description?.[0]
                    ? "توضیحات کتاب اختیاری است، اما می‌تواند به فروش بهتر کمک کند."
                    : undefined
                }
              >
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={book?.description ?? ""}
                  placeholder="توضیحاتی درباره کتاب بنویسید... (اختیاری)"
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-4",
                    fe.description
                      ? "border-destructive/50 bg-destructive/5 focus:border-destructive/40 focus:ring-destructive/10"
                      : "border-border/70 hover:border-primary/25 focus:border-primary/40 focus:ring-primary/10",
                  )}
                />
              </FormField>
            </div>
          </FormSection>{" "}
          <FormSection title="توضیحات و مشخصات">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="سال انتشار" hint="مثلاً ۱۴۰۰">
                <TextInput
                  name="publishedYear"
                  type="number"
                  defaultValue={book?.publishedYear}
                  placeholder="سال انتشار"
                  inputMode="numeric"
                />
              </FormField>
              <FormField label="تعداد صفحه">
                <TextInput
                  name="pageCount"
                  type="number"
                  defaultValue={book?.pageCount}
                  placeholder="تعداد صفحات"
                  inputMode="numeric"
                />
              </FormField>
              <FormField label="شابک (ISBN)" hint="اختیاری">
                <TextInput
                  name="isbn"
                  defaultValue={book?.isbn}
                  placeholder="978-..."
                  dir="ltr"
                />
              </FormField>
              <FormField label="زبان">
                <SearchableSelect
                  value={language}
                  onChange={setLanguage}
                  options={LANGUAGE_OPTIONS}
                  placeholder="زبان کتاب"
                  searchPlaceholder="جستجوی زبان..."
                  emptyText="زبانی یافت نشد"
                />
              </FormField>
            </div>
          </FormSection>
          <FormSection title="تصاویر کتاب">
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <ImageUploader
                  key={i}
                  label={IMAGE_LABELS[i]}
                  context="book"
                  aspectRatio="cover"
                  value={images[i]}
                  required={i === 0}
                  onChange={(file) => {
                    setImages((prev) => {
                      const next = [...prev];
                      next[i] = file;
                      return next;
                    });
                  }}
                />
              ))}
            </div>
            {fe.images && (
              <p className="mt-2 text-xs font-medium text-destructive">
                {fe.images[0]}
              </p>
            )}
          </FormSection>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <FormSection title="قیمت کتاب را وارد کنید.">
            <FormField label="قیمت" required error={fe.price?.[0]}>
              <PriceInput
                name="price"
                defaultValue={book?.price}
                error={fe.price?.[0]}
              />
            </FormField>
          </FormSection>

          <FormSection title="وضعیت کتاب">
            <FormField label="درجه کیفیت" required error={fe.qualityGrade?.[0]}>
              <SearchableSelect
                value={qualityGrade}
                onChange={setQualityGrade}
                options={QUALITY_OPTIONS}
                placeholder="درجه کیفیت"
                searchPlaceholder="جستجو..."
                emptyText="موردی یافت نشد"
                error={fe.qualityGrade?.[0]}
              />
            </FormField>

            <div className="mt-4 space-y-3">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition hover:bg-muted/30",
                  "has-checked:border-rose-300 has-checked:bg-rose-50",
                )}
              >
                <input
                  type="checkbox"
                  name="isSold"
                  value="true"
                  defaultChecked={book?.isSold ?? false}
                  className="h-4 w-4 accent-rose-500"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    فروخته شده
                  </p>
                  <p className="text-xs text-muted-foreground">
                    این نسخه دیگر موجود نیست
                  </p>
                </div>
              </label>
            </div>
          </FormSection>

          <FormSection title="دسته‌بندی">
            <FormField label="دسته‌بندی" required error={fe.categoryId?.[0]}>
              <SearchableSelect
                value={categoryId}
                onChange={setCategoryId}
                options={categoryOptions}
                placeholder="انتخاب دسته‌بندی"
                searchPlaceholder="جستجوی دسته‌بندی..."
                emptyText="دسته‌بندی یافت نشد"
                error={fe.categoryId?.[0]}
              />
            </FormField>
          </FormSection>

          <FormSection title="ژانرها">
            {genres.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                ژانری تعریف نشده است
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <label
                    key={genre.id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium transition hover:border-primary/40 hover:bg-primary/5 has-checked:border-primary/50 has-checked:bg-primary/10 has-checked:text-primary"
                  >
                    <input
                      type="checkbox"
                      name="genreIds"
                      value={genre.id}
                      defaultChecked={selectedGenreIds.includes(genre.id)}
                      className="sr-only"
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            )}
          </FormSection>

          <FormSection title="تنظیمات نمایش">
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3.5 hover:bg-muted/30 has-checked:border-primary/30 has-checked:bg-primary/5">
                <input
                  type="checkbox"
                  name="isPublished"
                  value="true"
                  defaultChecked={book?.isPublished ?? true}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    منتشر شده
                  </p>
                  <p className="text-xs text-muted-foreground">
                    در سایت نمایش داده می‌شود
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3.5 hover:bg-muted/30 has-checked:border-amber-300 has-checked:bg-amber-50">
                <input
                  type="checkbox"
                  name="isFeatured"
                  value="true"
                  defaultChecked={book?.isFeatured ?? false}
                  className="h-4 w-4 accent-amber-500"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    کتاب ویژه
                  </p>
                  <p className="text-xs text-muted-foreground">
                    در بخش ویژه‌ها نمایش یابد
                  </p>
                </div>
              </label>
            </div>
          </FormSection>

          {/* Submit – desktop */}
          <div className="hidden space-y-2 lg:block">
            <SubmitArea state={state} pending={pending} isEdit={!!book} />
          </div>
        </div>
      </div>

      {/* Submit – mobile sticky */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-sm lg:hidden">
        <SubmitArea state={state} pending={pending} isEdit={!!book} compact />
      </div>
    </form>
  );
}

function SubmitArea({
  state,
  pending,
  isEdit,
  compact,
}: {
  state: ActionState;
  pending: boolean;
  isEdit: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-2",
        compact && "flex items-center gap-3 space-y-0",
      )}
    >
      {!state.success && (state as { error?: string }).error && (
        <p
          className={cn(
            "rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive",
            compact && "hidden",
          )}
        >
          {(state as { error: string }).error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "rounded-2xl bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60",
          compact ? "flex-1 py-2.5" : "w-full py-3",
        )}
      >
        {pending ? "در حال ثبت کتاب..." : isEdit ? "ذخیره تغییرات" : "ثبت کتاب"}
      </button>
      {!compact && (
        <Link
          href="/admin/books"
          className="block w-full rounded-2xl border border-border py-2.5 text-center text-sm font-medium text-foreground hover:bg-muted"
        >
          انصراف
        </Link>
      )}
    </div>
  );
}
