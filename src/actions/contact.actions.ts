"use server";

import * as contactRepo from "@/repositories/contact.repository";
import { createContactMessageSchema, updateContactStatusSchema } from "@/validations/contact.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdmin } from "@/lib/session";
import type { ContactMessage } from "@/types";

export async function submitContactMessageAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<ContactMessage>> {
  const parsed = createContactMessageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const message = await contactRepo.createContactMessage(parsed.data);
    revalidateTag(CACHE_TAGS.contactMessages, "max");
    return ok(message);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ارسال پیام");
  }
}

export async function updateContactStatusAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<ContactMessage>> {
  await requireAdmin();

  const parsed = updateContactStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const message = await contactRepo.updateContactMessageStatus(id, parsed.data);
    revalidateTag(CACHE_TAGS.contactMessages, "max");
    revalidateTag(CACHE_TAGS.contactMessage(id), "max");
    return ok(message);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در بروزرسانی وضعیت");
  }
}

export async function deleteContactMessageAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();

  try {
    await contactRepo.deleteContactMessage(id);
    revalidateTag(CACHE_TAGS.contactMessages, "max");
    revalidateTag(CACHE_TAGS.contactMessage(id), "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف پیام");
  }
}
