import type { Product } from '../data/products';

const grouping = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export const formatCedis = (amount: number): string => `GH₵${grouping.format(amount)}`;

export interface PriceSummary {
  /** Lowest known price, or null when every option is price-on-request. */
  from: number | null;
  /** Compare-at price attached to the lowest price, for sale display. */
  compareAt: number | null;
  /** True when the product has more than one distinct price. */
  varies: boolean;
}

export function priceSummary(product: Product): PriceSummary {
  const priced = product.variants.filter((v) => v.price !== null) as { price: number; compareAt?: number }[];
  if (priced.length === 0) return { from: null, compareAt: null, varies: false };
  const cheapest = priced.reduce((a, b) => (b.price < a.price ? b : a));
  const distinct = new Set(priced.map((v) => v.price));
  return { from: cheapest.price, compareAt: cheapest.compareAt ?? null, varies: distinct.size > 1 };
}

export const savingsPercent = (price: number, compareAt: number): number =>
  compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

export const optionsLabel = (product: Product): string => {
  const n = product.variants.length;
  return n > 1 ? `${n} options available` : product.variants[0]!.label;
};
