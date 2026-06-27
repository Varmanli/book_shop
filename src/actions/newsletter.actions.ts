"use server";

import * as newsletterRepo from "@/repositories/newsletter.repository";
import { subscribeNewsletterSchema } from "@/validations/newsletter.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { NewsletterSubscriber } from "@/types";

export async function subscribeNewsletterAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<NewsletterSubscriber>> {
  const parsed = subscribeNewsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("ایمیل نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const subscriber = await newsletterRepo.subscribeEmail(parsed.data.email);
    revalidateTag(CACHE_TAGS.newsletterSubscribers, "max");
    return ok(subscriber);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در عضویت در خبرنامه");
  }
}

export async function unsubscribeNewsletterAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  const parsed = subscribeNewsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("ایمیل نامعتبر است");
  }

  try {
    await newsletterRepo.unsubscribeEmail(parsed.data.email);
    revalidateTag(CACHE_TAGS.newsletterSubscribers, "max");
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در لغو عضویت");
  }
}
