import type { Metadata } from "next";
import { getAllSubscribers } from "@/repositories/newsletter.repository";
import { NewsletterTable } from "./newsletter-table";

export const metadata: Metadata = { title: "خبرنامه | پنل مدیریت" };

export default async function AdminNewsletterPage() {
  const subscribers = await getAllSubscribers();

  const activeCount = subscribers.filter((s) => s.isActive).length;
  const inactiveCount = subscribers.length - activeCount;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مشترکان خبرنامه</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت ایمیل‌های مشترک در خبرنامه
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="کل مشترکان" value={subscribers.length} icon="📬" />
        <StatCard label="مشترک فعال" value={activeCount} icon="✅" color="green" />
        <StatCard label="لغو اشتراک" value={inactiveCount} icon="🚫" color="red" />
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="text-4xl">📭</div>
          <p className="font-medium text-foreground">هیچ مشترکی ثبت نشده</p>
          <p className="text-sm text-muted-foreground">
            وقتی کاربران در خبرنامه عضو شوند اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <NewsletterTable subscribers={subscribers} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color?: "green" | "red";
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
          color === "green"
            ? "bg-green-100 dark:bg-green-900/30"
            : color === "red"
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-muted"
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
