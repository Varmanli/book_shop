import type { OrderStatus } from "@/types/domain";

type StatusConfig = {
  label: string;
  labelFa: string;
  color: string;
  allowedTransitions: OrderStatus[];
};

export const ORDER_STATUS: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "Pending",
    labelFa: "در انتظار پرداخت",
    color: "text-yellow-600",
    allowedTransitions: ["PAID", "CANCELLED"],
  },
  PAID: {
    label: "Paid",
    labelFa: "پرداخت شده",
    color: "text-blue-600",
    allowedTransitions: ["PROCESSING", "CANCELLED"],
  },
  PROCESSING: {
    label: "Processing",
    labelFa: "در حال پردازش",
    color: "text-indigo-600",
    allowedTransitions: ["SHIPPED", "CANCELLED"],
  },
  SHIPPED: {
    label: "Shipped",
    labelFa: "ارسال شده",
    color: "text-purple-600",
    allowedTransitions: ["DELIVERED"],
  },
  DELIVERED: {
    label: "Delivered",
    labelFa: "تحویل داده شده",
    color: "text-green-600",
    allowedTransitions: [],
  },
  CANCELLED: {
    label: "Cancelled",
    labelFa: "لغو شده",
    color: "text-red-600",
    allowedTransitions: [],
  },
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS[from].allowedTransitions.includes(to);
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] =
  Object.entries(ORDER_STATUS).map(([value, config]) => ({
    value: value as OrderStatus,
    label: config.labelFa,
  }));
