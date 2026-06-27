"use server";

import { requireAuth } from "@/lib/session";
import * as addressRepo from "@/repositories/address.repository";
import { createAddressSchema, updateAddressSchema } from "@/validations/address.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import type { Address } from "@/types";

export async function createAddressAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Address>> {
  const session = await requireAuth();

  const parsed = createAddressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const address = await addressRepo.createAddress(session.user.id, parsed.data);
    return ok(address);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ذخیره آدرس");
  }
}

export async function updateAddressAction(
  id: string,
  _: unknown,
  formData: FormData
): Promise<ApiResponse<Address>> {
  const session = await requireAuth();

  const parsed = updateAddressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const address = await addressRepo.updateAddress(id, session.user.id, parsed.data);
    if (!address) return fail("آدرس یافت نشد");
    return ok(address);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در ویرایش آدرس");
  }
}

export async function deleteAddressAction(id: string): Promise<ApiResponse<null>> {
  const session = await requireAuth();
  try {
    await addressRepo.deleteAddress(id, session.user.id);
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در حذف آدرس");
  }
}
