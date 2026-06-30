import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(5, "عنوان حداقل ۵ کاراکتر باید داشته باشد"),
  slug: z.string().min(1).optional(),
  excerpt: z
    .string()
    .min(20, "خلاصه حداقل ۲۰ کاراکتر باید داشته باشد")
    .max(300, "خلاصه حداکثر ۳۰۰ کاراکتر می‌تواند داشته باشد"),
  content: z
    .string()
    .min(1, "محتوای مقاله الزامی است")
    .max(200_000, "محتوای مقاله بیش از حد مجاز است"),
  coverImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  category: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
