import Link from "next/link";
import {
  CreditCard,
  Hash,
  Layers3,
  Package2,
  ReceiptText,
  UserRound,
} from "lucide-react";
import type { BookSnapshot } from "@/db/schema/orders";
import { displayPrice } from "@/lib/currency";
import type { PaginationMeta } from "@/types/api";
import type { findAllOrders } from "@/repositories/order.repository";
import {
  FilterChip,
  IslandCard,
  IslandGrid,
  orderStatusLabelMap,
  OrderStatus,
  StatusBadge,
} from "@/components/admin/island-ui";
import { ActionGroup } from "@/components/admin/action-group";

type AdminOrder = Awaited<ReturnType<typeof findAllOrders>>["items"][number];

type OrdersTableProps = {
  orders: AdminOrder[];
  meta: PaginationMeta;
  currentPage: number;
  currentStatus?: OrderStatus;
  statusCounts: Record<OrderStatus, number>;
};

const FILTER_ORDER: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function buildOrdersHref(status?: OrderStatus, page?: number) {
  const params = new URLSearchParams();

  if (status) params.set("status", status);
  if (page && page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export function OrdersTable({
  orders,
  meta,
  currentPage,
  currentStatus,
  statusCounts,
}: OrdersTableProps) {
  const totalCount = FILTER_ORDER.reduce(
    (sum, status) => sum + statusCounts[status],
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black">مدیریت سفارش‌ها</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount.toLocaleString("fa-IR")} سفارش در سیستم
          </p>
        </div>

        {/* FILTERS (PILLS) */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            href={buildOrdersHref()}
            label="همه"
            count={totalCount}
            active={!currentStatus}
          />

          {FILTER_ORDER.map((status) => (
            <FilterChip
              key={status}
              href={buildOrdersHref(status)}
              label={orderStatusLabelMap[status]}
              count={statusCounts[status]}
              active={currentStatus === status}
              tone={status}
            />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/85 p-10 text-center shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
            <p className="font-semibold">سفارشی پیدا نشد</p>
            <p className="mt-1 text-sm text-muted-foreground">
              فیلترها را تغییر دهید
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const user = order.user;
            const firstBookSnapshot = order.items[0]?.bookSnapshot as
              | BookSnapshot
              | undefined;
            const shippingAmount = order.total - order.subtotal;
            const itemSummary =
              order.items.length > 1
                ? `${firstBookSnapshot?.title ?? "بدون عنوان"} +${(order.items.length - 1).toLocaleString("fa-IR")}`
                : (firstBookSnapshot?.title ?? "—");

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,247,251,0.95))] p-4 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_-40px_rgba(15,23,42,0.5)] sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-2 border-b border-slate-200/70 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.24em] text-slate-500">
                      ORDER ISLAND
                    </p>
                    <h2 className="mt-1 text-lg font-black text-slate-950">
                      سفارش #{order.orderNumber}
                    </h2>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <IslandGrid>
                  <IslandCard
                    label="شماره سفارش"
                    title={`#${order.orderNumber}`}
                    meta={`نمایش سریع: ${order.id.slice(0, 8)}`}
                    icon={<ReceiptText className="size-4" aria-hidden />}
                  />

                  <IslandCard
                    label="مشتری"
                    title={user?.name ?? "کاربر ناشناس"}
                    meta={
                      <span dir="ltr" className="inline-block">
                        {user?.email ?? "—"}
                      </span>
                    }
                    icon={<UserRound className="size-4" aria-hidden />}
                  />

                  <IslandCard
                    label="مبلغ"
                    title={displayPrice(order.total)}
                    meta={`جمع کالا ${displayPrice(order.subtotal)}${
                      shippingAmount > 0
                        ? ` + ارسال ${displayPrice(shippingAmount)}`
                        : ""
                    }`}
                    icon={<CreditCard className="size-4" aria-hidden />}
                    contentClassName="space-y-1"
                    className="bg-[linear-gradient(180deg,rgba(255,247,237,0.94),rgba(255,255,255,0.98))]"
                  >
                    <div className="text-xs font-semibold text-orange-600">
                      قابل تسویه
                    </div>
                  </IslandCard>

                  <IslandCard
                    label="اقلام سفارش"
                    title={`${order.items.length.toLocaleString("fa-IR")} کتاب`}
                    meta={itemSummary}
                    icon={<Package2 className="size-4" aria-hidden />}
                  />

                  <IslandCard
                    label="وضعیت"
                    icon={<Layers3 className="size-4" aria-hidden />}
                    className="md:col-span-1"
                  >
                    <div className="flex min-h-16 items-center">
                      <StatusBadge status={order.status} />
                    </div>
                  </IslandCard>

                  <IslandCard
                    label="اقدامات"
                    icon={<Hash className="size-4" aria-hidden />}
                    className="xl:col-span-1"
                  >
                    <ActionGroup
                      detailsHref={`/admin/orders/${order.id}`}
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                    />
                  </IslandCard>
                </IslandGrid>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.38)]">
          <p className="text-sm text-slate-500">
            صفحه {currentPage.toLocaleString("fa-IR")} از{" "}
            {meta.totalPages.toLocaleString("fa-IR")}
          </p>

          <div className="flex gap-2">
            {meta.hasPrevPage && (
              <Link
                href={buildOrdersHref(currentStatus, currentPage - 1)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                قبلی
              </Link>
            )}

            {meta.hasNextPage && (
              <Link
                href={buildOrdersHref(currentStatus, currentPage + 1)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                بعدی
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
