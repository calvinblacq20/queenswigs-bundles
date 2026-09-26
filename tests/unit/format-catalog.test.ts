import { describe, expect, it } from 'vitest';
import { PRODUCTS, type Product } from '../../src/data/products';
import { isSortKey, onSale, queryCatalog } from '../../src/lib/catalog';
import { formatCedis, optionsLabel, priceSummary, savingsPercent } from '../../src/lib/format';
import { esc, html } from '../../src/lib/html';
import { badgeLabel, promoActive } from '../../src/lib/promo';

const make = (over: Partial<Product>): Product => ({
  slug: 'x',
  name: 'X',
  category: 'bob',
  lace: '',
  hair: '',
  description: '',
  image: '1',
  variants: [{ label: 'One size', price: 100 }],
  ...over,
});

describe('formatCedis', () => {
  it('groups thousands with the cedi sign', () => {
    expect(formatCedis(280)).toBe('GH₵280');
    expect(formatCedis(3870)).toBe('GH₵3,870');
    expect(formatCedis(1234567)).toBe('GH₵1,234,567');
  });
});

describe('priceSummary', () => {
  it('finds the lowest price and whether prices vary', () => {
    const p = make({
      variants: [
        { label: '22"', price: 2800 },
        { label: '14"', price: 1850, compareAt: 2000 },
      ],
    });
    expect(priceSummary(p)).toEqual({ from: 1850, compareAt: 2000, varies: true });
  });

  it('returns null when every option is price on request', () => {
    expect(priceSummary(make({ variants: [{ label: '30"', price: null }] })).from).toBeNull();
  });

  it('ignores price-on-request options when others are priced', () => {
    const p = make({
      variants: [
        { label: '12"', price: 1770 },
        { label: '22"', price: null },
      ],
    });
    expect(priceSummary(p)).toEqual({ from: 1770, compareAt: null, varies: false });
  });
});

describe('savingsPercent / optionsLabel', () => {
  it('rounds the discount and never goes negative', () => {
    expect(savingsPercent(990, 1450)).toBe(32);
    expect(savingsPercent(1000, 900)).toBe(0);
  });

  it('labels single vs multiple options', () => {
    expect(optionsLabel(make({}))).toBe('One size');
    expect(
      optionsLabel(
        make({
          variants: [
            { label: 'a', price: 1 },
            { label: 'b', price: 2 },
          ],
        }),
      ),
    ).toBe('2 options available');
  });
});

describe('queryCatalog', () => {
  it('filters by category', () => {
    const bobs = queryCatalog(PRODUCTS, { category: 'bob' });
    expect(bobs.length).toBeGreaterThan(0);
    expect(bobs.every((p) => p.category === 'bob')).toBe(true);
  });

  it('filters sale items', () => {
    const sale = queryCatalog(PRODUCTS, { category: 'sale' });
    expect(sale.length).toBeGreaterThan(0);
    expect(sale.every(onSale)).toBe(true);
  });

  it('excludes price-on-request items when a max price is set', () => {
    const cheap = queryCatalog(PRODUCTS, { maxPrice: 500 });
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((p) => (priceSummary(p).from ?? Infinity) <= 500)).toBe(true);
  });

  it('matches every search term, case- and punctuation-insensitively', () => {
    expect(queryCatalog(PRODUCTS, { q: 'GLUELESS bob' }).map((p) => p.slug)).toContain('ready-to-wear-bob');
    expect(queryCatalog(PRODUCTS, { q: 'raw-donor' }).length).toBeGreaterThan(0);
    expect(queryCatalog(PRODUCTS, { q: 'zzzz-not-a-wig' })).toEqual([]);
  });

  it('sorts by price with price-on-request last when ascending', () => {
    const asc = queryCatalog(PRODUCTS, { sort: 'price-asc' });
    const prices = asc.map((p) => priceSummary(p).from ?? Infinity);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    const desc = queryCatalog(PRODUCTS, { sort: 'price-desc' }).map((p) => priceSummary(p).from ?? -1);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('does not reorder or mutate the source catalogue', () => {
    const before = PRODUCTS.map((p) => p.slug);
    queryCatalog(PRODUCTS, { sort: 'name' });
    expect(PRODUCTS.map((p) => p.slug)).toEqual(before);
  });

  it('validates sort keys from the URL', () => {
    expect(isSortKey('price-asc')).toBe(true);
    expect(isSortKey('drop table')).toBe(false);
    expect(isSortKey(null)).toBe(false);
  });
});

describe('html escaping', () => {
  it('escapes interpolated values', () => {
    expect(esc(`<script>"x"&'y'</script>`)).toBe(
      '&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;',
    );
    expect(html`<p>${'<b>'}</p>`.value).toBe('<p>&lt;b&gt;</p>');
  });

  it('does not double-escape nested templates and skips empty values', () => {
    const inner = html`<b>${'a&b'}</b>`;
    expect(html`<p>${inner}${null}${false}${undefined}</p>`.value).toBe('<p><b>a&amp;b</b></p>');
    const list = html`<ul>${['<i>', html`<li>ok</li>`]}</ul>`;
    expect(list.value).toBe('<ul>&lt;i&gt;<li>ok</li></ul>');
  });
});

describe('promo window', () => {
  it('is active from 25 Sept 00:00 to 30 Sept 23:59:59 GMT', () => {
    expect(promoActive(Date.parse('2026-09-24T23:59:59Z'))).toBe(false);
    expect(promoActive(Date.parse('2026-09-25T00:00:00Z'))).toBe(true);
    expect(promoActive(Date.parse('2026-09-30T23:59:59Z'))).toBe(true);
    expect(promoActive(Date.parse('2026-10-01T00:00:00Z'))).toBe(false);
  });

  it('renames the Grand Opening badge after the event', () => {
    expect(badgeLabel('Grand Opening', Date.parse('2026-09-26T12:00:00Z'))).toBe('Grand Opening');
    expect(badgeLabel('Grand Opening', Date.parse('2026-10-05T12:00:00Z'))).toBe('Special Price');
    expect(badgeLabel('Best Seller', Date.parse('2026-10-05T12:00:00Z'))).toBe('Best Seller');
  });
});
