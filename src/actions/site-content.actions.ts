"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import * as settingsRepo from "@/repositories/settings.repository";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidatePath } from "next/cache";

export interface AboutContent {
  heroTitle?: string;
  heroSubtitle?: string;
  imageUrl?: string | null;
  missionTitle?: string;
  missionText?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ContactContent {
  heroTitle?: string;
  heroSubtitle?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  mapLink?: string;
  formIntro?: string;
  instagram?: string;
  telegram?: string;
  seoTitle?: string;
  seoDescription?: string;
}

const aboutSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  imageUrl: z.preprocess(
    (v) => (!v || v === "" ? null : v),
    z.string().url().nullable().optional()
  ),
  missionTitle: z.string().optional(),
  missionText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const contactSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  email: z.preprocess(
    (v) => (!v || v === "" ? undefined : v),
    z.string().email("ایمیل واردشده معتبر نیست").optional()
  ),
  address: z.string().optional(),
  workingHours: z.string().optional(),
  mapLink: z.preprocess(
    (v) => (!v || v === "" ? undefined : v),
    z.string().url("لینک نقشه معتبر نیست").optional()
  ),
  formIntro: z.string().optional(),
  instagram: z.preprocess(
    (v) => (!v || v === "" ? undefined : v),
    z.string().url().optional()
  ),
  telegram: z.preprocess(
    (v) => (!v || v === "" ? undefined : v),
    z.string().url().optional()
  ),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function updateAboutContentAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = aboutSchema.safeParse(raw);
  if (!parsed.success)
    return fail(
      "داده‌های ورودی نامعتبر است",
      parsed.error.flatten().fieldErrors
    );
  try {
    await settingsRepo.setSetting("aboutPage", parsed.data);
    revalidatePath("/about");
    return ok(null);
  } catch {
    return fail("ذخیره اطلاعات درباره ما با خطا مواجه شد");
  }
}

export async function updateContactContentAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success)
    return fail(
      "داده‌های ورودی نامعتبر است",
      parsed.error.flatten().fieldErrors
    );
  try {
    await settingsRepo.setSetting("contactPage", parsed.data);
    revalidatePath("/contact");
    return ok(null);
  } catch {
    return fail("ذخیره اطلاعات تماس با خطا مواجه شد");
  }
}
