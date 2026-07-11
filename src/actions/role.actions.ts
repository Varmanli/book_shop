"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/session";
import {
  isValidSetupCookie,
  OWNER_SETUP_COOKIE,
  ownerSetupCookieOptions,
} from "@/lib/owner-setup";
import {
  assignInitialOwner,
  grantAdminRole,
  ownerExists,
  revokeAdminRole,
  RoleManagementError,
} from "@/services/role.service";
import * as userRepo from "@/repositories/user.repository";
import { normalizeEmail } from "@/lib/auth-utils";

const userIdSchema = z.string().uuid();

function roleActionMessage(error: unknown): string {
  if (error instanceof RoleManagementError) {
    switch (error.code) {
      case "TARGET_NOT_FOUND":
        return "کاربر موردنظر یافت نشد";
      case "OWNER_PROTECTED":
        return "امکان تغییر نقش مالک سیستم وجود ندارد";
      case "INVALID_TRANSITION":
        return "این تغییر نقش مجاز نیست یا قبلاً انجام شده است";
      case "OWNER_EXISTS":
        return "مالک سیستم قبلاً تعیین شده است";
    }
  }
  return "انجام عملیات ممکن نشد. لطفاً دوباره تلاش کنید";
}

function logUnexpectedRoleError(context: string, error: unknown) {
  if (!(error instanceof RoleManagementError)) {
    const type = error instanceof Error ? error.name : "UnknownError";
    console.error(`${context}: ${type}`);
  }
}

export async function grantAdminRoleAction(formData: FormData) {
  const actor = await requireOwner();
  const parsed = userIdSchema.safeParse(formData.get("userId"));
  if (!parsed.success) redirect("/admin/users/roles?error=invalid");

  try {
    await grantAdminRole(actor.user.id, parsed.data);
  } catch (error) {
    logUnexpectedRoleError("Grant admin role failed", error);
    redirect(`/admin/users/roles?error=${encodeURIComponent(roleActionMessage(error))}`);
  }
  revalidatePath("/admin/users/roles");
  redirect("/admin/users/roles?message=granted");
}

export async function revokeAdminRoleAction(formData: FormData) {
  const actor = await requireOwner();
  const parsed = userIdSchema.safeParse(formData.get("userId"));
  if (!parsed.success) redirect("/admin/users/roles?error=invalid");

  try {
    await revokeAdminRole(actor.user.id, parsed.data);
  } catch (error) {
    logUnexpectedRoleError("Revoke admin role failed", error);
    redirect(`/admin/users/roles?error=${encodeURIComponent(roleActionMessage(error))}`);
  }
  revalidatePath("/admin/users/roles");
  redirect("/admin/users/roles?message=revoked");
}

export async function assignInitialOwnerAction(formData: FormData) {
  const cookieStore = await cookies();
  const setupCookie = cookieStore.get(OWNER_SETUP_COOKIE)?.value;
  if (!isValidSetupCookie(setupCookie) || (await ownerExists())) {
    redirect("/setup/owner");
  }

  const parsed = userIdSchema.safeParse(formData.get("userId"));
  const confirmation = formData.get("confirmationEmail");
  if (!parsed.success || typeof confirmation !== "string") {
    redirect("/setup/owner?error=invalid");
  }

  const target = await userRepo.findUserById(parsed.data);
  if (!target || !target.email || normalizeEmail(target.email) !== normalizeEmail(confirmation)) {
    redirect("/setup/owner?error=confirmation");
  }

  try {
    await assignInitialOwner(target.id);
  } catch (error) {
    logUnexpectedRoleError("Initial owner assignment failed", error);
    redirect(`/setup/owner?error=${encodeURIComponent(roleActionMessage(error))}`);
  }

  cookieStore.set(OWNER_SETUP_COOKIE, "", { ...ownerSetupCookieOptions, maxAge: 0 });
  revalidatePath("/setup/owner");
  redirect("/setup/owner/complete");
}
