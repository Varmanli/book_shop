"use server";

import { requireAdmin } from "@/lib/session";
import * as settingsRepo from "@/repositories/settings.repository";
import { updateSettingsSchema } from "@/validations/settings.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function getSettingsAction() {
  return settingsRepo.getAllSettings();
}

export async function updateSettingsAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  await requireAdmin();

  const raw = Object.fromEntries(formData);

  try {
    if (raw.heroSlides) raw.heroSlides = JSON.parse(raw.heroSlides as string);
    if (raw.socialLinks) raw.socialLinks = JSON.parse(raw.socialLinks as string);
  } catch {
    return fail("فرمت داده نامعتبر است");
  }

  const parsed = updateSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        await settingsRepo.setSetting(key, value);
      }
    }
    revalidateTag(CACHE_TAGS.settings, "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ذخیره تنظیمات");
  }
}
