import { Suspense } from "react";
import type { Metadata } from "next";
import { OrdersTable } from "@/components/admin/orders-table";
import { findAllOrders, getOrderStatusCounts } from "@/repositories/order.repository";

export const metadata: Metadata = { title: "مدیریت سفارش‌ها" };

type SearchParams = Promise<{ page?: string; status?: string }>;

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const status = sp.status as "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | undefined;

  const [{ items: orders, meta }, statusCounts] = await Promise.all([
    findAllOrders({ status }, { page, pageSize: 15 }),
    getOrderStatusCounts(),
  ]);

  return (
    <OrdersTable
      orders={orders}
      meta={meta}
      currentPage={page}
      currentStatus={status}
      statusCounts={statusCounts}
    />
  );
}

export default function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
