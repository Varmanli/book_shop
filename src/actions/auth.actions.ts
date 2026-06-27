"use server";

import { signIn, signOut } from "@/lib/auth";
import { registerUser } from "@/services/user.service";
import { registerSchema } from "@/validations/auth.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function loginAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return fail("ایمیل و رمز عبور الزامی هستند");
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return ok(null);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return fail("ایمیل یا رمز عبور نادرست است");
        default:
          return fail("خطا در ورود — لطفاً دوباره تلاش کنید");
      }
    }
    // next/navigation redirect throws — let it propagate
    throw error;
  }
}

export async function registerAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<
      string,
      string[]
    >;
    // Surface the first global error if no field errors
    const firstMessage =
      Object.values(fieldErrors).flat()[0] ?? "داده‌های ورودی نامعتبر است";
    return fail(firstMessage, fieldErrors);
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("خطا در ثبت‌نام — لطفاً دوباره تلاش کنید");
  }

  // Auto-login after successful registration
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    // signIn may throw redirect — let it propagate; silently ignore auth errors
    // so user at least gets a success message and can log in manually
  }

  return ok(null);
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/auth/login");
}
