import { Suspense } from "react";
import type { Metadata } from "next";
import {
  TrendingUp,
  ShoppingBag,
  Truck,
  Tag,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";
import { getFinanceSummary, getDailyRevenueTrend, getMonthlyRevenueTrend } from "@/services/finance.service";
import { displayPrice } from "@/lib/currency";

export const metadata: Metadata = { title: "داشبورد مالی" };

/* ─── Persian month names ─────────────────────────────────── */
const FA_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];

function parseMonth(yyyyMm: string): string {
  const d = new Date(`${yyyyMm}-01`);
  const fa = d.toLocaleDateString("fa-IR", { year: "numeric", month: "long" });
  return fa;
}

/* ─── Simple SVG bar chart ──────────────────────────────────── */
function BarChart({
  data,
  labelKey,
  valueKey,
  color = "oklch(0.666 0.179 60.4)",
}: {
  data: Record<string, number | string>[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  const values = data.map((d) => Number(d[valueKey]));
  const maxVal = Math.max(...values, 1);
  const barW = Math.floor(560 / data.length) - 8;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 560 160`}
        className="w-full"
        aria-hidden
        style={{ minWidth: "320px" }}
      >
        {data.map((d, i) => {
          const val = Number(d[valueKey]);
          const barH = Math.max((val / maxVal) * 120, val > 0 ? 4 : 0);
          const x = i * (barW + 8) + 4;
          const y = 130 - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={color}
                opacity={0.85}
              />
              <text
                x={x + barW / 2}
                y={148}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                className="text-muted-foreground"
              >
                {String(d[labelKey]).slice(-5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof TrendingUp;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-xl font-extrabold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ─── Main content ──────────────────────────────────────────── */
async function FinanceContent() {
  const [stats, dailyData, monthlyData] = await Promise.all([
    getFinanceSummary(),
    getDailyRevenueTrend(7),
    getMonthlyRevenueTrend(6),
  ]);

  const totalOrders =
    stats.paidOrdersCount + stats.pendingOrdersCount + stats.cancelledOrdersCount;

  const cards = [
    {
      label: "درآمد کل (سفارش‌های پرداخت‌شده)",
      value: displayPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "درآمد خالص",
      value: displayPrice(stats.netRevenue),
      sub: "پس از کسر ارسال و تخفیف",
      icon: DollarSign,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "درآمد ارسال",
      value: displayPrice(stats.totalShipping),
      icon: Truck,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "مجموع تخفیف‌های داده‌شده",
      value: displayPrice(stats.totalDiscounts),
      icon: Tag,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "سفارش‌های پرداخت‌شده",
      value: stats.paidOrdersCount.toLocaleString("fa-IR"),
      sub: `از ${totalOrders.toLocaleString("fa-IR")} سفارش کل`,
      icon: ShoppingBag,
      color: "bg-sky-50 text-sky-600",
    },
    {
      label: "سفارش‌های در انتظار",
      value: stats.pendingOrdersCount.toLocaleString("fa-IR"),
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "سفارش‌های لغوشده",
      value: stats.cancelledOrdersCount.toLocaleString("fa-IR"),
      icon: XCircle,
      color: "bg-red-50 text-red-500",
    },
  ];

  const dailyChartData = dailyData.map((d) => ({
    label: d.date.slice(5),
    value: d.revenue,
  }));

  const monthlyChartData = monthlyData.map((d) => ({
    label: parseMonth(d.month),
    value: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">داشبورد مالی</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تمام محاسبات از لجر تراکنش‌ها استخراج می‌شوند
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-foreground">درآمد ۷ روز اخیر</h2>
          <BarChart
            data={dailyChartData}
            labelKey="label"
            valueKey="value"
            color="oklch(0.55 0.2 250)"
          />
        </div>

        {/* Monthly */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-foreground">درآمد ماهانه (۶ ماه اخیر)</h2>
          <BarChart
            data={monthlyChartData}
            labelKey="label"
            valueKey="value"
            color="oklch(0.666 0.179 60.4)"
          />
        </div>
      </div>

      {/* Metrics table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <h2 className="border-b border-border px-5 py-4 font-bold text-foreground">
          خلاصه مالی
        </h2>
        <dl className="divide-y divide-border">
          {[
            ["درآمد از فروش کتاب", displayPrice(stats.totalRevenue)],
            ["درآمد از ارسال", displayPrice(stats.totalShipping)],
            ["تخفیف پرداخت‌شده", `(${displayPrice(stats.totalDiscounts)})`],
            ["درآمد خالص", displayPrice(stats.netRevenue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-bold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default function AdminFinancePage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 rounded-lg bg-muted" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(7)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted" />)}
          </div>
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      }
    >
      <FinanceContent />
    </Suspense>
  );
}
