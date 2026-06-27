"use client";

import { useActionState } from "react";
import { submitContactMessageAction } from "@/actions/contact.actions";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { ContactMessage } from "@/types";

const initialState: ApiResponse<ContactMessage> = {
  success: false,
  error: "",
};

export function ContactForm() {
  const [state, action, pending] = useActionState(
    submitContactMessageAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-green-200 bg-green-50 py-14 text-center dark:border-green-800 dark:bg-green-950/30">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900/50">
          ✅
        </div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
          پیام شما ارسال شد!
        </h3>
        <p className="max-w-xs text-sm text-green-700 dark:text-green-400">
          از تماس شما متشکریم. تیم ما در اسرع وقت پاسخ خواهد داد.
        </p>
      </div>
    );
  }

  const errorState = state.success === false ? state : null;

  return (
    <form action={action} className="space-y-5" noValidate>
      {errorState?.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorState.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="نام و نام خانوادگی"
          name="name"
          placeholder="مثال: علی احمدی"
          required
          error={errorState?.fieldErrors?.name?.[0]}
        />
        <Field
          id="email"
          label="ایمیل"
          name="email"
          type="email"
          placeholder="example@email.com"
          required
          error={errorState?.fieldErrors?.email?.[0]}
          dir="ltr"
        />
      </div>

      <Field
        id="subject"
        label="موضوع"
        name="subject"
        placeholder="موضوع پیام خود را بنویسید"
        required
        error={errorState?.fieldErrors?.subject?.[0]}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-foreground"
        >
          پیام <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="پیام خود را اینجا بنویسید..."
          required
          className={cn(
            "w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
            errorState?.fieldErrors?.message
              ? "border-destructive focus:ring-destructive/30"
              : "border-input"
          )}
        />
        {errorState?.fieldErrors?.message && (
          <p className="text-xs text-destructive">
            {errorState.fieldErrors.message[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            در حال ارسال...
          </span>
        ) : (
          "ارسال پیام"
        )}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  dir?: string;
}

function Field({
  id,
  label,
  name,
  type = "text",
  placeholder,
  required,
  error,
  dir,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        dir={dir}
        className={cn(
          "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
          error ? "border-destructive focus:ring-destructive/30" : "border-input"
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
