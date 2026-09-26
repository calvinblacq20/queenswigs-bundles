import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../../src/data/categories';
import { PRODUCTS } from '../../src/data/products';

const pub = resolve(import.meta.dirname, '../../public');

// Guards the hand-edited catalogue: a typo here would break a live product page.
describe('catalogue integrity', () => {
  it('has unique slugs', () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses URL-safe slugs', () => {
    for (const p of PRODUCTS) expect(p.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('only references known categories, and every category has products', () => {
    const known = new Set(CATEGORIES.map((c) => c.slug));
    for (const p of PRODUCTS) expect(known.has(p.category)).toBe(true);
    for (const c of CATEGORIES) expect(PRODUCTS.some((p) => p.category === c.slug)).toBe(true);
  });

  it('has at least one option per product, with unique labels and sane prices', () => {
    for (const p of PRODUCTS) {
      expect(p.variants.length).toBeGreaterThan(0);
      const labels = p.variants.map((v) => v.label);
      expect(new Set(labels).size).toBe(labels.length);
      for (const v of p.variants) {
        if (v.price !== null) {
          expect(Number.isInteger(v.price)).toBe(true);
          expect(v.price).toBeGreaterThan(0);
        }
        if (v.compareAt !== undefined) expect(v.compareAt).toBeGreaterThan(v.price ?? 0);
      }
    }
  });

  it('has optimised images for every product and gallery shot', () => {
    for (const p of PRODUCTS) {
      for (const id of [p.image, ...(p.gallery ?? [])]) {
        for (const w of [360, 600])
          expect(existsSync(`${pub}/img/p/${id}-${w}.webp`), `${p.slug} ${id}-${w}`).toBe(true);
      }
    }
  });

  it('has images for every category tile', () => {
    for (const c of CATEGORIES) expect(existsSync(`${pub}/img/${c.image}-800.webp`), c.slug).toBe(true);
  });
});
