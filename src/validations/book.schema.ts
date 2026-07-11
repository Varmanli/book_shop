import { z } from "zod";

const qualityGrades = ["Like New", "Very Good", "Good", "Acceptable"] as const;

function optionalNullableInteger(
  min: number,
  max?: number,
) {
  return z.preprocess((value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && value.trim() === "") return null;
    return value;
  }, max === undefined
    ? z.coerce.number().int().min(min).nullable().optional()
    : z.coerce.number().int().min(min).max(max).nullable().optional());
}

export const createBookSchema = z.object({
  title: z.string().min(1, "عنوان کتاب الزامی است"),
  slug: z.string().min(1).optional(),
  author: z.string().min(1, "نویسنده کتاب را انتخاب کنید"),
  translator: z.string().optional().nullable(),
  publisher: z.string().min(1, "ناشر کتاب را انتخاب کنید"),
  isbn: z.string().optional().nullable(),
  description: z
    .string()
    .max(5000, "توضیحات کتاب بیش از حد مجاز است")
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : "")),
  categoryId: z.string().min(1, "دسته‌بندی کتاب را انتخاب کنید"),
  genreIds: z.array(z.string()).default([]),
  qualityGrade: z.enum(qualityGrades, { message: "درجه کیفیت نامعتبر است" }),
  // Single-copy model: no numeric stock, just a sold flag
  isSold: z.boolean().default(false),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => {
      const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9]/g, ""));
      return n;
    })
    .pipe(
      z
        .number({ invalid_type_error: "قیمت باید یک عدد معتبر باشد" })
        .int("قیمت باید یک عدد معتبر باشد")
        .min(1, "قیمت کتاب الزامی است")
        .nonnegative("قیمت نمی‌تواند منفی باشد")
    ),
  images: z.array(z.string()).default([]),
  publishedYear: optionalNullableInteger(1000, 2100),
  pageCount: optionalNullableInteger(1),
  language: z.string().default("Persian"),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
