"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { deleteCouponAction, toggleCouponActiveAction } from "@/actions/coupon.actions";

interface Props {
  id: string;
  isActive: boolean;
  code: string;
}

export function CouponRowActions({ id, isActive: initialActive, code }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(initialActive);

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleCouponActiveAction(id, !active);
      if (res.success) {
        setActive(!active);
        toast.success(active ? "کد تخفیف غیرفعال شد" : "کد تخفیف فعال شد");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`آیا از حذف کد «${code}» مطمئن هستید؟`)) return;
    startTransition(async () => {
      const res = await deleteCouponAction(id);
      if (res.success) {
        toast.success("کد تخفیف حذف شد");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggle}
        disabled={isPending}
        title={active ? "غیرفعال کردن" : "فعال کردن"}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        {active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="حذف"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
