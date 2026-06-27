export const siteConfig = {
  name: "کتابخانه",
  description: "فروشگاه آنلاین کتاب دست دوم",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    instagram: "",
    telegram: "",
    twitter: "",
  },
  contact: {
    email: "info@bookshop.com",
    phone: "",
    address: "",
  },
  shipping: {
    freeShippingThreshold: 5000000,
    defaultShippingCost: 350000,
  },
} as const;

export type SiteConfig = typeof siteConfig;
