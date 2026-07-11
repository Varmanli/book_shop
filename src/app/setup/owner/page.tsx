import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OWNER_SETUP_COOKIE, isValidSetupCookie } from "@/lib/owner-setup";
import { listRoleUsers, ownerExists } from "@/services/role.service";
import { OwnerSetupForm } from "@/components/setup/owner-setup-form";

export default async function OwnerSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; error?: string }>;
}) {
  const cookieStore = await cookies();
  if (
    !isValidSetupCookie(cookieStore.get(OWNER_SETUP_COOKIE)?.value) ||
    (await ownerExists())
  ) {
    notFound();
  }

  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const result = await listRoleUsers(params.q ?? "", Number.isFinite(page) ? page : 1);
  const pageUrl = (nextPage: number) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    query.set("page", String(nextPage));
    return `/setup/owner?${query}`;
  };

  return (
    <main dir="rtl" className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
        <h1 className="text-2xl font-extrabold">راه‌اندازی مالک سیستم</h1>
        <p className="mt-2 text-sm leading-6">این عملیات فقط یک‌بار انجام می‌شود و پس از آن از طریق این صفحه قابل تغییر نیست.</p>
      </div>

      <form className="mb-5 flex gap-2" method="get">
        <input name="q" defaultValue={params.q} placeholder="جستجو بر اساس نام یا ایمیل" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-xl border border-border px-4 text-sm font-semibold">جستجو</button>
      </form>

      {params.error && <p role="alert" className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">تأیید مالک سیستم انجام نشد. انتخاب و ایمیل را بررسی کنید.</p>}
      {result.users.length ? <OwnerSetupForm users={result.users} /> : <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">کاربری برای انتخاب یافت نشد.</p>}
      <div className="mt-5 flex items-center justify-between">
        {result.page > 1 ? <Link href={pageUrl(result.page - 1)} className="rounded-lg border border-border px-3 py-2 text-sm">صفحه قبل</Link> : <span />}
        {result.hasNextPage ? <Link href={pageUrl(result.page + 1)} className="rounded-lg border border-border px-3 py-2 text-sm">صفحه بعد</Link> : <span />}
      </div>
    </main>
  );
}
