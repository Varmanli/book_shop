import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export async function getSetting(key: string) {
  const row = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  return row?.value ?? null;
}

export async function getAllSettings() {
  const rows = await db.query.settings.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSetting(key: string, value: unknown) {
  const [row] = await db
    .insert(settings)
    .values({ key, value: value as any })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: value as any, updatedAt: new Date() },
    })
    .returning();
  return row;
}
