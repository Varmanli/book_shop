import type { Metadata } from "next";
import { NewCouponForm } from "./new-coupon-form";

export const metadata: Metadata = { title: "ایجاد کد تخفیف جدید" };

export default function NewCouponPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">کد تخفیف جدید</h1>
        <p className="text-sm text-muted-foreground">یک کد تخفیف برای مشتریان ایجاد کنید</p>
      </div>
      <NewCouponForm />
    </div>
  );
}
