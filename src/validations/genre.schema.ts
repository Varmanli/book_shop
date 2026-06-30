import { z } from "zod";

export const createGenreSchema = z.object({
  name: z.string().min(2, "نام ژانر الزامی است"),
  slug: z.string().min(1).optional(),
  image: z.string().optional().nullable(),
});

export const updateGenreSchema = createGenreSchema.partial();

export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
