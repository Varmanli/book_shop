const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M7 5.5h11.5A2.5 2.5 0 0121 8v15.5H9.5A3.5 3.5 0 016 20V6.5A1 1 0 017 5.5z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 20H21M10 9h7M10 12.5h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M18.5 5.5V16l-2.25-1.5L14 16V5.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "کتاب‌های بررسی‌شده",
    desc: "هر کتاب قبل از ثبت و ارسال، از نظر سلامت جلد و صفحات بررسی می‌شود",
    color: "text-amber-700",
    bg: "bg-amber-50",
    glow: "group-hover:shadow-amber-900/10",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M6 8.5h13.5a2.5 2.5 0 012.5 2.5v7.5H9a3 3 0 01-3-3v-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 18.5a2.5 2.5 0 105 0M20 18.5a2.5 2.5 0 105 0"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M22 12h2.2l1.8 3v3.5h-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 11h6M3 14h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "ارسال مطمئن",
    desc: "کتاب‌ها با بسته‌بندی مناسب آماده و به سراسر ایران ارسال می‌شوند",
    color: "text-teal-700",
    bg: "bg-teal-50",
    glow: "group-hover:shadow-teal-900/10",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M7.5 6.5h13A2.5 2.5 0 0123 9v10a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 015 19V9a2.5 2.5 0 012.5-2.5z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M5 11.5h18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9 17h4.5M17.5 17H19"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10 4.5v4M18 4.5v4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "مقرون‌به‌صرفه",
    desc: "با خرید کتاب‌های دست‌دوم سالم، هزینه کمتری برای مطالعه پرداخت کنید",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    glow: "group-hover:shadow-emerald-900/10",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 4.5c5 0 9 3.7 9 8.2 0 2.6-1.3 4.9-3.4 6.4l.6 3.2-3.4-1.8a10.4 10.4 0 01-2.8.4c-5 0-9-3.7-9-8.2s4-8.2 9-8.2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 12.8h.01M14 12.8h.01M17.5 12.8h.01"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "راهنمای خرید کتاب",
    desc: "برای انتخاب کتاب مناسب، وضعیت نسخه‌ها و سفارش‌ها همراهتان هستیم",
    color: "text-purple-700",
    bg: "bg-purple-50",
    glow: "group-hover:shadow-purple-900/10",
  },
];

export function FeaturesStrip() {
  return (
    <section className="relative overflow-hidden border-y border-border/70 bg-linear-to-b from-background via-muted/25 to-background px-4 py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            تجربه خرید مطمئن کتاب‌های نو و دست‌دوم
          </h2>

          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            کتاب‌هایی سالم، قیمت‌های منطقی و تجربه‌ای ساده برای پیدا کردن
            نسخه‌ای که دنبالش هستید.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={[
                "group relative overflow-hidden rounded-[1.6rem] border border-border/70",
                "bg-card/80 p-5 shadow-sm backdrop-blur-sm",
                "transition-all duration-500 ease-out",
                "hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-xl",
                feature.glow,
              ].join(" ")}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/40 to-transparent opacity-60" />
              <div className="pointer-events-none absolute -left-12 -top-12 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

              <div className="relative flex items-start gap-4">
                <div
                  className={[
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    "border border-white/70 shadow-sm ring-1 ring-black/5",
                    "transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2",
                    feature.color,
                    feature.bg,
                  ].join(" ")}
                >
                  {feature.icon}
                </div>

                <div className="min-w-0 pt-1">
                  <p className="text-base font-black text-foreground">
                    {feature.title}
                  </p>

                  <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
