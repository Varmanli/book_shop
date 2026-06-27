"use server";

import { requireAuth } from "@/lib/session";
import * as userService from "@/services/user.service";
import * as userRepo from "@/repositories/user.repository";
import { updateProfileSchema } from "@/validations/auth.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { z } from "zod";
import type { User } from "@/types";

export async function updateProfileAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<User>> {
  const session = await requireAuth();

  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const user = await userService.updateProfile(session.user.id, parsed.data);
    return ok(user);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در بروزرسانی پروفایل");
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z
    .string()
    .min(8, "رمز عبور جدید حداقل ۸ کاراکتر باید داشته باشد")
    .regex(/[A-Z]/, "رمز عبور باید حداقل یک حرف بزرگ داشته باشد")
    .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد"),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: "رمز عبور جدید و تکرار آن مطابقت ندارند",
  path: ["confirmNewPassword"],
});

export async function changePasswordAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  const session = await requireAuth();

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("داده‌های ورودی نامعتبر است", parsed.error.flatten().fieldErrors);
  }

  try {
    const user = await userRepo.findUserById(session.user.id);
    if (!user?.password) {
      return fail("حساب شما با Google ورود می‌کند و رمز عبور ندارد");
    }

    const { verifyPassword } = await import("@/lib/password");
    const valid = await verifyPassword(parsed.data.currentPassword, user.password);
    if (!valid) {
      return fail("رمز عبور فعلی نادرست است", { currentPassword: ["رمز عبور فعلی نادرست است"] });
    }

    await userRepo.updateUser(session.user.id, { password: parsed.data.newPassword });
    return ok(null);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "خطا در تغییر رمز عبور");
  }
}
