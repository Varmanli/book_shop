"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import * as slidesRepo from "@/repositories/home-slides.repository";
import { ok, fail, type ApiResponse } from "@/types/api";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

const slideSchema = z.object({
  title: z.string().min(1, "عنوان اسلاید الزامی است"),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.preprocess(
    (v) => (!v || (typeof v === "string" && v.trim() === "") ? undefined : v),
    z
      .string()
      .refine(
        (v) => {
          if (v.startsWith("//")) return false;
          if (v.startsWith("/")) return true;
          try {
            const { protocol } = new URL(v);
            return protocol === "http:" || protocol === "https:";
          } catch {
            return false;
          }
        },
        { message: "لینک دکمه معتبر نیست" }
      )
      .optional()
  ),
  imageUrl: z.string().min(1, "تصویر اسلاید الزامی است"),
  order: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce
      .number({ invalid_type_error: "ترتیب نمایش باید عدد معتبر باشد" })
      .int("ترتیب نمایش باید عدد صحیح باشد")
      .min(0, "ترتیب نمایش باید بزرگ‌تر از صفر باشد")
      .default(0)
  ),
  isActive: z.boolean().default(true),
});

export async function createSlideAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = slideSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on",
  });
  if (!parsed.success)
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);

  try {
    let targetOrder = parsed.data.order;
    if (targetOrder <= 0) {
      targetOrder = (await slidesRepo.getMaxOrder()) + 1;
    } else {
      // Shift existing slides at this position and above up by 1
      await slidesRepo.shiftOrdersUp(targetOrder);
    }

    await slidesRepo.createSlide({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? undefined,
      ctaText: parsed.data.ctaText ?? undefined,
      ctaLink: parsed.data.ctaLink ?? undefined,
      imageUrl: parsed.data.imageUrl,
      order: targetOrder,
    });

    await slidesRepo.normalizeSlideOrders();
    revalidateTag(CACHE_TAGS.homeSlides, "max");
    return ok(null);
  } catch {
    return fail("ذخیره اسلاید با خطا مواجه شد");
  }
}

export async function updateSlideAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  await requireAdmin();
  if (!id) return fail("شناسه اسلاید نامعتبر است");
  const raw = Object.fromEntries(formData);
  const parsed = slideSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on",
  });
  if (!parsed.success)
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);

  try {
    const current = await slidesRepo.findSlideById(id);
    if (!current) return fail("اسلاید یافت نشد");

    let targetOrder = parsed.data.order;
    if (targetOrder <= 0) {
      // Keep current order if none specified
      targetOrder = current.order;
    } else if (targetOrder !== current.order) {
      if (targetOrder < current.order) {
        // Moving up: shift slides in [targetOrder, current.order-1] down
        await slidesRepo.shiftOrdersUp(targetOrder, id);
      } else {
        // Moving down: shift slides in (current.order, targetOrder] up
        await slidesRepo.shiftOrdersDown(current.order, targetOrder, id);
      }
    }

    await slidesRepo.updateSlide(id, {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? undefined,
      ctaText: parsed.data.ctaText ?? undefined,
      ctaLink: parsed.data.ctaLink ?? undefined,
      imageUrl: parsed.data.imageUrl,
      order: targetOrder,
      isActive: parsed.data.isActive,
    });

    await slidesRepo.normalizeSlideOrders();
    revalidateTag(CACHE_TAGS.homeSlides, "max");
    return ok(null);
  } catch {
    return fail("ذخیره اسلاید با خطا مواجه شد");
  }
}

export async function deleteSlideAction(id: string): Promise<ApiResponse<null>> {
  await requireAdmin();
  try {
    await slidesRepo.deleteSlide(id);
    await slidesRepo.normalizeSlideOrders();
    revalidateTag(CACHE_TAGS.homeSlides, "max");
    return ok(null);
  } catch {
    return fail("حذف اسلاید با خطا مواجه شد");
  }
}

export async function toggleSlideActiveAction(
  id: string,
  isActive: boolean
): Promise<ApiResponse<null>> {
  await requireAdmin();
  try {
    await slidesRepo.updateSlide(id, { isActive });
    revalidateTag(CACHE_TAGS.homeSlides, "max");
    return ok(null);
  } catch {
    return fail("تغییر وضعیت اسلاید با خطا مواجه شد");
  }
}
