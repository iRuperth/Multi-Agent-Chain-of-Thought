export function eur(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function pct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}

export function discountPct(pvp: number | null, price: number | null): number | null {
  if (!pvp || !price) return null;
  return Math.round((1 - price / pvp) * 1000) / 10;
}

export function merchantRevenue(price: number | null, commission: number): number | null {
  if (price === null) return null;
  return Math.round(price * (1 - commission / 100) * 100) / 100;
}

export function marginPerUnit(
  price: number | null,
  commission: number,
  cost: number | null
): number | null {
  const rev = merchantRevenue(price, commission);
  if (rev === null || cost === null) return null;
  return Math.round((rev - cost) * 100) / 100;
}
