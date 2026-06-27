import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "نام دسته‌بندی حداقل ۲ کاراکتر باید داشته باشد"),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
