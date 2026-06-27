const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 3l2 5h6l-5 4 2 6-5-3-5 3 2-6-5-4h6l2-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <path d="M4 22h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "کیفیت تضمین‌شده",
    desc: "هر کتاب پیش از ارسال بررسی و درجه‌بندی می‌شود",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 6V5a2 2 0 014 0v1M16 6V5a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 12h22" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "ارسال سریع",
    desc: "تحویل به سراسر ایران در کمتر از ۳ روز کاری",
    color: "text-teal-600 bg-teal-50",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 4a10 10 0 100 20A10 10 0 0014 4z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M14 8v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "بازگشت آسان",
    desc: "۷ روز ضمانت بازگشت بدون قید و شرط",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M4 14c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 20c0-2.2 1.8-4 4-4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="20" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 14h2l2-4 2 8 2-4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "پشتیبانی ۲۴/۷",
    desc: "تیم پشتیبانی ما همیشه آماده پاسخگویی است",
    color: "text-purple-600 bg-purple-50",
  },
];

export function FeaturesStrip() {
  return (
    <section className="border-y border-border bg-card py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="group flex items-start gap-4 rounded-xl p-4 transition-all duration-300 hover:bg-muted/50"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}
              >
                {feature.icon}
              </div>
              <div>
                <p className="font-bold text-foreground">{feature.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
