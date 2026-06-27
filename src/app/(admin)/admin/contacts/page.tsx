import type { Metadata } from "next";
import { getAllContactMessages } from "@/repositories/contact.repository";
import { ContactMessagesTable } from "./contacts-table";

export const metadata: Metadata = { title: "پیام‌های تماس | پنل مدیریت" };

export default async function AdminContactsPage() {
  const messages = await getAllContactMessages();

  const unread = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">پیام‌های تماس</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {messages.length} پیام دریافتی
            {unread > 0 && (
              <span className="mr-2 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {unread} خوانده نشده
              </span>
            )}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="text-4xl">📭</div>
          <p className="font-medium text-foreground">هیچ پیامی دریافت نشده</p>
          <p className="text-sm text-muted-foreground">
            وقتی کاربران از فرم تماس پیام بفرستند، اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <ContactMessagesTable messages={messages} />
      )}
    </div>
  );
}
