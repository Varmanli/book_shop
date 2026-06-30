import { z } from "zod";

export const heroSlideSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().url(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  logo: z.string().url().optional().nullable(),
  storeName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  heroSlides: z.array(heroSlideSchema).optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      telegram: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
  /** Flat shipping cost applied to every order (in smallest currency unit, e.g. Rials). */
  shippingCost: z.coerce.number().int().min(0).optional(),
  /**
   * When set, orders whose subtotal reaches this amount get free shipping.
   * Pass an empty string / blank to clear (set to null = disabled).
   */
  freeShippingThreshold: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).nullable().optional()
  ),
});

export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
