import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "تماس با ما | کتابخانه",
  description:
    "برای هرگونه سوال، پیشنهاد یا انتقاد با تیم کتابخانه در تماس باشید.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary/5 via-background to-primary/10 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            پشتیبانی ۲۴/۷
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            تماس با ما
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            سوال، پیشنهاد یا انتقاد دارید؟ با کمال میل پاسخگوی شما هستیم.
            معمولاً ظرف ۲۴ ساعت پاسخ می‌دهیم.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Info cards */}
            <aside className="lg:col-span-2 space-y-4">
              {[
                {
                  icon: "📍",
                  label: "آدرس",
                  value: "تهران، خیابان انقلاب، پلاک ۱۲۳",
                  sub: "نزدیک ایستگاه مترو انقلاب",
                },
                {
                  icon: "📞",
                  label: "تلفن",
                  value: "۰۲۱-۱۲۳۴۵۶۷۸",
                  sub: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر",
                },
                {
                  icon: "✉️",
                  label: "ایمیل",
                  value: "info@bookshop.com",
                  sub: "پاسخ در کمتر از ۲۴ ساعت",
                },
                {
                  icon: "🕐",
                  label: "ساعات کاری",
                  value: "شنبه تا پنجشنبه",
                  sub: "۹:۰۰ صبح — ۱۸:۰۰ عصر",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}

              {/* Social links */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  شبکه‌های اجتماعی
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com/bookshop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg transition-colors hover:bg-muted"
                    aria-label="اینستاگرام"
                  >
                    📸
                  </a>
                  <a
                    href="https://t.me/bookshop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg transition-colors hover:bg-muted"
                    aria-label="تلگرام"
                  >
                    ✈️
                  </a>
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-foreground">
                  ارسال پیام
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
