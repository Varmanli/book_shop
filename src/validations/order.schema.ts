import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "آدرس تحویل الزامی است"),
  notes: z.string().max(500).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  note: z.string().max(500).optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
