"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/category.actions";
import {
  ImageUploader,
  type UploadedFile,
} from "@/components/ui/image-uploader";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  bookCount: number;
};

interface Props {
  categories: Category[];
}

type ModalMode = "add" | "edit" | null;
type ActionState = { success: false; error: string; fieldErrors?: Record<string, string[]> };

function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!category;
  const [image, setImage] = useState<UploadedFile | null>(
    category?.image ? { url: category.image } : null
  );

  const [state, dispatch, pending] = useActionState(
    isEdit
      ? (prev: unknown, fd: FormData) => updateCategoryAction(category!.id, prev, fd)
      : (prev: unknown, fd: FormData) => createCategoryAction(prev, fd),
    { success: false, error: "" }
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const fe = (!state.success ? (state as ActionState).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  return (
    <form action={dispatch} className="space-y-4">
      {/* Hidden image value */}
      <input type="hidden" name="image" value={image?.url ?? ""} />

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground">
          نام دسته‌بندی <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={category?.name}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${fe.name ? "border-destructive focus:ring-destructive/20" : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"}`}
        />
        {fe.name && <p className="text-xs text-destructive">{fe.name[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground">توضیحات</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground">تصویر دسته‌بندی</p>
        <p className="text-xs text-muted-foreground">
          این تصویر در صفحه دسته‌بندی و بخش‌های نمایشی سایت استفاده می‌شود.
        </p>
        <ImageUploader
          context="category"
          value={image}
          onChange={setImage}
          aspectRatio="banner"
          label=""
        />
      </div>

      {!state.success && (state as ActionState).error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(state as ActionState).error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : isEdit ? "ذخیره" : "افزودن"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-muted"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

export function CategoriesClient({ categories: initial }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`آیا از حذف دسته‌بندی "${name}" مطمئن هستید؟`)) return;
    setDeleting(id);
    const res = await deleteCategoryAction(id);
    setDeleting(null);
    if (res.success) {
      toast.success("دسته‌بندی حذف شد");
      router.refresh();
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  function handleSuccess() {
    toast.success(editing ? "دسته‌بندی ویرایش شد" : "دسته‌بندی افزوده شد");
    setModal(null);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">دسته‌بندی‌ها</h1>
          <p className="text-sm text-muted-foreground">{initial.length} دسته‌بندی</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModal("add"); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          دسته‌بندی جدید
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {modal === "add" ? "دسته‌بندی جدید" : "ویرایش دسته‌بندی"}
              </h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <CategoryForm category={editing} onSuccess={handleSuccess} onCancel={() => setModal(null)} />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
              <th className="px-4 py-3 text-start font-medium">تصویر</th>
              <th className="px-4 py-3 text-start font-medium">نام</th>
              <th className="hidden px-4 py-3 text-start font-medium sm:table-cell">اسلاگ</th>
              <th className="px-4 py-3 text-start font-medium">تعداد کتاب</th>
              <th className="px-4 py-3 text-start font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initial.map((cat) => (
              <tr key={cat.id} className="transition-colors hover:bg-muted/20">
                <td className="px-4 py-3">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-9 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-14 items-center justify-center rounded-lg bg-muted text-lg">
                      📚
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">{cat.name}</td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell" dir="ltr">
                  {cat.slug}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {cat.bookCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditing(cat); setModal("edit"); }}
                      className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={deleting === cat.id}
                      className="rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                    >
                      {deleting === cat.id ? "..." : "حذف"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
