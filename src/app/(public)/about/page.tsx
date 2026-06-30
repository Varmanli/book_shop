import type { Metadata } from "next";
import Image from "next/image";
import { getAllTeamMembers } from "@/repositories/team.repository";
import { getSetting } from "@/repositories/settings.repository";
import type { AboutContent } from "@/actions/site-content.actions";

const DEFAULTS = {
  heroTitle: "درباره کتابخانه",
  heroSubtitle:
    "ما از سال ۱۳۹۵ در تلاشیم تا پل ارتباطی بین کتاب‌های دست دوم با ارزش و کتابخوانان کنجکاو باشیم. باور داریم هر کتاب داستانی دارد و لایق خوانده شدن است — حتی بار دوم.",
  imageUrl: null as string | null,
  missionTitle: "ماموریت ما",
  missionText: "",
  seoTitle: "درباره ما | کتابخانه",
  seoDescription:
    "با تیم کتابخانه آشنا شوید. ما عاشق کتاب هستیم و سال‌هاست کتاب‌های دست دوم با کیفیت را به دست کتابخوانان می‌رسانیم.",
} satisfies Required<AboutContent>;

async function getAboutContent(): Promise<Required<AboutContent>> {
  const raw = (await getSetting("aboutPage")) as AboutContent | null;
  return { ...DEFAULTS, ...(raw ?? {}) };
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getAboutContent();
  return {
    title: content.seoTitle || DEFAULTS.seoTitle,
    description: content.seoDescription || DEFAULTS.seoDescription,
  };
}

export default async function AboutPage() {
  const [teamMembers, content] = await Promise.all([
    getAllTeamMembers(),
    getAboutContent(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary/5 via-background to-primary/10 py-24 px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            داستان ما
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

      {/* Optional cover image */}
      {content.imageUrl && (
        <section className="px-4 py-8">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl">
            <Image
              src={content.imageUrl}
              alt={content.heroTitle}
              width={1200}
              height={400}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        </section>
      )}

      {/* Values */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            ارزش‌های ما
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "📚",
                title: "کیفیت اول",
                desc: "هر کتاب پیش از فروش بررسی و دسته‌بندی می‌شود تا مطمئن شویم دقیقاً آنچه انتظار دارید به دستتان می‌رسد.",
              },
              {
                icon: "♻️",
                title: "پایداری محیطی",
                desc: "با خرید کتاب دست دوم، چرخه حیات کاغذ را طولانی‌تر می‌کنیم و گامی در جهت حفاظت از محیط زیست برمی‌داریم.",
              },
              {
                icon: "💰",
                title: "قیمت منصفانه",
                desc: "کتاب دانش است و دانش نباید گران باشد. قیمت‌گذاری شفاف و منصفانه اصل اول ماست.",
              },
              {
                icon: "🤝",
                title: "اعتماد متقابل",
                desc: "از وضعیت کتاب تا زمان تحویل، هر مرحله را با صداقت کامل انجام می‌دهیم.",
              },
              {
                icon: "🚀",
                title: "ارسال سریع",
                desc: "سفارش‌ها را در سریع‌ترین زمان ممکن بسته‌بندی و ارسال می‌کنیم تا انتظارتان کوتاه باشد.",
              },
              {
                icon: "❤️",
                title: "عشق به کتاب",
                desc: "کتاب فقط یک کالا نیست؛ تجربه‌ای است که می‌خواهیم با شما به اشتراک بگذاریم.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      {content.missionText && (
        <section className="bg-muted/30 py-20 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-foreground">
              {content.missionTitle}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {content.missionText}
            </p>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="bg-primary py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {[
              { value: "+۱۰٬۰۰۰", label: "کتاب فروخته شده" },
              { value: "+۵٬۰۰۰", label: "مشتری راضی" },
              { value: "۸", label: "سال تجربه" },
              { value: "+۵۰۰", label: "عنوان فعال" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-extrabold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-primary-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {teamMembers.length > 0 && (
        <section className="py-20 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">تیم ما</h2>
              <p className="mt-3 text-muted-foreground">
                افرادی که با عشق به کتاب، این فروشگاه را زنده نگه می‌دارند
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <article
                  key={member.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-primary">
                      {member.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {member.bio}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-muted/50 py-20 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">
            آماده خرید هستید؟
          </h2>
          <p className="mt-4 text-muted-foreground">
            هزاران کتاب دست دوم با کیفیت در انتظار شماست.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="/books"
              className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              مشاهده همه کتاب‌ها
            </a>
            <a
              href="/contact"
              className="inline-flex items-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              تماس با ما
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
