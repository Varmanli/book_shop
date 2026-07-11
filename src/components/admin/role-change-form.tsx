"use client";

import type { FormEvent } from "react";

interface Props {
  action: (formData: FormData) => void | Promise<void>;
  userId: string;
  label: string;
  confirmation: string;
  className: string;
}

export function RoleChangeForm({ action, userId, label, confirmation, className }: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmation)) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
