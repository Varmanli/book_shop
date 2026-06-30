"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader, type UploadedFile } from "@/components/ui/image-uploader";
import {
  createSlideAction,
  updateSlideAction,
  deleteSlideAction,
  toggleSlideActiveAction,
} from "@/actions/hero-slides.actions";
import {
  updateAboutContentAction,
  updateContactContentAction,
  type AboutContent,
  type ContactContent,
} from "@/actions/site-content.actions";
import type { HomeSlide } from "@/types";
import { Layers, Info, Phone } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */

type Tab = "slides" | "about" | "contact";

interface Props {
  slides: HomeSlide[];
  aboutData: AboutContent | null;
  contactData: ContactContent | null;
}

type ActionState = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

/* ─── Shared input helpers ───────────────────────────────────── */

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  dir,
  required,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  dir?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        dir={dir}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-destructive focus:ring-destructive/20"
            : "border-border bg-background focus:border-primary/60 focus:ring-primary/20"
        }`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  rows = 3,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

/* ─── Slide Form ─────────────────────────────────────────────── */

function SlideForm({
  slide,
  onSuccess,
  onCancel,
}: {
  slide?: HomeSlide | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!slide;
  const [image, setImage] = useState<UploadedFile | null>(
    slide?.imageUrl ? { url: slide.imageUrl } : null
  );

  const [state, dispatch, pending] = useActionState(
    isEdit
      ? (prev: unknown, fd: FormData) => updateSlideAction(slide!.id, prev, fd)
      : createSlideAction,
    { success: false as const, error: "" }
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const fe = (!state.success ? (state as ActionState).fieldErrors : undefined) ?? {};

  return (
    <form action={dispatch} className="space-y-4">
      <input type="hidden" name="imageUrl" value={image?.url ?? ""} />

      <Field
        label="عنوان اسلاید"
        name="title"
        required
        defaultValue={slide?.title}
        placeholder="عنوان جذاب اسلاید"
        error={fe.title?.[0]}
      />

      <Field
        label="توضیح کوتاه"
        name="subtitle"
        defaultValue={slide?.subtitle ?? ""}
        placeholder="یک جمله توضیح کوتاه (اختیاری)"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="متن دکمه"
          name="ctaText"
          defaultValue={slide?.ctaText ?? ""}
          placeholder="مثال: مشاهده کتاب‌ها"
        />
        <Field
          label="لینک دکمه"
          name="ctaLink"
          defaultValue={slide?.ctaLink ?? ""}
          placeholder="https://..."
          dir="ltr"
          error={fe.ctaLink?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Field
            label="ترتیب نمایش"
            name="order"
            type="number"
            defaultValue={slide?.order ? String(slide.order) : ""}
            placeholder="خودکار"
            dir="ltr"
            error={fe.order?.[0]}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            خالی = ترتیب خودکار (آخر لیست)
          </p>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={slide ? slide.isActive : true}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <label htmlFor="isActive" className="text-sm font-semibold text-foreground">
            فعال باشد
          </label>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-foreground">
          تصویر اسلاید <span className="text-destructive">*</span>
        </p>
        <ImageUploader
          context="hero"
          aspectRatio="banner"
          value={image}
          onChange={setImage}
        />
        {fe.imageUrl && (
          <p className="mt-1 text-xs text-destructive">{fe.imageUrl[0]}</p>
        )}
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
          {pending ? "در حال ذخیره..." : isEdit ? "ذخیره اسلاید" : "افزودن اسلاید"}
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

/* ─── Slides Tab ─────────────────────────────────────────────── */

function SlidesTab({ slides }: { slides: HomeSlide[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<HomeSlide | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`آیا از حذف اسلاید "${title}" مطمئن هستید؟`)) return;
    setDeleting(id);
    const res = await deleteSlideAction(id);
    setDeleting(null);
    if (res.success) {
      toast.success("اسلاید حذف شد");
      router.refresh();
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    const res = await toggleSlideActiveAction(id, !current);
    setTogglingId(null);
    if (res.success) {
      router.refresh();
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  function handleSuccess() {
    toast.success(editing ? "اسلاید ویرایش شد" : "اسلاید افزوده شد");
    setModal(null);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{slides.length} اسلاید</p>
        <button
          onClick={() => {
            setEditing(null);
            setModal("add");
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          افزودن اسلاید
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModal(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {modal === "add" ? "افزودن اسلاید" : "ویرایش اسلاید"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <SlideForm
              slide={editing}
              onSuccess={handleSuccess}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}

      {slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <div className="mb-3 text-4xl">🖼️</div>
          <p className="font-semibold text-foreground">هنوز اسلایدی اضافه نشده</p>
          <p className="mt-1 text-sm text-muted-foreground">
            اولین اسلاید صفحه اصلی را اضافه کنید
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[120px]" />
              <col />
              <col className="w-[90px]" />
              <col className="w-[110px]" />
              <col className="w-[160px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">تصویر</th>
                <th className="px-4 py-3 text-start font-medium">عنوان</th>
                <th className="px-4 py-3 text-center font-medium">ترتیب</th>
                <th className="px-4 py-3 text-center font-medium">وضعیت</th>
                <th className="px-4 py-3 text-center font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slides.map((slide) => (
                <tr key={slide.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-4 py-3">
                    {slide.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="h-10 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground">
                        بدون تصویر
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate font-semibold text-foreground">
                      {slide.title}
                    </p>
                    {slide.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">
                        {slide.subtitle}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                      {slide.order.toLocaleString("fa-IR")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(slide.id, slide.isActive)}
                      disabled={togglingId === slide.id}
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
                        slide.isActive ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                          slide.isActive ? "end-0.5" : "start-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(slide);
                          setModal("edit");
                        }}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id, slide.title)}
                        disabled={deleting === slide.id}
                        className="rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                      >
                        {deleting === slide.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── About Tab ──────────────────────────────────────────────── */

function AboutTab({ data }: { data: AboutContent | null }) {
  const [state, dispatch, pending] = useActionState(updateAboutContentAction, {
    success: false as const,
    error: "",
  });
  const [image, setImage] = useState<UploadedFile | null>(
    data?.imageUrl ? { url: data.imageUrl } : null
  );

  useEffect(() => {
    if (state.success) toast.success("اطلاعات درباره ما ذخیره شد");
    if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  const fe = (!state.success ? (state as ActionState).fieldErrors : undefined) ?? {};

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="imageUrl" value={image?.url ?? ""} />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">بخش معرفی (Hero)</h2>
        <div className="space-y-4">
          <Field
            label="تیتر اصلی"
            name="heroTitle"
            defaultValue={data?.heroTitle ?? "درباره کتابخانه"}
            placeholder="عنوان بخش معرفی"
          />
          <TextareaField
            label="توضیح کوتاه"
            name="heroSubtitle"
            defaultValue={
              data?.heroSubtitle ??
              "ما از سال ۱۳۹۵ در تلاشیم تا پل ارتباطی بین کتاب‌های دست دوم با ارزش و کتابخوانان کنجکاو باشیم."
            }
            rows={3}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">تصویر صفحه</h2>
        <ImageUploader
          context="page"
          aspectRatio="banner"
          value={image}
          onChange={setImage}
          description="تصویر اختیاری برای بخش معرفی صفحه درباره ما"
        />
        {fe.imageUrl && (
          <p className="mt-1 text-xs text-destructive">{fe.imageUrl[0]}</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">بخش ماموریت</h2>
        <div className="space-y-4">
          <Field
            label="ماموریت ما"
            name="missionTitle"
            defaultValue={data?.missionTitle ?? "ماموریت ما"}
            placeholder="عنوان بخش ماموریت"
          />
          <TextareaField
            label="متن ماموریت"
            name="missionText"
            defaultValue={data?.missionText ?? ""}
            rows={4}
            placeholder="توضیح ماموریت و هدف فروشگاه..."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">سئو (SEO)</h2>
        <div className="space-y-4">
          <Field
            label="عنوان سئو"
            name="seoTitle"
            defaultValue={data?.seoTitle ?? "درباره ما | کتابخانه"}
            placeholder="عنوان صفحه برای موتورهای جستجو"
            dir="auto"
          />
          <TextareaField
            label="توضیحات سئو"
            name="seoDescription"
            defaultValue={
              data?.seoDescription ??
              "با تیم کتابخانه آشنا شوید. ما عاشق کتاب هستیم و سال‌هاست کتاب‌های دست دوم با کیفیت را به دست کتابخوانان می‌رسانیم."
            }
            rows={2}
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        {!state.success && (state as ActionState).error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {(state as ActionState).error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="ms-auto rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}

/* ─── Contact Tab ────────────────────────────────────────────── */

function ContactTab({ data }: { data: ContactContent | null }) {
  const [state, dispatch, pending] = useActionState(updateContactContentAction, {
    success: false as const,
    error: "",
  });

  useEffect(() => {
    if (state.success) toast.success("اطلاعات تماس ذخیره شد");
    if (!state.success && state.error) toast.error(state.error);
  }, [state]);

  const fe = (!state.success ? (state as ActionState).fieldErrors : undefined) ?? {};

  return (
    <form action={dispatch} className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">بخش معرفی (Hero)</h2>
        <div className="space-y-4">
          <Field
            label="تیتر اصلی"
            name="heroTitle"
            defaultValue={data?.heroTitle ?? "تماس با ما"}
          />
          <TextareaField
            label="توضیح کوتاه"
            name="heroSubtitle"
            defaultValue={
              data?.heroSubtitle ??
              "سوال، پیشنهاد یا انتقاد دارید؟ با کمال میل پاسخگوی شما هستیم."
            }
            rows={2}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">اطلاعات تماس</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="شماره تماس"
            name="phone"
            defaultValue={data?.phone ?? ""}
            placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
          />
          <Field
            label="شماره موبایل"
            name="mobile"
            defaultValue={data?.mobile ?? ""}
            placeholder="۰۹۱۲-۳۴۵-۶۷۸۹"
          />
          <Field
            label="ایمیل"
            name="email"
            type="email"
            defaultValue={data?.email ?? ""}
            placeholder="info@example.com"
            dir="ltr"
            error={fe.email?.[0]}
          />
          <Field
            label="ساعات کاری"
            name="workingHours"
            defaultValue={data?.workingHours ?? "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر"}
          />
        </div>
        <div className="mt-4 space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">آدرس</label>
          <textarea
            name="address"
            rows={2}
            defaultValue={data?.address ?? "تهران، خیابان انقلاب، پلاک ۱۲۳"}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">لینک نقشه و فرم تماس</h2>
        <div className="space-y-4">
          <Field
            label="لینک نقشه"
            name="mapLink"
            defaultValue={data?.mapLink ?? ""}
            placeholder="https://maps.google.com/..."
            dir="ltr"
            error={fe.mapLink?.[0]}
          />
          <TextareaField
            label="متن معرفی فرم تماس"
            name="formIntro"
            defaultValue={data?.formIntro ?? ""}
            rows={2}
            placeholder="متن توضیحی بالای فرم تماس (اختیاری)"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">شبکه‌های اجتماعی</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="اینستاگرام"
            name="instagram"
            defaultValue={data?.instagram ?? ""}
            placeholder="https://instagram.com/..."
            dir="ltr"
          />
          <Field
            label="تلگرام"
            name="telegram"
            defaultValue={data?.telegram ?? ""}
            placeholder="https://t.me/..."
            dir="ltr"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-foreground">سئو (SEO)</h2>
        <div className="space-y-4">
          <Field
            label="عنوان سئو"
            name="seoTitle"
            defaultValue={data?.seoTitle ?? "تماس با ما | کتابخانه"}
          />
          <TextareaField
            label="توضیحات سئو"
            name="seoDescription"
            defaultValue={
              data?.seoDescription ??
              "برای هرگونه سوال، پیشنهاد یا انتقاد با تیم کتابخانه در تماس باشید."
            }
            rows={2}
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        {!state.success && (state as ActionState).error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {(state as ActionState).error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="ms-auto rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}

/* ─── SiteContentClient ──────────────────────────────────────── */

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "slides", label: "اسلایدر صفحه اصلی", icon: <Layers size={16} /> },
  { id: "about", label: "درباره ما", icon: <Info size={16} /> },
  { id: "contact", label: "تماس با ما", icon: <Phone size={16} /> },
];

export function SiteContentClient({ slides, aboutData, contactData }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("slides");

  return (
    <div className="space-y-6">
      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "slides" && <SlidesTab slides={slides} />}
      {activeTab === "about" && <AboutTab data={aboutData} />}
      {activeTab === "contact" && <ContactTab data={contactData} />}
    </div>
  );
}
