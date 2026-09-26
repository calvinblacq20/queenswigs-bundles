import type { CategorySlug } from '../data/categories';
import type { Product } from '../data/products';
import { priceSummary } from './format';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

export interface CatalogQuery {
  category?: CategorySlug | 'sale' | undefined;
  maxPrice?: number | undefined;
  q?: string | undefined;
  sort?: SortKey | undefined;
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s]/g, ' ');

export const onSale = (p: Product): boolean =>
  p.badge === 'Grand Opening' || p.variants.some((v) => v.compareAt !== undefined);

export function queryCatalog(products: readonly Product[], query: CatalogQuery): Product[] {
  const terms = norm(query.q ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const out = products.filter((p) => {
    if (query.category === 'sale' && !onSale(p)) return false;
    if (query.category && query.category !== 'sale' && p.category !== query.category) return false;
    if (query.maxPrice !== undefined) {
      const { from } = priceSummary(p);
      if (from === null || from > query.maxPrice) return false;
    }
    if (terms.length) {
      const hay = norm(`${p.name} ${p.category} ${p.lace} ${p.hair} ${p.description}`);
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const low = (p: Product): number => priceSummary(p).from ?? Number.POSITIVE_INFINITY;
  const high = (p: Product): number => priceSummary(p).from ?? -1;
  switch (query.sort ?? 'featured') {
    case 'price-asc':
      return out.sort((a, b) => low(a) - low(b));
    case 'price-desc':
      return out.sort((a, b) => high(b) - high(a));
    case 'name':
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
      return out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}

export const isSortKey = (s: string | null): s is SortKey =>
  s === 'featured' || s === 'price-asc' || s === 'price-desc' || s === 'name';
