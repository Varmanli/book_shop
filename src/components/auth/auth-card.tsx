import Link from "next/link";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
}

export function AuthCard({
  children,
  title,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* ══════════════════════════════════════════════════════
          ANIMATED BACKGROUND LAYER
      ══════════════════════════════════════════════════════ */}
      <div
        className="pointer-events-none fixed inset-0 select-none"
        aria-hidden
      >
        {/* Deep gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.97 0.012 80) 0%, oklch(0.985 0.022 68) 40%, oklch(0.975 0.018 220) 70%, oklch(0.989 0.007 80) 100%)",
          }}
        />

        {/* Animated blob 1 — large amber top-right */}
        <div
          className="auth-blob-1 absolute -inset-e-32 -top-32 h-130 w-130 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, oklch(0.85 0.14 65) 0%, oklch(0.75 0.18 58) 40%, transparent 75%)",
            filter: "blur(70px)",
          }}
        />

        {/* Animated blob 2 — teal bottom-left */}
        <div
          className="auth-blob-2 absolute -bottom-40 -inset-s-28 h-115 w-115 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle, oklch(0.75 0.1 218) 0%, oklch(0.6 0.12 225) 40%, transparent 75%)",
            filter: "blur(80px)",
          }}
        />

        {/* Animated blob 3 — soft peach center */}
        <div
          className="auth-blob-3 absolute left-[45%] top-[30%] h-72 w-72 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.88 0.08 70) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Floating particles — SVG dots */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.055]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="auth-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.8" fill="oklch(0.55 0.15 60)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-dots)" />
        </svg>

        {/* Decorative book lines — top-right corner ornament */}
        <svg
          className="absolute inset-e-8 top-8 opacity-[0.07]"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="10"
            width="60"
            height="80"
            rx="5"
            stroke="oklch(0.5 0.18 60)"
            strokeWidth="3"
          />
          <rect
            x="22"
            y="10"
            width="60"
            height="80"
            rx="5"
            stroke="oklch(0.5 0.18 60)"
            strokeWidth="3"
          />
          <rect
            x="36"
            y="10"
            width="60"
            height="80"
            rx="5"
            stroke="oklch(0.5 0.18 60)"
            strokeWidth="3"
          />
          <line
            x1="28"
            y1="38"
            x2="72"
            y2="38"
            stroke="oklch(0.5 0.18 60)"
            strokeWidth="2"
          />
          <line
            x1="28"
            y1="50"
            x2="72"
            y2="50"
            stroke="oklch(0.5 0.18 60)"
            strokeWidth="2"
          />
          <line
            x1="28"
            y1="62"
            x2="58"
            y2="62"
            stroke="oklch(0.5 0.18 60)"
            strokeWidth="2"
          />
        </svg>

        {/* Bottom-left ornament */}
        <svg
          className="absolute bottom-8 inset-s-8 opacity-[0.06]"
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="oklch(0.5 0.1 218)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            stroke="oklch(0.5 0.1 218)"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="15"
            stroke="oklch(0.5 0.1 218)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════════
          CARD CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="auth-card-animate relative w-full max-w-md">
        {/* ── Brand header ──────────────────────────────────── */}
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <Link href="/" className="group flex items-center gap-3">
            {/* Logo icon */}
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-amber-500 to-orange-400 shadow-xl shadow-primary/40 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/60">
              {/* Shine overlay */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-white/25 via-transparent to-transparent" />
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                aria-hidden
              >
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="20"
                  rx="2.5"
                  fill="white"
                  fillOpacity="0.95"
                />
                <rect
                  x="10"
                  y="5"
                  width="16"
                  height="20"
                  rx="2.5"
                  fill="white"
                  fillOpacity="0.45"
                />
                <path
                  d="M8 12h8M8 16h8M8 20h5"
                  stroke="oklch(0.55 0.18 60)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-xl font-extrabold text-foreground transition-colors group-hover:text-primary">
              کتاب‌فروشی
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>
        </div>

        {/* ── Glassmorphic card ──────────────────────────────── */}
        <div
          className="auth-pulse-ring relative overflow-hidden rounded-3xl border border-white/60 p-7 backdrop-blur-xl sm:p-8"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(255,252,245,0.92) 100%)",
            boxShadow:
              "0 25px 60px -10px rgba(0,0,0,0.12), 0 8px 24px -6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          {/* Top gradient accent line */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/60 to-transparent" />

          {/* Subtle inner shine */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-white/40 via-transparent to-transparent" />

          <div className="relative">{children}</div>
        </div>

        {/* ── Footer link ────────────────────────────────────── */}
        <p className="mt-6 text-center text-sm text-foreground/70">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
