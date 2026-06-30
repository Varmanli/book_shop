import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

// Keys used to store shipping config in the settings table
const SHIPPING_COST_KEY = "shippingCost";
const FREE_THRESHOLD_KEY = "freeShippingThreshold";

/** Fallback values used when no DB row exists yet. */
const SHIPPING_DEFAULTS = {
  shippingCost: 350_000,
  freeShippingThreshold: null as number | null,
};

/**
 * Returns the admin-configured shipping cost and optional free-shipping
 * threshold.  Falls back to hardcoded defaults only when the DB has no
 * matching row (i.e. before the admin has saved the settings for the
 * first time).
 */
export async function getShippingSettings(): Promise<{
  shippingCost: number;
  freeShippingThreshold: number | null;
}> {
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, [SHIPPING_COST_KEY, FREE_THRESHOLD_KEY]),
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    shippingCost:
      typeof map[SHIPPING_COST_KEY] === "number"
        ? (map[SHIPPING_COST_KEY] as number)
        : SHIPPING_DEFAULTS.shippingCost,
    freeShippingThreshold:
      typeof map[FREE_THRESHOLD_KEY] === "number"
        ? (map[FREE_THRESHOLD_KEY] as number)
        : SHIPPING_DEFAULTS.freeShippingThreshold,
  };
}

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
