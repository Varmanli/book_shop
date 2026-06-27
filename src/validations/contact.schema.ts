import { z } from "zod";

export const createContactMessageSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  email: z.string().email("ایمیل نامعتبر است"),
  subject: z.string().min(3, "موضوع باید حداقل ۳ کاراکتر باشد").max(200),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد").max(2000),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(["UNREAD", "READ", "REPLIED", "ARCHIVED"]),
  adminNote: z.string().max(1000).optional(),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
