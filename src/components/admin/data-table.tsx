import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Eye, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type GridProps = {
  templateColumns?: string;
};

type DataTableContainerProps = {
  children: ReactNode;
  className?: string;
};

type DataTableHeaderProps = GridProps & {
  columns: Array<{ key: string; label: string; className?: string }>;
  className?: string;
};

type DataTableRowProps = GridProps & {
  children: ReactNode;
  className?: string;
};

type DataTableCellProps = {
  label: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  labelClassName?: string;
};

type StatusTone = "warning" | "success" | "info" | "danger" | "progress" | "neutral";

type StatusBadgeProps = {
  tone: StatusTone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

type ActionButtonGroupProps = {
  detailsHref: string;
  detailsLabel?: string;
  className?: string;
  showMoreButton?: boolean;
};

function getGridStyle(templateColumns?: string): CSSProperties | undefined {
  return templateColumns ? { gridTemplateColumns: templateColumns } : undefined;
}

export function DataTableContainer({
  children,
  className,
}: DataTableContainerProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-border/80 bg-background/70 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.28)] backdrop-blur sm:p-4",
        className
      )}
    >
      {children}
    </section>
  );
}

export function DataTableHeader({
  columns,
  className,
  ...gridProps
}: DataTableHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 hidden items-center gap-4 rounded-2xl border border-border/70 bg-background/85 px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/95 backdrop-blur md:grid",
        className
      )}
      style={getGridStyle(gridProps.templateColumns)}
    >
      {columns.map((column) => (
        <div key={column.key} className={cn("truncate", column.className)}>
          {column.label}
        </div>
      ))}
    </div>
  );
}

export function DataTableRow({
  children,
  className,
  ...gridProps
}: DataTableRowProps) {
  return (
    <article
      className={cn(
        "grid gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] sm:p-5 md:items-center md:gap-5",
        className
      )}
      style={getGridStyle(gridProps.templateColumns)}
    >
      {children}
    </article>
  );
}

export function DataTableCell({
  label,
  children,
  className,
  contentClassName,
  labelClassName,
}: DataTableCellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span
        className={cn(
          "text-[11px] font-medium text-muted-foreground md:hidden",
          labelClassName
        )}
      >
        {label}
      </span>
      <div className={cn("min-w-0 text-sm text-foreground", contentClassName)}>{children}</div>
    </div>
  );
}

const statusToneClasses: Record<StatusTone, string> = {
  warning: "border-amber-200/80 bg-amber-50 text-amber-700",
  success: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  info: "border-sky-200/80 bg-sky-50 text-sky-700",
  danger: "border-rose-200/80 bg-rose-50 text-rose-700",
  progress: "border-violet-200/80 bg-violet-50 text-violet-700",
  neutral: "border-slate-200/80 bg-slate-100 text-slate-700",
};

export function StatusBadge({
  tone,
  icon: Icon,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        statusToneClasses[tone],
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      <span>{children}</span>
    </span>
  );
}

export function ActionButtonGroup({
  detailsHref,
  detailsLabel = "جزئیات",
  className,
  showMoreButton = true,
}: ActionButtonGroupProps) {
  return (
    <div className={cn("flex items-center gap-2 md:justify-end", className)}>
      <Link
        href={detailsHref}
        className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
      >
        <Eye className="size-4" aria-hidden />
        <span>{detailsLabel}</span>
      </Link>

      {showMoreButton ? (
        <button
          type="button"
          aria-label="عملیات بیشتر"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition hover:border-border hover:bg-muted/70 hover:text-foreground"
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
