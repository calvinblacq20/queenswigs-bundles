export type CategorySlug =
  'bounce-curls' | 'pixie-curls' | 'bob' | 'afro' | 'body-wave' | 'curly' | 'straight' | 'chioma' | 'bundles';

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  /** Image stem under /img (responsive widths 480/800/1200). */
  image: string;
}

export const CATEGORIES: readonly Category[] = [
  {
    slug: 'bounce-curls',
    name: 'Bounce Curls',
    blurb: 'Springy, super double drawn curls that hold their shape all day.',
    image: 'style-bounce',
  },
  {
    slug: 'pixie-curls',
    name: 'Pixie Curls',
    blurb: 'Tight, playful curls from cropped fringes to 22-inch drama.',
    image: 'style-pixie-curls',
  },
  {
    slug: 'bob',
    name: 'Bobs',
    blurb: 'Glueless, ready-to-wear bobs. Sharp lines, zero fuss.',
    image: 'style-bob',
  },
  {
    slug: 'afro',
    name: 'Afro Wigs',
    blurb: 'Full, soft volume that looks and feels like natural African hair.',
    image: 'style-afro',
  },
  {
    slug: 'body-wave',
    name: 'Body Wave',
    blurb: 'Loose, glossy waves in raw donor and 100% human hair.',
    image: 'hero-waves',
  },
  {
    slug: 'curly',
    name: 'Deep Wave & Curls',
    blurb: 'Water curls, Burmese and Royal Amara textures, full to the tips.',
    image: 'style-curls',
  },
  {
    slug: 'straight',
    name: 'Straight',
    blurb: 'Silky and bone straight, tangle-free, from 20 to 32 inches.',
    image: 'style-straight',
  },
  {
    slug: 'chioma',
    name: 'Chioma Wigs',
    blurb: 'Our everyday favourite. Real human hair from GH₵280.',
    image: 'style-pixie',
  },
  {
    slug: 'bundles',
    name: 'Bundles',
    blurb: 'Raw and virgin bundles for stylists, salons and resellers.',
    image: 'studio-bundles',
  },
];

export const categoryBySlug = (slug: string): Category | undefined => CATEGORIES.find((c) => c.slug === slug);
