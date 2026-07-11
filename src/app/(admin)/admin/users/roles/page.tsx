import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { listRoleUsers } from "@/services/role.service";
import { grantAdminRoleAction, revokeAdminRoleAction } from "@/actions/role.actions";
import { RoleChangeForm } from "@/components/admin/role-change-form";

const roleLabel = { USER: "کاربر", ADMIN: "مدیر", OWNER: "مالک سیستم" } as const;

export default async function RoleManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; message?: string; error?: string }>;
}) {
  await requireOwner();
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);
  const result = await listRoleUsers(params.q ?? "", Number.isFinite(page) ? page : 1);

  const pageUrl = (nextPage: number) => {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    query.set("page", String(nextPage));
    return `/admin/users/roles?${query}`;
  };

  return (
    <section dir="rtl" className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">مدیریت نقش مدیران</h1>
        <p className="mt-2 text-sm text-muted-foreground">تنها مالک سیستم می‌تواند دسترسی مدیریت را اعطا یا لغو کند.</p>
      </div>

      {params.message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">تغییر نقش با موفقیت انجام شد.</p>}
      {params.error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{params.error === "invalid" ? "درخواست نامعتبر است" : params.error}</p>}

      <form method="get" className="flex gap-2">
        <input name="q" defaultValue={params.q} placeholder="جستجو بر اساس نام یا ایمیل" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-xl border border-border px-4 text-sm font-semibold">جستجو</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[700px] text-right text-sm">
          <thead className="border-b border-border bg-muted/40 text-muted-foreground"><tr><th className="px-4 py-3">کاربر</th><th className="px-4 py-3">ایمیل</th><th className="px-4 py-3">نقش</th><th className="px-4 py-3">تاریخ عضویت</th><th className="px-4 py-3">عملیات</th></tr></thead>
          <tbody>
            {result.users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{user.name || "بدون نام"}</td>
                <td className="px-4 py-3" dir="ltr">{user.email}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{roleLabel[user.role]}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{user.createdAt.toLocaleDateString("fa-IR")}</td>
                <td className="px-4 py-3">
                  {user.role === "USER" && <RoleChangeForm action={grantAdminRoleAction} userId={user.id} label="اعطای دسترسی مدیریت" confirmation="آیا از اعطای دسترسی مدیریت مطمئن هستید؟" className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground" />}
                  {user.role === "ADMIN" && <RoleChangeForm action={revokeAdminRoleAction} userId={user.id} label="لغو دسترسی مدیریت" confirmation="آیا از لغو دسترسی مدیریت مطمئن هستید؟" className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive" />}
                  {user.role === "OWNER" && <span className="text-xs text-muted-foreground">محافظت‌شده</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        {result.page > 1 ? <Link href={pageUrl(result.page - 1)} className="rounded-lg border border-border px-3 py-2 text-sm">صفحه قبل</Link> : <span />}
        {result.hasNextPage ? <Link href={pageUrl(result.page + 1)} className="rounded-lg border border-border px-3 py-2 text-sm">صفحه بعد</Link> : <span />}
      </div>
    </section>
  );
}
