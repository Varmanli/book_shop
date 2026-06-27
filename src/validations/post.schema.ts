import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(5, "عنوان حداقل ۵ کاراکتر باید داشته باشد"),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(20, "خلاصه حداقل ۲۰ کاراکتر باید داشته باشد").max(300),
  content: z.string().min(50, "محتوا حداقل ۵۰ کاراکتر باید داشته باشد"),
  coverImage: z.string().url().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  category: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
