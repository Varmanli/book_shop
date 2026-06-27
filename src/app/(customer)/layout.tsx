import { Suspense } from "react";
import { requireAuth } from "@/lib/session";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountBottomTabs } from "@/components/account/account-bottom-tabs";

async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  const user = {
    name: session.user.name ?? "کاربر",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-start gap-6">
          <div className="hidden md:block">
            <AccountSidebar user={user} />
          </div>
          <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
        </div>
      </div>
      <AccountBottomTabs />
    </div>
  );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}
