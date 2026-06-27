import { z } from "zod";

export const createReviewSchema = z.object({
  bookId: z.string().min(1, "شناسه کتاب الزامی است"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "حداقل امتیاز ۱ است")
    .max(5, "حداکثر امتیاز ۵ است"),
  title: z.string().max(100, "عنوان حداکثر ۱۰۰ کاراکتر").optional().or(z.literal("")),
  content: z
    .string()
    .min(10, "متن نظر حداقل ۱۰ کاراکتر باید باشد")
    .max(2000, "متن نظر حداکثر ۲۰۰۰ کاراکتر"),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminNote: z.string().max(500).optional().or(z.literal("")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;
