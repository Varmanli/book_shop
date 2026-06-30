import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/cart-context";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Suspense>
          <CartProvider>
            {children}
          </CartProvider>
        </Suspense>
        <Toaster position="top-center" richColors dir="rtl" />
      </body>
    </html>
  );
}
