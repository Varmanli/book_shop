import { z } from "zod";

export const createGenreSchema = z.object({
  name: z.string().min(2, "نام ژانر حداقل ۲ کاراکتر باید داشته باشد"),
  slug: z.string().min(1).optional(),
});

export const updateGenreSchema = createGenreSchema.partial();

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
