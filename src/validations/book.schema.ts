import { z } from "zod";

const qualityGrades = ["Like New", "Very Good", "Good", "Acceptable"] as const;

export const createBookSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z.string().min(1).optional(),
  author: z.string().min(1, "نام نویسنده الزامی است"),
  translator: z.string().optional().nullable(),
  publisher: z.string().min(1, "ناشر الزامی است"),
  isbn: z.string().optional().nullable(),
  description: z.string().min(20, "توضیحات حداقل ۲۰ کاراکتر باید داشته باشد"),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
  genreIds: z.array(z.string()).default([]),
  qualityGrade: z.enum(qualityGrades, { message: "درجه کیفیت نامعتبر است" }),
  stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد"),
  price: z.coerce.number().int().min(1, "قیمت الزامی است"),
  images: z.array(z.string().url()).default([]),
  publishedYear: z.coerce.number().int().min(1000).max(2100).optional().nullable(),
  pageCount: z.coerce.number().int().min(1).optional().nullable(),
  language: z.string().default("Persian"),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const updateBookSchema = createBookSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
