import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "ورود به حساب" };

const googleConfigured = !!(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

function LoginPageContent() {
  return (
    <AuthCard
      title="خوش برگشتید"
      subtitle="برای ادامه وارد حساب کاربری خود شوید"
      footerText="حساب کاربری ندارید؟"
      footerLinkLabel="ثبت‌نام کنید"
      footerLinkHref="/auth/register"
    >
      <LoginForm googleConfigured={googleConfigured} />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
