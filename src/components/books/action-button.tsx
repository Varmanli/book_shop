"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tone?: "primary" | "ghost" | "success";
  compact?: boolean;
}

const TONE_STYLES: Record<NonNullable<ActionButtonProps["tone"]>, string> = {
  primary:
    "bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25",
  ghost:
    "border border-border/70 bg-background/90 text-foreground hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600",
  success:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function ActionButton({
  children,
  className,
  compact = false,
  icon,
  tone = "ghost",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:shadow-none disabled:hover:scale-100",
        compact ? "h-10 w-10 shrink-0" : "min-h-10 w-full px-3 py-2.5",
        tone === "ghost" ? "backdrop-blur-sm" : "",
        TONE_STYLES[tone],
        props.disabled &&
          "cursor-not-allowed border-border/60 bg-muted text-muted-foreground opacity-100",
        !props.disabled && "hover:scale-[1.02]",
        className,
      )}
      {...props}
    >
      {icon}
      {!compact && <span className="truncate">{children}</span>}
    </button>
  );
}
