import { z } from "zod";
import { isValidCity, isValidProvince } from "@/config/address-locations";

function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776)).replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632));
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeNumberText(value: unknown) {
  return typeof value === "string" ? toEnglishDigits(value).trim() : value;
}

const baseAddressSchema = z.object({
  fullName: z.preprocess(
    normalizeText,
    z.string().min(3, "نام و نام خانوادگی الزامی است")
  ),
  phone: z.preprocess(
    normalizeNumberText,
    z.string().regex(/^09[0-9]{9}$/, "شماره موبایل معتبر نیست")
  ),
  province: z.preprocess(
    normalizeText,
    z
      .string()
      .min(1, "لطفاً استان را انتخاب کنید")
      .refine(isValidProvince, "لطفاً استان را انتخاب کنید")
  ),
  city: z.preprocess(
    normalizeText,
    z.string().min(1, "لطفاً شهر معتبر انتخاب کنید")
  ),
  street: z.preprocess(
    normalizeText,
    z.string().min(10, "آدرس کامل را وارد کنید")
  ),
  postalCode: z.preprocess(
    normalizeNumberText,
    z.string().regex(/^[0-9]{10}$/, "کدپستی باید ۱۰ رقم باشد")
  ),
  isDefault: z.preprocess(
    (value) => value === true || value === "true" || value === "on",
    z.boolean().default(false)
  ),
});

export const createAddressSchema = baseAddressSchema.superRefine((data, ctx) => {
  if (!isValidCity(data.province, data.city)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "لطفاً شهر معتبر انتخاب کنید",
      path: ["city"],
    });
  }
});

export const updateAddressSchema = baseAddressSchema.partial().superRefine((data, ctx) => {
  if (data.city && !data.province) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "لطفاً استان را انتخاب کنید",
      path: ["province"],
    });
  }

  if (data.province && data.city && !isValidCity(data.province, data.city)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "لطفاً شهر معتبر انتخاب کنید",
      path: ["city"],
    });
  }
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
