import { and, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { transactions, orders } from "@/db/schema";
import type { NewTransaction } from "@/db/schema/transactions";

export async function createTransactions(rows: Omit<NewTransaction, "id">[]) {
  if (rows.length === 0) return [];
  return db.insert(transactions).values(rows).returning();
}

export async function findTransactionsByOrderId(orderId: string) {
  return db.query.transactions.findMany({
    where: eq(transactions.orderId, orderId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });
}

export interface FinanceStats {
  totalRevenue: number;
  totalShipping: number;
  totalDiscounts: number;
  netRevenue: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
}

export async function getFinanceStats(): Promise<FinanceStats> {
  const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

  // Run all counts/sums in parallel
  const [
    paymentSum,
    shippingSum,
    discountSum,
    paidCount,
    pendingCount,
    cancelledCount,
  ] = await Promise.all([
    // Sum PAYMENT transactions for paid orders
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .innerJoin(orders, eq(transactions.orderId, orders.id))
      .where(
        and(
          eq(transactions.type, "PAYMENT"),
          sql`${orders.status} = ANY(ARRAY['PAID','PROCESSING','SHIPPED','DELIVERED']::order_status[])`
        )
      ),

    // Sum SHIPPING transactions for paid orders
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .innerJoin(orders, eq(transactions.orderId, orders.id))
      .where(
        and(
          eq(transactions.type, "SHIPPING"),
          sql`${orders.status} = ANY(ARRAY['PAID','PROCESSING','SHIPPED','DELIVERED']::order_status[])`
        )
      ),

    // Sum DISCOUNT transactions (stored as negative, return absolute)
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.type, "DISCOUNT")),

    // Count paid orders
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(orders)
      .where(sql`status = ANY(ARRAY['PAID','PROCESSING','SHIPPED','DELIVERED']::order_status[])`),

    // Count pending
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "PENDING")),

    // Count cancelled
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "CANCELLED")),
  ]);

  const totalRevenue = Number(paymentSum[0]?.total ?? 0);
  const totalShipping = Number(shippingSum[0]?.total ?? 0);
  const totalDiscounts = Math.abs(Number(discountSum[0]?.total ?? 0));
  const netRevenue = totalRevenue + totalShipping - totalDiscounts;

  return {
    totalRevenue,
    totalShipping,
    totalDiscounts,
    netRevenue,
    paidOrdersCount: Number(paidCount[0]?.c ?? 0),
    pendingOrdersCount: Number(pendingCount[0]?.c ?? 0),
    cancelledOrdersCount: Number(cancelledCount[0]?.c ?? 0),
  };
}

/** Last N days of daily revenue for the trend chart. */
export async function getDailyRevenue(days = 7): Promise<{ date: string; revenue: number }[]> {
  const rows = await db.execute(sql`
    SELECT
      date_trunc('day', t.created_at)::date::text AS date,
      COALESCE(SUM(t.amount), 0)::int             AS revenue
    FROM transactions t
    INNER JOIN orders o ON t.order_id = o.id
    WHERE t.type = 'PAYMENT'
      AND t.created_at >= NOW() - (${days} || ' days')::interval
      AND o.status = ANY(ARRAY['PAID','PROCESSING','SHIPPED','DELIVERED']::order_status[])
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return (rows as unknown as { date: string; revenue: number }[]).map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
  }));
}

/** Last N months of monthly revenue for the trend chart. */
export async function getMonthlyRevenue(months = 6): Promise<{ month: string; revenue: number }[]> {
  const rows = await db.execute(sql`
    SELECT
      to_char(date_trunc('month', t.created_at), 'YYYY-MM') AS month,
      COALESCE(SUM(t.amount), 0)::int                       AS revenue
    FROM transactions t
    INNER JOIN orders o ON t.order_id = o.id
    WHERE t.type = 'PAYMENT'
      AND t.created_at >= date_trunc('month', NOW()) - (${months - 1} || ' months')::interval
      AND o.status = ANY(ARRAY['PAID','PROCESSING','SHIPPED','DELIVERED']::order_status[])
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return (rows as unknown as { month: string; revenue: number }[]).map((r) => ({
    month: r.month,
    revenue: Number(r.revenue),
  }));
}
