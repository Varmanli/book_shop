import type { Metadata } from "next";
import { getSetting } from "@/repositories/settings.repository";
import { ContactForm } from "./contact-form";
import type { ContactContent } from "@/actions/site-content.actions";

const DEFAULTS = {
  heroTitle: "تماس با ما",
  heroSubtitle:
    "سوال، پیشنهاد یا انتقاد دارید؟ با کمال میل پاسخگوی شما هستیم. معمولاً ظرف ۲۴ ساعت پاسخ می‌دهیم.",
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  mobile: "",
  email: "info@bookshop.com",
  address: "تهران، خیابان انقلاب، پلاک ۱۲۳",
  workingHours: "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر",
  mapLink: "",
  formIntro: "",
  instagram: "https://instagram.com/bookshop",
  telegram: "https://t.me/bookshop",
  seoTitle: "تماس با ما | کتابخانه",
  seoDescription:
    "برای هرگونه سوال، پیشنهاد یا انتقاد با تیم کتابخانه در تماس باشید.",
} satisfies Required<ContactContent>;

async function getContactContent(): Promise<Required<ContactContent>> {
  const raw = (await getSetting("contactPage")) as ContactContent | null;
  return { ...DEFAULTS, ...(raw ?? {}) };
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactContent();
  return {
    title: content.seoTitle || DEFAULTS.seoTitle,
    description: content.seoDescription || DEFAULTS.seoDescription,
  };
}

export default async function ContactPage() {
  const content = await getContactContent();

  const infoCards = [
    content.address
      ? {
          icon: "📍",
          label: "آدرس",
          value: content.address,
          sub: "نزدیک ایستگاه مترو انقلاب",
        }
      : null,
    content.phone || content.mobile
      ? {
          icon: "📞",
          label: "تلفن",
          value: content.phone || content.mobile,
          sub: content.workingHours || "",
        }
      : null,
    content.email
      ? {
          icon: "✉️",
          label: "ایمیل",
          value: content.email,
          sub: "پاسخ در کمتر از ۲۴ ساعت",
        }
      : null,
    content.workingHours
      ? {
          icon: "🕐",
          label: "ساعات کاری",
          value: "شنبه تا پنجشنبه",
          sub: content.workingHours,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary/5 via-background to-primary/10 py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            پشتیبانی ۲۴/۷
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {content.heroTitle}
          </h1>
          {content.heroSubtitle && (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {content.heroSubtitle}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Info cards */}
            <aside className="space-y-4 lg:col-span-2">
              {infoCards.map((item) => (
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
                    {item.sub && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.sub}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Social links */}
              {(content.instagram || content.telegram) && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">
                    شبکه‌های اجتماعی
                  </p>
                  <div className="flex gap-3">
                    {content.instagram && (
                      <a
                        href={content.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg transition-colors hover:bg-muted"
                        aria-label="اینستاگرام"
                      >
                        📸
                      </a>
                    )}
                    {content.telegram && (
                      <a
                        href={content.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-lg transition-colors hover:bg-muted"
                        aria-label="تلگرام"
                      >
                        ✈️
                      </a>
                    )}
                  </div>
                </div>
              )}
            </aside>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                {content.formIntro && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {content.formIntro}
                  </p>
                )}
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
