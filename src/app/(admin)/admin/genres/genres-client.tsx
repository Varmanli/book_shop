"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createGenreAction,
  updateGenreAction,
  deleteGenreAction,
} from "@/actions/genre.actions";

type Genre = { id: string; name: string; slug: string; bookCount: number };
type ModalMode = "add" | "edit" | null;
type ActionState = { success: false; error: string; fieldErrors?: Record<string, string[]> };

function GenreForm({
  genre,
  onSuccess,
  onCancel,
}: {
  genre?: Genre | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!genre;
  const [state, dispatch, pending] = useActionState(
    isEdit
      ? (prev: unknown, fd: FormData) => updateGenreAction(genre!.id, prev, fd)
      : (prev: unknown, fd: FormData) => createGenreAction(prev, fd),
    { success: false, error: "" }
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success]);

  const fe = (!state.success ? (state as ActionState).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-foreground">
          نام ژانر <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={genre?.name}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${fe.name ? "border-destructive focus:ring-destructive/20" : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"}`}
        />
        {fe.name && <p className="text-xs text-destructive">{fe.name[0]}</p>}
      </div>
      {!state.success && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {pending ? "..." : isEdit ? "ذخیره" : "افزودن"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-muted">
          انصراف
        </button>
      </div>
    </form>
  );
}

export function GenresClient({ genres: initial }: { genres: Genre[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Genre | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`حذف ژانر "${name}"؟`)) return;
    setDeleting(id);
    const res = await deleteGenreAction(id);
    setDeleting(null);
    if (res.success) { toast.success("ژانر حذف شد"); router.refresh(); }
    else toast.error(!res.success ? res.error : "خطا");
  }

  function handleSuccess() {
    toast.success(editing ? "ژانر ویرایش شد" : "ژانر افزوده شد");
    setModal(null); setEditing(null); router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">ژانرها</h1>
          <p className="text-sm text-muted-foreground">{initial.length} ژانر</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModal("add"); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          ژانر جدید
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">{modal === "add" ? "ژانر جدید" : "ویرایش ژانر"}</h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <GenreForm genre={editing} onSuccess={handleSuccess} onCancel={() => setModal(null)} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {initial.map((genre) => (
          <div key={genre.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="font-semibold text-foreground">{genre.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{genre.slug}</p>
            <p className="mt-2 text-xs text-muted-foreground">{genre.bookCount} کتاب</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => { setEditing(genre); setModal("edit"); }}
                className="flex-1 rounded-lg border border-border py-1 text-xs hover:bg-muted"
              >
                ویرایش
              </button>
              <button
                onClick={() => handleDelete(genre.id, genre.name)}
                disabled={deleting === genre.id}
                className="flex-1 rounded-lg border border-destructive/30 py-1 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"
              >
                {deleting === genre.id ? "..." : "حذف"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
