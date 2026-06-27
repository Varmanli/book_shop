"use client";

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({ value, min = 1, max = 99, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-0 rounded-xl border border-border bg-background overflow-hidden w-fit">
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-10 w-10 items-center justify-center text-lg font-bold text-muted-foreground transition hover:bg-muted disabled:opacity-40"
        aria-label="کاهش تعداد"
      >
        −
      </button>
      <span className="flex h-10 min-w-[2.5rem] items-center justify-center text-sm font-bold tabular-nums text-foreground px-1 border-x border-border">
        {value.toLocaleString("fa-IR")}
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-10 w-10 items-center justify-center text-lg font-bold text-muted-foreground transition hover:bg-muted disabled:opacity-40"
        aria-label="افزایش تعداد"
      >
        +
      </button>
    </div>
  );
}
