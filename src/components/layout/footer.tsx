import Link from "next/link";

const QUICK_LINKS = [
  { href: "/books", label: "همه کتاب‌ها" },
  { href: "/books?featured=true", label: "کتاب‌های ویژه" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

const CUSTOMER_LINKS = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/account/orders", label: "سفارش‌های من" },
  { href: "/cart", label: "سبد خرید" },
  { href: "/terms", label: "قوانین و مقررات" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
                <rect x="3" y="4" width="16" height="20" rx="2" fill="currentColor" className="text-primary" />
                <rect x="9" y="4" width="16" height="20" rx="2" fill="currentColor" className="text-primary/50" />
                <path d="M7 9h8M7 13h8M7 17h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              کتاب‌فروشی
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              بهترین مجموعه کتاب‌های دست دوم با کیفیت تضمین‌شده. با ما کتابخوانی را متفاوت تجربه کنید.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="اینستاگرام"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="تلگرام"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path d="M21 5L2 12.5l7 1M21 5l-5 14-7-5.5M21 5L9 13.5m0 0V19l3.5-3" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/70">
              دسترسی سریع
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/70">
              خدمات مشتریان
            </h3>
            <ul className="space-y-2.5">
              {CUSTOMER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground/70">
              تماس با ما
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-primary" aria-hidden>
                  <path d="M8 1.5C5.51 1.5 3.5 3.51 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.49-2.01-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor" />
                </svg>
                تهران، خیابان انقلاب، پلاک ۱۲۳
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary" aria-hidden>
                  <path d="M3 2.5A1.5 1.5 0 014.5 1h.793a1 1 0 01.98.804l.5 2.5a1 1 0 01-.564 1.078L5 6s.5 2 2 3.5c1.5 1.5 3.5 2 3.5 2l.618-.21a1 1 0 011.078.564l2.5.5A1 1 0 0115 13.207V14a1.5 1.5 0 01-1.5 1.5C6.044 15.5 1 10.456 1 3.5A1.5 1.5 0 012.5 2l.5.5z" fill="currentColor" />
                </svg>
                ۰۲۱-۱۲۳۴-۵۶۷۸
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary" aria-hidden>
                  <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v.5L8 9 2 4.5V4z" fill="currentColor" />
                  <path d="M2 6l6 4 6-4V12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="currentColor" />
                </svg>
                info@bookshop.ir
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>© ۱۴۰۴ کتاب‌فروشی. تمام حقوق محفوظ است.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-primary">قوانین استفاده</Link>
            <Link href="/contact" className="hover:text-primary">حریم خصوصی</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
