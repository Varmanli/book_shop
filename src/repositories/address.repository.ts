import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import type { CreateAddressInput, UpdateAddressInput } from "@/validations/address.schema";

export async function findAddressesByUserId(userId: string) {
  return db.query.addresses.findMany({
    where: eq(addresses.userId, userId),
    orderBy: (a, { desc }) => desc(a.isDefault),
  });
}

export async function findAddressById(id: string) {
  return db.query.addresses.findFirst({ where: eq(addresses.id, id) });
}

export async function findDefaultAddress(userId: string) {
  return db.query.addresses.findFirst({
    where: and(eq(addresses.userId, userId), eq(addresses.isDefault, true)),
  });
}

export async function createAddress(userId: string, data: CreateAddressInput) {
  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
  }
  const [address] = await db
    .insert(addresses)
    .values({ ...data, userId })
    .returning();
  return address;
}

export async function updateAddress(id: string, userId: string, data: UpdateAddressInput) {
  if (data.isDefault) {
    await db
      .update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
  }
  const [updated] = await db
    .update(addresses)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning();
  return updated;
}

export async function deleteAddress(id: string, userId: string) {
  const [deleted] = await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning();
  return deleted;
}
