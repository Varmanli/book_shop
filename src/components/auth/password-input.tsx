"use client";

import { useState } from "react";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  showStrength?: boolean;
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "خیلی ضعیف", segColor: "bg-destructive", textColor: "text-destructive" },
    { label: "ضعیف", segColor: "bg-orange-400", textColor: "text-orange-500" },
    { label: "متوسط", segColor: "bg-amber-400", textColor: "text-amber-500" },
    { label: "قوی", segColor: "bg-emerald-400", textColor: "text-emerald-600" },
    { label: "خیلی قوی", segColor: "bg-emerald-500", textColor: "text-emerald-600" },
  ];

  const idx = Math.min(score, 4);
  const level = levels[idx];

  return (
    <div className="mt-2 space-y-1.5">
      {/* 5-segment bar */}
      <div className="flex gap-1">
        {levels.map((l, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${
              i <= idx ? l.segColor : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        قدرت:{" "}
        <span className={`font-semibold ${level.textColor}`}>{level.label}</span>
      </p>
    </div>
  );
}

export function PasswordInput({
  label,
  error,
  hint,
  showStrength = false,
  className = "",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState((props.defaultValue as string) ?? "");

  const inputId = props.id ?? props.name ?? "password";

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
        {props.required && <span className="ms-1 text-destructive">*</span>}
      </label>

      <div className="relative">
        {/* Lock icon on start side (right in RTL) */}
        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="10.5" r="1" fill="currentColor" />
          </svg>
        </span>
        <input
          {...props}
          id={inputId}
          type={visible ? "text" : "password"}
          value={props.value !== undefined ? props.value : value}
          onChange={(e) => {
            setValue(e.target.value);
            props.onChange?.(e);
          }}
          dir="ltr"
          className={`w-full rounded-xl border pe-11 ps-10 py-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 ${
            error
              ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/20"
              : "border-border bg-background focus:border-primary/60"
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
          aria-label={visible ? "مخفی کردن رمز" : "نمایش رمز"}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3 3l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
          )}
        </button>
      </div>

      {showStrength && <PasswordStrength password={value} />}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
