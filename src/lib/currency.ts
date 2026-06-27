const LOCALE = "fa-IR";
const CURRENCY = "IRR";

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
}

export function formatPriceCompact(cents: number): string {
  return new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
  }).format(cents);
}

export function centsToAmount(cents: number): number {
  return cents / 100;
}

export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function displayPrice(cents: number): string {
  return `${(cents / 10).toLocaleString("fa-IR")} تومان`;
}
