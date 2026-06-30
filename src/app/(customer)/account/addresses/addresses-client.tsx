"use client";

import {
  createPortal,
} from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { createAddressAction, deleteAddressAction, updateAddressAction } from "@/actions/address.actions";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { getProvinceCities, provinceOptions } from "@/config/address-locations";
import { cn } from "@/lib/utils";
import type { Address } from "@/types";
import { createAddressSchema } from "@/validations/address.schema";

interface Props {
  addresses: Address[];
}

type ModalMode = "add" | "edit" | null;

type AddressFormValues = {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  postalCode: string;
  isDefault: boolean;
};

type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>;
type AddressFieldName = keyof AddressFormValues;

const FIELD_ORDER: AddressFieldName[] = [
  "fullName",
  "phone",
  "province",
  "city",
  "postalCode",
  "street",
];

function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632));
}

function sanitizeNumericInput(value: string, maxLength: number) {
  return toEnglishDigits(value).replace(/\D/g, "").slice(0, maxLength);
}

function emptyFormValues(): AddressFormValues {
  return {
    fullName: "",
    phone: "",
    province: "",
    city: "",
    street: "",
    postalCode: "",
    isDefault: false,
  };
}

function valuesFromAddress(address?: Address | null): AddressFormValues {
  if (!address) return emptyFormValues();

  return {
    fullName: address.fullName,
    phone: address.phone,
    province: address.province,
    city: address.city,
    street: address.street,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

function getFieldErrors(values: AddressFormValues): AddressFormErrors {
  const parsed = createAddressSchema.safeParse(values);

  if (parsed.success) return {};

  return Object.fromEntries(
    Object.entries(parsed.error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0] ?? ""])
  ) as AddressFormErrors;
}

function sortAddresses(addresses: Address[]) {
  return [...addresses].sort((left, right) => {
    if (left.isDefault && !right.isDefault) return -1;
    if (!left.isDefault && right.isDefault) return 1;
    return Number(new Date(right.updatedAt)) - Number(new Date(left.updatedAt));
  });
}

function formatPreview(address: Address) {
  return `${address.province}، ${address.city}، ${address.street}`;
}

function EmptyAddressState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-dashed border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,249,0.95))] p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] sm:p-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="order-2 text-center lg:order-1 lg:text-right">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">تحویل سریع‌تر از همین‌جا شروع می‌شود</span>
          <h2 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">هنوز آدرسی ثبت نشده است</h2>
          <p className="mt-3 max-w-xl text-sm leading-8 text-muted-foreground">
            برای کوتاه شدن مراحل خرید و پیشنهاد خودکار آدرس در تسویه‌حساب، اولین آدرس خود را با جزئیات کامل ثبت کنید.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            افزودن آدرس جدید
          </button>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative h-56 w-full max-w-xs rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_42%),linear-gradient(180deg,rgba(255,247,237,0.95),rgba(255,255,255,0.9))] p-6 shadow-inner">
            <div className="absolute inset-x-6 top-10 rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-lg shadow-amber-100/60">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <svg width="24" height="24" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path d="M9 1.75C6.1 1.75 3.75 4.1 3.75 7c0 4.15 5.25 9.25 5.25 9.25S14.25 11.15 14.25 7c0-2.9-2.35-5.25-5.25-5.25z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="7" r="1.7" fill="currentColor" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 w-24 rounded-full bg-stone-200" />
                  <div className="h-2.5 w-16 rounded-full bg-stone-100" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 rounded-full bg-stone-100" />
                <div className="h-2.5 w-5/6 rounded-full bg-stone-100" />
                <div className="h-2.5 w-2/3 rounded-full bg-stone-100" />
              </div>
            </div>
            <div className="absolute bottom-7 left-7 rounded-2xl bg-white/90 px-4 py-3 text-xs text-muted-foreground shadow-md shadow-stone-200/50">
              با ثبت آدرس، خرید بعدی سریع‌تر می‌شود
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  name,
  required,
  error,
  children,
}: {
  label: string;
  name: AddressFieldName;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", error && "field-shake")}>
      <label htmlFor={name} className="flex items-center gap-1 text-[13px] font-bold text-foreground">
        <span>{label}</span>
        {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      <div className="min-h-5">{error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}</div>
    </div>
  );
}

function AddressModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[8px]" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-0 sm:p-4">
        <div className="relative z-10 flex h-full w-full origin-center flex-col bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45)] animate-in fade-in zoom-in-95 duration-200 sm:h-auto sm:max-h-[90vh] sm:max-w-[520px] sm:rounded-2xl">
          <div className="flex items-start justify-between gap-4 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
            <div>
              <h3 className="text-base font-black text-foreground">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">فقط اطلاعات ضروری ارسال را وارد کنید.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="بستن"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function AddressForm({
  address,
  onCancel,
  onSuccess,
}: {
  address?: Address | null;
  onCancel: () => void;
  onSuccess: (address: Address, mode: Exclude<ModalMode, null>) => void;
}) {
  const mode: Exclude<ModalMode, null> = address ? "edit" : "add";
  const [values, setValues] = useState<AddressFormValues>(() => valuesFromAddress(address));
  const [touched, setTouched] = useState<Partial<Record<AddressFieldName, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<Partial<Record<AddressFieldName, HTMLElement | null>>>({});

  const errors = useMemo(() => getFieldErrors(values), [values]);
  const cityOptions = useMemo<SearchableSelectOption[]>(() => {
    const provinceCities = getProvinceCities(values.province);
    const mergedCities = values.city && !provinceCities.includes(values.city)
      ? [values.city, ...provinceCities]
      : provinceCities;

    return mergedCities.map((city) => ({ value: city, label: city, keywords: [values.province] }));
  }, [values.city, values.province]);
  const isFormValid = Object.keys(errors).length === 0;

  function setFieldValue(field: AddressFieldName, nextValue: string | boolean) {
    setValues((current) => {
      if (field === "province") {
        const nextProvince = String(nextValue);
        const nextCities = getProvinceCities(nextProvince);
        return {
          ...current,
          province: nextProvince,
          city: nextCities.includes(current.city) ? current.city : "",
        };
      }

      return {
        ...current,
        [field]: nextValue,
      };
    });
    setServerError("");
  }

  function markTouched(field: AddressFieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function shouldShowError(field: AddressFieldName) {
    return Boolean(errors[field]) && (touched[field] || submitAttempted);
  }

  function focusNextField(field: AddressFieldName) {
    const currentIndex = FIELD_ORDER.indexOf(field);
    const nextField = FIELD_ORDER[currentIndex + 1];
    if (!nextField) return;
    inputRefs.current[nextField]?.focus();
  }

  function handleEnterMove(
    field: AddressFieldName,
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key !== "Enter" || field === "street") return;
    event.preventDefault();
    focusNextField(field);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    setSubmitAttempted(true);
    setTouched({
      fullName: true,
      phone: true,
      province: true,
      city: true,
      postalCode: true,
      street: true,
      isDefault: true,
    });

    const nextErrors = getFieldErrors(values);
    if (Object.keys(nextErrors).length > 0) {
      const firstErrorField = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstErrorField) {
        inputRefs.current[firstErrorField]?.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => inputRefs.current[firstErrorField]?.focus(), 180);
      }
      setServerError("لطفاً خطاهای فرم را برطرف کنید.");
      return;
    }

    setServerError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("fullName", values.fullName);
      formData.set("phone", values.phone);
      formData.set("province", values.province);
      formData.set("city", values.city);
      formData.set("street", values.street);
      formData.set("postalCode", values.postalCode);
      formData.set("isDefault", String(values.isDefault));

      const response = address
        ? await updateAddressAction(address.id, null, formData)
        : await createAddressAction(null, formData);

      if (!response.success) {
        setServerError(response.error);
        return;
      }

      toast.success(mode === "add" ? "آدرس جدید با موفقیت ثبت شد" : "آدرس با موفقیت ویرایش شد");
      onSuccess(response.data, mode);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {serverError ? (
        <div className="rounded-xl bg-destructive/8 px-3 py-2 text-xs font-medium text-destructive">
          {serverError}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldShell
          label="نام و نام خانوادگی"
          name="fullName"
          required
          error={shouldShowError("fullName") ? errors.fullName : undefined}
        >
          <input
            id="fullName"
            ref={(node) => {
              inputRefs.current.fullName = node;
            }}
            value={values.fullName}
            onChange={(event) => setFieldValue("fullName", event.target.value)}
            onBlur={() => markTouched("fullName")}
            onKeyDown={(event) => handleEnterMove("fullName", event)}
            className={cn(
              "h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition",
              shouldShowError("fullName")
                ? "border-destructive/40 bg-destructive/5 ring-4 ring-destructive/10"
                : "border-border/60 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
            )}
            placeholder="مثلاً علی رضایی"
            autoFocus
          />
        </FieldShell>

        <FieldShell
          label="شماره موبایل"
          name="phone"
          required
          error={shouldShowError("phone") ? errors.phone : undefined}
        >
          <input
            id="phone"
            ref={(node) => {
              inputRefs.current.phone = node;
            }}
            value={values.phone}
            onChange={(event) => setFieldValue("phone", sanitizeNumericInput(event.target.value, 11))}
            onBlur={() => markTouched("phone")}
            onKeyDown={(event) => handleEnterMove("phone", event)}
            className={cn(
              "h-11 w-full rounded-xl border bg-background px-3.5 text-left text-sm outline-none transition",
              shouldShowError("phone")
                ? "border-destructive/40 bg-destructive/5 ring-4 ring-destructive/10"
                : "border-border/60 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
            )}
            dir="ltr"
            inputMode="numeric"
            maxLength={11}
            placeholder="09xxxxxxxxx"
          />
        </FieldShell>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldShell
          label="استان"
          name="province"
          required
          error={shouldShowError("province") ? errors.province : undefined}
        >
          <SearchableSelect
            value={values.province}
            onChange={(nextValue) => {
              setFieldValue("province", nextValue);
              markTouched("province");
              inputRefs.current.city?.focus();
            }}
            options={provinceOptions}
            placeholder="انتخاب استان"
            searchPlaceholder="جست‌وجوی استان"
            emptyText="استانی با این مشخصات پیدا نشد."
            error={shouldShowError("province") ? errors.province : undefined}
            triggerRef={(node) => {
              inputRefs.current.province = node;
            }}
          />
        </FieldShell>

        <FieldShell
          label="شهر"
          name="city"
          required
          error={shouldShowError("city") ? errors.city : undefined}
        >
          <SearchableSelect
            value={values.city}
            onChange={(nextValue) => {
              setFieldValue("city", nextValue);
              markTouched("city");
            }}
            options={cityOptions}
            placeholder={values.province ? "انتخاب شهر" : "ابتدا استان را انتخاب کنید"}
            searchPlaceholder="جست‌وجوی شهر"
            emptyText={values.province ? "شهری با این مشخصات پیدا نشد." : "ابتدا استان را انتخاب کنید."}
            disabled={!values.province}
            error={shouldShowError("city") ? errors.city : undefined}
            triggerRef={(node) => {
              inputRefs.current.city = node;
            }}
          />
        </FieldShell>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1.05fr]">
        <FieldShell
          label="کدپستی"
          name="postalCode"
          required
          error={shouldShowError("postalCode") ? errors.postalCode : undefined}
        >
          <input
            id="postalCode"
            ref={(node) => {
              inputRefs.current.postalCode = node;
            }}
            value={values.postalCode}
            onChange={(event) => setFieldValue("postalCode", sanitizeNumericInput(event.target.value, 10))}
            onBlur={() => markTouched("postalCode")}
            onKeyDown={(event) => handleEnterMove("postalCode", event)}
            className={cn(
              "h-11 w-full rounded-xl border bg-background px-3.5 text-left text-sm outline-none transition",
              shouldShowError("postalCode")
                ? "border-destructive/40 bg-destructive/5 ring-4 ring-destructive/10"
                : "border-border/60 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
            )}
            dir="ltr"
            inputMode="numeric"
            maxLength={10}
            placeholder="1234567890"
          />
        </FieldShell>

        <div className="rounded-xl bg-muted/25 px-3.5 py-3">
          <label htmlFor="isDefault" className="flex cursor-pointer items-start gap-3">
            <input
              id="isDefault"
              type="checkbox"
              checked={values.isDefault}
              onChange={(event) => setFieldValue("isDefault", event.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-border accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">ثبت به‌عنوان آدرس پیش‌فرض</span>
          </label>
        </div>
      </div>

      <FieldShell
        label="آدرس کامل"
        name="street"
        required
        error={shouldShowError("street") ? errors.street : undefined}
      >
        <textarea
          id="street"
          ref={(node) => {
            inputRefs.current.street = node;
          }}
          value={values.street}
          onChange={(event) => setFieldValue("street", event.target.value)}
          onBlur={() => markTouched("street")}
          className={cn(
            "min-h-24 w-full rounded-xl border bg-background px-3.5 py-3 text-sm leading-6 outline-none transition",
            shouldShowError("street")
              ? "border-destructive/40 bg-destructive/5 ring-4 ring-destructive/10"
              : "border-border/60 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
          )}
          placeholder="خیابان، کوچه، پلاک، طبقه و واحد"
        />
      </FieldShell>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          انصراف
        </button>

        <button
          type="submit"
          disabled={!isFormValid || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              در حال ذخیره‌سازی...
            </>
          ) : mode === "add" ? (
            "ثبت آدرس جدید"
          ) : (
            "ذخیره تغییرات"
          )}
        </button>
      </div>
    </form>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  deleting,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-border/70 bg-white/90 p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-28px_rgba(15,23,42,0.32)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-orange-300 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-black text-foreground">{address.fullName}</h3>
            {address.isDefault ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">پیش‌فرض</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{address.phone}</p>
        </div>
        <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
          {address.province} · {address.city}
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-border/60 bg-muted/20 p-4">
        <p className="text-sm leading-7 text-foreground">{address.street}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>کدپستی: {address.postalCode}</span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
          <span className="truncate">{formatPreview(address)}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/70 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 11.5V14h2.5L12.75 5.75 10.25 3.25 2 11.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M9.5 4L12 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          ویرایش
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-destructive/20 px-4 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "در حال حذف..." : "حذف آدرس"}
        </button>
      </div>
    </article>
  );
}

export function AddressesClient({ addresses: initialAddresses }: Props) {
  const [addresses, setAddresses] = useState(() => sortAddresses(initialAddresses));
  const [modal, setModal] = useState<ModalMode>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function closeModal() {
    setModal(null);
    setEditingAddress(null);
  }

  function openAddModal() {
    setEditingAddress(null);
    setModal("add");
  }

  function handleFormSuccess(address: Address, mode: Exclude<ModalMode, null>) {
    setAddresses((current) => {
      if (mode === "add") {
        const normalized = address.isDefault
          ? current.map((item) => ({ ...item, isDefault: false }))
          : current;
        return sortAddresses([address, ...normalized]);
      }

      return sortAddresses(
        current.map((item) => (item.id === address.id ? address : address.isDefault ? { ...item, isDefault: false } : item))
      );
    });
    closeModal();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const response = await deleteAddressAction(id);
    setDeletingId(null);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setAddresses((current) => current.filter((item) => item.id !== id));
    toast.success("آدرس با موفقیت حذف شد");
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,247,237,0.92))] p-5 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">مدیریت آدرس</span>
            <h2 className="mt-4 text-2xl font-black text-foreground sm:text-[2rem]">آدرس‌های تحویل سفارش</h2>
            <p className="mt-2 max-w-2xl text-sm leading-8 text-muted-foreground">
              آدرس‌های ذخیره‌شده برای تحویل سریع‌تر نمایش داده می‌شوند. آدرس پیش‌فرض در مرحله تسویه‌حساب به‌صورت خودکار انتخاب خواهد شد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-black text-foreground">{addresses.length.toLocaleString("fa-IR")}</span> آدرس ثبت شده
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M9 3.5V14.5M3.5 9H14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              افزودن آدرس جدید
            </button>
          </div>
        </div>
      </section>

      <AddressModal
        open={Boolean(modal)}
        title={modal === "add" ? "افزودن آدرس جدید" : "ویرایش آدرس"}
        onClose={closeModal}
      >
        <AddressForm
          key={editingAddress?.id ?? "new-address"}
          address={editingAddress}
          onCancel={closeModal}
          onSuccess={handleFormSuccess}
        />
      </AddressModal>

      {addresses.length === 0 ? (
        <EmptyAddressState onAdd={openAddModal} />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              deleting={deletingId === address.id}
              onEdit={() => {
                setEditingAddress(address);
                setModal("edit");
              }}
              onDelete={() => void handleDelete(address.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
