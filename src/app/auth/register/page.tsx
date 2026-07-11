import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "ثبت‌نام" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="ایجاد حساب جدید"
      footerText="قبلاً ثبت‌نام کرده‌اید؟"
      footerLinkLabel="وارد شوید"
      footerLinkHref="/auth/login"
    >
      <RegisterForm />
    </AuthCard>
  );
}
