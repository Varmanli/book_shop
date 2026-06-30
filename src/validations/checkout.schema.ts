import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "انتخاب آدرس الزامی است"),

  phone: z
    .string()
    .regex(/^09[0-9]{9}$/, "شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"),

  /** Postal code comes from the saved address (10 digits). We re-validate it
   *  here so the server always enforces the rule independent of the address row. */
  postalCode: z
    .string()
    .regex(/^[0-9]{10}$/, "کد پستی باید دقیقاً ۱۰ رقم عددی باشد"),

  /** Optional — only validated when non-empty. */
  email: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().email("فرمت ایمیل نامعتبر است").optional()
  ),

  notes: z
    .string()
    .max(500, "یادداشت حداکثر ۵۰۰ کاراکتر می‌تواند داشته باشد")
    .optional(),

  /** Optional coupon code — validated server-side in the order service. */
  couponCode: z.preprocess(
    (v) => (v === "" || v == null ? undefined : String(v).toUpperCase()),
    z.string().min(3).max(32).optional()
  ),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
