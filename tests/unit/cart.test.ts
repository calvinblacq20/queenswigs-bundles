import { describe, expect, it } from 'vitest';
import type { Product } from '../../src/data/products';
import {
  addLine,
  itemCount,
  MAX_QTY,
  removeLine,
  resolveLines,
  sanitize,
  setQty,
  subtotal,
} from '../../src/lib/cart';

const catalog: Product[] = [
  {
    slug: 'bob',
    name: 'Bob',
    category: 'bob',
    lace: '5×5',
    hair: 'HH',
    description: '',
    image: '1',
    variants: [
      { label: '12"', price: 950 },
      { label: '14"', price: 990 },
    ],
  },
  {
    slug: 'burmese',
    name: 'Burmese',
    category: 'curly',
    lace: '5×5',
    hair: 'HH',
    description: '',
    image: '2',
    variants: [{ label: '30"', price: null }],
  },
];

describe('cart lines', () => {
  it('adds a new line and merges repeats of the same variant', () => {
    let lines = addLine([], 'bob', '12"');
    lines = addLine(lines, 'bob', '12"', 2);
    lines = addLine(lines, 'bob', '14"');
    expect(lines).toEqual([
      { slug: 'bob', variant: '12"', qty: 3 },
      { slug: 'bob', variant: '14"', qty: 1 },
    ]);
    expect(itemCount(lines)).toBe(4);
  });

  it('caps quantity at MAX_QTY', () => {
    const lines = addLine([], 'bob', '12"', 99);
    expect(lines[0]!.qty).toBe(MAX_QTY);
    expect(setQty(lines, 'bob', '12"', 42)[0]!.qty).toBe(MAX_QTY);
  });

  it('removes a line when quantity drops to zero or below', () => {
    const lines = addLine([], 'bob', '12"', 2);
    expect(setQty(lines, 'bob', '12"', 0)).toEqual([]);
    expect(setQty(lines, 'bob', '12"', -5)).toEqual([]);
    expect(removeLine(lines, 'bob', '12"')).toEqual([]);
  });

  it('ignores adding zero or negative quantities', () => {
    expect(addLine([], 'bob', '12"', 0)).toEqual([]);
    expect(addLine([], 'bob', '12"', -1)).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const lines = Object.freeze([{ slug: 'bob', variant: '12"', qty: 1 }]);
    expect(() => addLine(lines, 'bob', '12"')).not.toThrow();
    expect(lines[0]!.qty).toBe(1);
  });
});

describe('resolveLines / subtotal', () => {
  it('prices lines from the catalogue', () => {
    const resolved = resolveLines(
      [
        { slug: 'bob', variant: '12"', qty: 2 },
        { slug: 'bob', variant: '14"', qty: 1 },
      ],
      catalog,
    );
    expect(resolved.map((r) => r.total)).toEqual([1900, 990]);
    expect(subtotal(resolved)).toBe(2890);
  });

  it('drops unknown products, unknown variants and price-on-request variants', () => {
    const resolved = resolveLines(
      [
        { slug: 'gone', variant: '12"', qty: 1 },
        { slug: 'bob', variant: '99"', qty: 1 },
        { slug: 'burmese', variant: '30"', qty: 1 },
      ],
      catalog,
    );
    expect(resolved).toEqual([]);
  });
});

describe('sanitize (untrusted storage)', () => {
  it('returns [] for non-arrays', () => {
    expect(sanitize(null, catalog)).toEqual([]);
    expect(sanitize({ slug: 'bob' }, catalog)).toEqual([]);
    expect(sanitize('[]', catalog)).toEqual([]);
  });

  it('keeps valid lines and discards malformed or stale ones', () => {
    const raw = [
      { slug: 'bob', variant: '12"', qty: 1 },
      { slug: 'bob', variant: '12"', qty: 2 },
      { slug: 'bob', variant: '14"', qty: 'lots' },
      { slug: 'bob', variant: '14"', qty: Number.NaN },
      { slug: 'bob', variant: '14"', qty: Infinity },
      { slug: 'burmese', variant: '30"', qty: 1 },
      { slug: 'deleted', variant: '12"', qty: 1 },
      null,
      42,
      { slug: '<img onerror=alert(1)>', variant: '12"', qty: 1 },
    ];
    expect(sanitize(raw, catalog)).toEqual([{ slug: 'bob', variant: '12"', qty: 3 }]);
  });

  it('clamps stored quantities', () => {
    expect(sanitize([{ slug: 'bob', variant: '12"', qty: 5000 }], catalog)[0]!.qty).toBe(MAX_QTY);
  });
});
