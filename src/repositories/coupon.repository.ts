import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import type { NewCoupon } from "@/db/schema/coupons";
import { normalizePagination, buildPaginationMeta } from "@/lib/pagination";
import { count } from "drizzle-orm";
import type { PaginationParams } from "@/types/api";

export async function findCouponByCode(code: string) {
  return db.query.coupons.findFirst({
    where: eq(coupons.code, code.toUpperCase()),
  });
}

export async function findCouponById(id: string) {
  return db.query.coupons.findFirst({ where: eq(coupons.id, id) });
}

export async function findAllCoupons(pagination: PaginationParams = {}) {
  const { page, pageSize, offset } = normalizePagination(pagination);

  const [rows, [{ total }]] = await Promise.all([
    db.query.coupons.findMany({
      orderBy: (c, { desc }) => desc(c.createdAt),
      limit: pageSize,
      offset,
    }),
    db.select({ total: count() }).from(coupons),
  ]);

  return { items: rows, meta: buildPaginationMeta(Number(total), page, pageSize) };
}

export async function createCoupon(data: NewCoupon) {
  const [coupon] = await db
    .insert(coupons)
    .values({ ...data, code: data.code.toUpperCase() })
    .returning();
  return coupon;
}

export async function updateCoupon(id: string, data: Partial<NewCoupon>) {
  const [updated] = await db
    .update(coupons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning();
  return updated;
}

export async function deleteCoupon(id: string) {
  const [deleted] = await db
    .delete(coupons)
    .where(eq(coupons.id, id))
    .returning();
  return deleted;
}

/** Atomically increment usedCount. Called after successful order creation. */
export async function incrementCouponUsage(code: string) {
  await db
    .update(coupons)
    .set({
      usedCount: sql`${coupons.usedCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(coupons.code, code.toUpperCase()));
}
