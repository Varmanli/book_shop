import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
});

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
