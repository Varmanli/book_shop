"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Copy, Ellipsis, Eye, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActionGroupProps = {
  detailsHref: string;
  orderId: string;
  orderNumber: string | number;
  className?: string;
};

export function ActionGroup({
  detailsHref,
  orderId,
  orderNumber,
  className,
}: ActionGroupProps) {
  async function handleCopyOrderId() {
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success(`شناسه سفارش ${orderNumber} کپی شد`);
    } catch {
      toast.error("کپی شناسه سفارش انجام نشد");
    }
  }

  return (
    <div className={cn("flex items-center justify-between gap-2 md:justify-end", className)}>
      <Link
        href={detailsHref}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
      >
        <Eye className="size-4" aria-hidden />
        <span>جزئیات</span>
      </Link>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label="عملیات بیشتر"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <Ellipsis className="size-4" aria-hidden />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="z-50 min-w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)]"
          >
            <DropdownMenu.Item asChild>
              <Link
                href={detailsHref}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
              >
                <Eye className="size-4" aria-hidden />
                مشاهده سفارش
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link
                href={detailsHref}
                target="_blank"
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
              >
                <ExternalLink className="size-4" aria-hidden />
                باز کردن در تب جدید
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={(event) => {
                event.preventDefault();
                void handleCopyOrderId();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
            >
              <Copy className="size-4" aria-hidden />
              کپی شناسه سفارش
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
