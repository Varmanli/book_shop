import { Suspense } from "react";
import { requireAdmin } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  const user = {
    name: session.user.name ?? "مدیر",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
    role: session.user.role,
  };

  return <AdminShell user={user}>{children}</AdminShell>;
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  );
}
