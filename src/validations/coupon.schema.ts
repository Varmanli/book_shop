import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "کد حداقل ۳ کاراکتر باید داشته باشد")
    .max(32, "کد حداکثر ۳۲ کاراکتر می‌تواند داشته باشد")
    .regex(/^[A-Z0-9_-]+$/i, "کد فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد")
    .transform((v) => v.toUpperCase()),

  type: z.enum(["PERCENT", "FIXED"], { message: "نوع تخفیف نامعتبر است" }),

  value: z.coerce
    .number()
    .int()
    .min(1, "مقدار تخفیف باید بزرگ‌تر از صفر باشد"),

  minOrderAmount: z.coerce.number().int().min(0).default(0),

  maxDiscount: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(1).nullable().optional()
  ),

  usageLimit: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().min(1).nullable().optional()
  ),

  isActive: z.coerce.boolean().default(true),

  expiresAt: z.preprocess(
    (v) => (v === "" || v == null ? null : new Date(v as string)),
    z.date().nullable().optional()
  ),

  description: z.string().max(200).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
