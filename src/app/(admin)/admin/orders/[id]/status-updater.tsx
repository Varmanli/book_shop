"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/actions/order.actions";
import type { OrderStatus } from "@/types/domain";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "در انتظار پرداخت" },
  { value: "PAID", label: "پرداخت شده" },
  { value: "PROCESSING", label: "در حال پردازش" },
  { value: "SHIPPED", label: "ارسال شده" },
  { value: "DELIVERED", label: "تحویل داده شده" },
  { value: "CANCELLED", label: "لغو شده" },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface Props {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: OrderStatus) {
    if (newStatus === status) return;
    setLoading(true);
    const res = await updateOrderStatusAction(orderId, newStatus);
    setLoading(false);
    if (res.success) {
      setStatus(newStatus);
      toast.success("وضعیت سفارش بروزرسانی شد");
    } else {
      toast.error(!res.success ? res.error : "خطا");
    }
  }

  const current = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <div className="flex items-center gap-3">
      <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLOR[status] ?? "bg-muted text-muted-foreground"}`}>
        {current?.label ?? status}
      </span>
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value as OrderStatus)}
          disabled={loading}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>
    </div>
  );
}
