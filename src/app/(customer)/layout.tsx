import { Suspense } from "react";
import { requireAuth } from "@/lib/session";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { AccountBottomTabs } from "@/components/account/account-bottom-tabs";
import { ConditionalCustomerLayout } from "@/components/account/conditional-customer-layout";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/ui/back-to-top";

async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  const user = {
    name: session.user.name ?? "کاربر",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  return (
    <ConditionalCustomerLayout
      header={<Header />}
      footer={<Footer />}
      backToTop={<BackToTop />}
      sidebar={<AccountSidebar user={user} />}
      bottomTabs={<AccountBottomTabs />}
    >
      {children}
    </ConditionalCustomerLayout>
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
