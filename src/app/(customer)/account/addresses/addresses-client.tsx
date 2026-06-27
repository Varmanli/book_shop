"use client";

import { useState, useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
} from "@/actions/address.actions";
import type { Address } from "@/types";

interface Props {
  addresses: Address[];
}

type ModalMode = "add" | "edit" | null;

const PROVINCES = [
  "تهران", "اصفهان", "فارس", "خراسان رضوی", "مازندران", "گیلان", "آذربایجان شرقی",
  "آذربایجان غربی", "کرمانشاه", "خوزستان", "کرمان", "سیستان و بلوچستان", "همدان",
  "لرستان", "گلستان", "مرکزی", "بوشهر", "زنجان", "سمنان", "قزوین", "قم", "کردستان",
  "گیلان", "چهارمحال و بختیاری", "خراسان جنوبی", "خراسان شمالی", "کهگیلویه و بویراحمد",
  "ایلام", "اردبیل", "البرز", "یزد",
];

function AddressForm({
  address,
  onSuccess,
  onCancel,
}: {
  address?: Address | null;
  onSuccess: (msg: string) => void;
  onCancel: () => void;
}) {
  const isEdit = !!address;

  const [state, dispatch, pending] = useActionState(
    isEdit
      ? (prev: unknown, fd: FormData) => updateAddressAction(address!.id, prev, fd)
      : (prev: unknown, fd: FormData) => createAddressAction(prev, fd),
    { success: false as const, error: "" }
  );

  useEffect(() => {
    if (state.success) {
      onSuccess(isEdit ? "آدرس ویرایش شد" : "آدرس افزوده شد");
    }
  }, [state.success]);

  const fe = (!state.success ? (state as { fieldErrors?: Record<string, string[]> }).fieldErrors : undefined) ?? {} as Record<string, string[]>;

  return (
    <form action={dispatch} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="نام و نام خانوادگی" name="fullName" required defaultValue={address?.fullName} error={fe.fullName?.[0]} />
        <Field label="شماره موبایل" name="phone" required dir="ltr" defaultValue={address?.phone} error={fe.phone?.[0]} placeholder="09XXXXXXXXX" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            استان <span className="text-destructive">*</span>
          </label>
          <select
            name="province"
            required
            defaultValue={address?.province ?? ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">انتخاب استان</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {fe.province && <p className="text-xs text-destructive">{fe.province[0]}</p>}
        </div>
        <Field label="شهر" name="city" required defaultValue={address?.city} error={fe.city?.[0]} />
      </div>
      <Field label="آدرس کامل" name="street" required defaultValue={address?.street} error={fe.street?.[0]} placeholder="خیابان، کوچه، پلاک، واحد" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="کد پستی" name="postalCode" required dir="ltr" defaultValue={address?.postalCode} error={fe.postalCode?.[0]} placeholder="XXXXXXXXXX" />
        <div className="flex items-center gap-2 pt-7">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            value="true"
            defaultChecked={address?.isDefault ?? false}
            className="h-4 w-4 rounded accent-primary"
          />
          <label htmlFor="isDefault" className="text-sm text-foreground">آدرس پیش‌فرض</label>
        </div>
      </div>

      {!state.success && (state as { error?: string }).error && (
        <p className="text-sm text-destructive">{(state as { error: string }).error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن آدرس"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
  error,
  placeholder,
  dir,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  placeholder?: string;
  dir?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        dir={dir}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
          error
            ? "border-destructive bg-destructive/5 focus:ring-destructive/20"
            : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
        }`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AddressesClient({ addresses: initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSuccess(msg: string) {
    toast.success(msg);
    setModal(null);
    setEditingAddress(null);
    // Reload page data
    window.location.reload();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await deleteAddressAction(id);
    setDeletingId(null);
    if (res.success) {
      toast.success("آدرس حذف شد");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">آدرس‌های من</h1>
          <p className="mt-1 text-sm text-muted-foreground">{addresses.length} آدرس ثبت شده</p>
        </div>
        <button
          onClick={() => { setEditingAddress(null); setModal("add"); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          آدرس جدید
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {modal === "add" ? "افزودن آدرس جدید" : "ویرایش آدرس"}
              </h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <AddressForm
              address={editingAddress}
              onSuccess={handleSuccess}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card py-16 text-center shadow-sm">
          <svg width="48" height="48" viewBox="0 0 18 18" fill="none" className="text-muted-foreground/30" aria-hidden>
            <path d="M9 1.5C6.5 1.5 4.5 3.5 4.5 6c0 3.5 4.5 10.5 4.5 10.5S13.5 9.5 13.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="font-semibold text-foreground">آدرسی ثبت نشده است</p>
          <p className="text-sm text-muted-foreground">آدرس خود را برای تحویل سریع‌تر ذخیره کنید</p>
          <button
            onClick={() => setModal("add")}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            افزودن آدرس
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative rounded-2xl border bg-card p-5 shadow-sm transition-all ${
                addr.isDefault ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
              }`}
            >
              {addr.isDefault && (
                <span className="absolute end-4 top-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  پیش‌فرض
                </span>
              )}
              <address className="not-italic space-y-1 text-sm">
                <p className="font-bold text-foreground">{addr.fullName}</p>
                <p className="text-muted-foreground">{addr.phone}</p>
                <p className="text-muted-foreground">{addr.province}، {addr.city}</p>
                <p className="text-muted-foreground">{addr.street}</p>
                <p className="text-muted-foreground">کد پستی: {addr.postalCode}</p>
              </address>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { setEditingAddress(addr); setModal("edit"); }}
                  className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="flex-1 rounded-lg border border-destructive/30 py-2 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  {deletingId === addr.id ? "حذف..." : "حذف"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
