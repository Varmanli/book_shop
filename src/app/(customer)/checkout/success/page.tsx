import type { Metadata } from "next";
export const metadata: Metadata = { title: "سفارش ثبت شد" };
export default function CheckoutSuccessPage() {
  return <main className="container mx-auto py-8"><h1 className="text-2xl font-bold">سفارش شما با موفقیت ثبت شد</h1></main>;
}
