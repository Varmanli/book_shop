import Link from "next/link";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type IslandCardProps = {
  label?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  href?: string;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
};

type IslandGridProps = {
  children: ReactNode;
  className?: string;
};

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

type FilterChipProps = {
  href: string;
  label: string;
  count: number;
  active: boolean;
  tone?: keyof typeof statusBadgeClasses | "neutral";
};

const islandBaseClassName =
  "rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-34px_rgba(15,23,42,0.38)]";

const statusBadgeClasses = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PROCESSING: "border-violet-200 bg-violet-50 text-violet-800",
  SHIPPED: "border-sky-200 bg-sky-50 text-sky-800",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-800",
} as const;

const statusLabelMap: Record<OrderStatus, string> = {
  PENDING: "پرداخت در انتظار",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

const statusIconMap = {
  PENDING: Clock3,
  PAID: CheckCircle2,
  PROCESSING: LoaderCircle,
  SHIPPED: Truck,
  DELIVERED: Package,
  CANCELLED: XCircle,
} as const;

const filterToneClasses = {
  neutral: "border-slate-200/80 bg-white/90 text-slate-700",
  PENDING: statusBadgeClasses.PENDING,
  PAID: statusBadgeClasses.PAID,
  PROCESSING: statusBadgeClasses.PROCESSING,
  SHIPPED: statusBadgeClasses.SHIPPED,
  DELIVERED: statusBadgeClasses.DELIVERED,
  CANCELLED: statusBadgeClasses.CANCELLED,
} as const;

export function IslandGrid({ children, className }: IslandGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6", className)}>
      {children}
    </div>
  );
}

export function IslandCard({
  label,
  title,
  meta,
  icon,
  href,
  className,
  contentClassName,
  children,
}: IslandCardProps) {
  const content = (
    <div className={cn(islandBaseClassName, className)}>
      {(label || icon) && (
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          {icon ? <span className="text-slate-400">{icon}</span> : null}
          {label ? <span>{label}</span> : null}
        </div>
      )}

      <div className={cn("min-w-0 space-y-1", contentClassName)}>
        {title ? (
          <div className="truncate text-sm font-bold text-slate-900 md:text-[15px]">
            {title}
          </div>
        ) : null}
        {meta ? <div className="text-xs text-slate-500">{meta}</div> : null}
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const Icon = statusIconMap[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
        statusBadgeClasses[status],
        className,
      )}
    >
      <Icon className={cn("size-3.5", status === "PROCESSING" && "animate-spin")} aria-hidden />
      <span>{statusLabelMap[status]}</span>
    </span>
  );
}

export function FilterChip({
  href,
  label,
  count,
  active,
  tone = "neutral",
}: FilterChipProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
        active
          ? filterToneClasses[tone]
          : "border-slate-200/80 bg-white/80 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-900",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px]",
          active ? "bg-black/10 text-current" : "bg-slate-100 text-slate-500",
        )}
      >
        {count.toLocaleString("fa-IR")}
      </span>
    </Link>
  );
}

export const orderStatusLabelMap = statusLabelMap;
