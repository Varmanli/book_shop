import Link from "next/link";

export default function OwnerSetupCompletePage() {
  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-lg rounded-2xl border border-emerald-300 bg-emerald-50 p-7 text-center">
        <h1 className="text-2xl font-extrabold text-emerald-900">مالک سیستم با موفقیت تعیین شد</h1>
        <p className="mt-3 text-sm text-emerald-800">برای استفاده از دسترسی‌های مالک، با همان حساب وارد شوید.</p>
        <Link href="/auth/login" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">ورود به حساب</Link>
      </section>
    </main>
  );
}
