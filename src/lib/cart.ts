import type { Product, Variant } from '../data/products';

export interface CartLine {
  slug: string;
  variant: string;
  qty: number;
}

export interface ResolvedLine {
  line: CartLine;
  product: Product;
  variant: Variant & { price: number };
  total: number;
}

export const MAX_QTY = 10;

const clampQty = (qty: number): number => Math.min(MAX_QTY, Math.max(0, Math.floor(qty)));

const same = (a: CartLine, slug: string, variant: string): boolean =>
  a.slug === slug && a.variant === variant;

export function addLine(lines: readonly CartLine[], slug: string, variant: string, qty = 1): CartLine[] {
  const existing = lines.find((l) => same(l, slug, variant));
  if (existing) return setQty(lines, slug, variant, existing.qty + qty);
  const q = clampQty(qty);
  return q > 0 ? [...lines, { slug, variant, qty: q }] : [...lines];
}

export function setQty(lines: readonly CartLine[], slug: string, variant: string, qty: number): CartLine[] {
  const q = clampQty(qty);
  if (q === 0) return removeLine(lines, slug, variant);
  return lines.map((l) => (same(l, slug, variant) ? { ...l, qty: q } : l));
}

export const removeLine = (lines: readonly CartLine[], slug: string, variant: string): CartLine[] =>
  lines.filter((l) => !same(l, slug, variant));

export const itemCount = (lines: readonly CartLine[]): number => lines.reduce((n, l) => n + l.qty, 0);

/** Match lines to the catalogue; lines whose product/variant is gone or has no price are dropped. */
export function resolveLines(lines: readonly CartLine[], catalog: readonly Product[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = catalog.find((p) => p.slug === line.slug);
    const variant = product?.variants.find((v) => v.label === line.variant);
    if (!product || !variant || variant.price === null) continue;
    out.push({
      line,
      product,
      variant: { ...variant, price: variant.price },
      total: variant.price * line.qty,
    });
  }
  return out;
}

export const subtotal = (resolved: readonly ResolvedLine[]): number =>
  resolved.reduce((s, r) => s + r.total, 0);

/** Parse untrusted stored data into valid cart lines that exist in the catalogue. */
export function sanitize(raw: unknown, catalog: readonly Product[]): CartLine[] {
  if (!Array.isArray(raw)) return [];
  let lines: CartLine[] = [];
  for (const item of raw.slice(0, 50)) {
    if (typeof item !== 'object' || item === null) continue;
    const { slug, variant, qty } = item as Record<string, unknown>;
    if (typeof slug !== 'string' || typeof variant !== 'string') continue;
    if (typeof qty !== 'number' || !Number.isFinite(qty)) continue;
    lines = addLine(lines, slug, variant, qty);
  }
  const valid = new Set(resolveLines(lines, catalog).map((r) => `${r.line.slug}|${r.line.variant}`));
  return lines.filter((l) => valid.has(`${l.slug}|${l.variant}`));
}
