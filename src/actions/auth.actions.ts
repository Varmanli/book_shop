"use server";

import { signIn, signOut } from "@/lib/auth";
import { DuplicateEmailError, registerUser } from "@/services/user.service";
import { loginSchema, registerSchema } from "@/validations/auth.schema";
import { ok, fail, type ApiResponse } from "@/types/api";
import { AuthError } from "next-auth";
import {
  getAuthErrorFromResult,
  getSafeRedirectTo,
  normalizeEmail,
} from "@/lib/auth-utils";

const INVALID_CREDENTIALS_MESSAGE = "ایمیل یا رمز عبور صحیح نیست";
const LOGIN_ERROR_MESSAGE = "خطا در ورود — لطفاً دوباره تلاش کنید";
const REGISTRATION_ERROR_MESSAGE = "خطا در ثبت‌نام — لطفاً دوباره تلاش کنید";

export type RegistrationResult = {
  redirectTo: string;
};

function logAuthFailure(context: string, error: unknown) {
  const type =
    error instanceof AuthError
      ? error.type
      : error instanceof Error
        ? error.name
        : "UnknownError";
  console.error(`${context}: ${type}`);
}

function getCredentialsErrorMessage(result: unknown): string | null {
  const error = getAuthErrorFromResult(result);
  if (!error) return null;

  return error === "CredentialsSignin"
    ? INVALID_CREDENTIALS_MESSAGE
    : LOGIN_ERROR_MESSAGE;
}

export async function loginAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<null>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return fail(parsed.error.flatten().fieldErrors.email?.[0] ?? parsed.error.flatten().fieldErrors.password?.[0] ?? "اطلاعات ورود نامعتبر است");
  }

  try {
    const result = await signIn("credentials", {
      email: normalizeEmail(parsed.data.email),
      password: parsed.data.password,
      redirect: false,
      redirectTo: getSafeRedirectTo(formData.get("redirectTo")),
    });
    const errorMessage = getCredentialsErrorMessage(result);
    if (errorMessage) return fail(errorMessage);

    return ok(null);
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return fail(INVALID_CREDENTIALS_MESSAGE);
      }

      logAuthFailure("Credentials sign-in failed", error);
      return fail(LOGIN_ERROR_MESSAGE);
    }

    logAuthFailure("Credentials sign-in failed", error);
    return fail(LOGIN_ERROR_MESSAGE);
  }
}

export async function signInWithGoogleAction(formData: FormData) {
  await signIn("google", {
    redirectTo: getSafeRedirectTo(formData.get("redirectTo")),
  });
}

export async function registerAction(
  _: unknown,
  formData: FormData
): Promise<ApiResponse<RegistrationResult>> {
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
    if (error instanceof DuplicateEmailError) {
      return fail("این ایمیل قبلاً ثبت شده است", {
        email: ["این ایمیل قبلاً ثبت شده است"],
      });
    }

    logAuthFailure("User registration failed", error);
    return fail(REGISTRATION_ERROR_MESSAGE);
  }

  // Auto-login after successful registration
  try {
    const result = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
      redirectTo: "/account",
    });
    if (!getAuthErrorFromResult(result)) {
      return ok({ redirectTo: "/account" });
    }
  } catch (error) {
    logAuthFailure("Automatic sign-in after registration failed", error);
  }

  return ok({ redirectTo: "/auth/login?registered=1" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/auth/login" });
}
