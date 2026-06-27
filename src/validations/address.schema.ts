import { z } from "zod";

export const createAddressSchema = z.object({
  fullName: z.string().min(3, "نام و نام خانوادگی الزامی است"),
  phone: z
    .string()
    .regex(/^09[0-9]{9}$/, "شماره موبایل نامعتبر است"),
  province: z.string().min(2, "استان الزامی است"),
  city: z.string().min(2, "شهر الزامی است"),
  street: z.string().min(5, "آدرس کامل الزامی است"),
  postalCode: z
    .string()
    .regex(/^[0-9]{10}$/, "کد پستی باید ۱۰ رقم باشد"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
