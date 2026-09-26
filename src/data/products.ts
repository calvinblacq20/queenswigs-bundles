import type { CategorySlug } from './categories';

export interface Variant {
  /** What the customer picks, e.g. `14"` or `No closure`. */
  label: string;
  /** Price in Ghana cedis; `null` means "price on request". */
  price: number | null;
  /** Previous price, shown struck through during promotions. */
  compareAt?: number;
}

export type Badge = 'Grand Opening' | 'Best Seller' | 'New' | 'Limited';

export interface Product {
  slug: string;
  name: string;
  category: CategorySlug;
  lace: string;
  hair: string;
  description: string;
  /** TikTok video id — also the image stem under /img/p and /img/tall. */
  image: string;
  gallery?: readonly string[];
  badge?: Badge;
  featured?: boolean;
  variants: readonly Variant[];
}

const HH = '100% human hair';

// Prices and details come from the shop's own TikTok posts (Sept 2026).
// Update here and redeploy when prices change.
export const PRODUCTS: readonly Product[] = [
  // ——— Bounce curls ———
  {
    slug: 'gray-bounce-curls',
    name: 'Gray Bounce Curls',
    category: 'bounce-curls',
    lace: 'HD lace closure',
    hair: `${HH} · super double drawn`,
    description:
      'A cool, steel-toned bounce that photographs like a dream. Short, full and styled to sit perfectly from day one.',
    image: '7680334740309822728',
    badge: 'Best Seller',
    featured: true,
    variants: [{ label: '12"', price: 990, compareAt: 1250 }],
  },
  {
    slug: 'blonde-bounce-curls',
    name: 'Blonde Bounce Curls',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description:
      'Buttery blonde curls with serious volume. The grand-opening favourite for birthdays, weddings and every weekend in between.',
    image: '7678381959915097362',
    badge: 'Grand Opening',
    featured: true,
    variants: [{ label: '12"', price: 990, compareAt: 1260 }],
  },
  {
    slug: 'honey-bounce-curls',
    name: 'Honey Bounce Curls, Glueless',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure · glueless',
    hair: `${HH} · super double drawn`,
    description: 'Warm honey curls on a glueless cap. Put it on, adjust, and go. No glue, no gel, no stress.',
    image: '7687804147281743122',
    badge: 'Grand Opening',
    variants: [{ label: '12"', price: 990 }],
  },
  {
    slug: 'short-bounce-curls',
    name: 'Short Bounce Curls',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: HH,
    description:
      'Golden-brown highlights through a short, swingy bounce. Playful, polished and easy to wear.',
    image: '7680682282218179847',
    badge: 'Grand Opening',
    variants: [{ label: '12"', price: 990, compareAt: 1250 }],
  },
  {
    slug: 'signature-bounce-curls',
    name: 'Signature Bounce Curls',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description:
      'Our signature curl pattern in natural black, available from 12 to 22 inches. Ask on WhatsApp for the longer lengths.',
    image: '7687293774036241671',
    variants: [
      { label: '12"', price: 1770 },
      { label: '14"', price: null },
      { label: '16"', price: null },
      { label: '18"', price: null },
      { label: '20"', price: null },
      { label: '22"', price: null },
    ],
  },
  {
    slug: 'two-shade-bounce-curls',
    name: 'Bounce Curls, Black or Orange-Brown',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description: 'The same luxurious bounce in two moods: classic black or a warm orange-brown.',
    image: '7659775558951259399',
    variants: [
      { label: '14" Black', price: 1670 },
      { label: '14" Orange-Brown', price: 1750 },
      { label: '20" Black', price: 2520 },
      { label: '20" Orange', price: 2650 },
    ],
  },
  {
    slug: 'sdd-bounce-curls-14-16',
    name: 'SDD Bounce Curls, 14" & 16"',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description: 'Mid-length bounce that sits on the shoulders. Full from root to tip.',
    image: '7683994428326923538',
    variants: [
      { label: '14"', price: 1670 },
      { label: '16"', price: null },
    ],
  },
  {
    slug: 'copper-bounce-curls',
    name: 'Copper Bounce Curls',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description: 'A head-turning copper that glows under every light. Long, soft and full of movement.',
    image: '7687392970164817170',
    badge: 'New',
    featured: true,
    variants: [{ label: '20"', price: 2650 }],
  },
  {
    slug: 'chestnut-bounce-curls',
    name: 'Chestnut Bounce Curls',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description: 'Rich chestnut brown with a sleek, glossy bounce. Soft to touch and easy to maintain.',
    image: '7687394679465217287',
    variants: [{ label: '20"', price: 2650 }],
  },
  {
    slug: 'jet-black-bounce-curls',
    name: 'Jet Black Bounce Curls',
    category: 'bounce-curls',
    lace: '4×4 HD lace closure',
    hair: HH,
    description: 'Sleek, soft and long. Timeless jet black curls that suit every occasion.',
    image: '7687390996706970887',
    variants: [{ label: '20"', price: 2520 }],
  },
  {
    slug: 'auburn-frontal-bounce-curls',
    name: 'Auburn Frontal Bounce Curls',
    category: 'bounce-curls',
    lace: 'HD lace frontal',
    hair: `${HH} · double drawn`,
    description:
      'A frontal unit in a deep auburn for the most natural hairline. Sold unstyled, so you or your stylist can shape it your way.',
    image: '7687398022757600520',
    variants: [{ label: '20"', price: 2500 }],
  },
  {
    slug: 'piano-bounce-curls',
    name: 'Piano Bounce Curls',
    category: 'bounce-curls',
    lace: 'Kim K HD lace closure',
    hair: `${HH} · double drawn`,
    description: 'Dark orange and black blended in piano streaks. Bold colour, beautifully balanced.',
    image: '7683117064483015954',
    variants: [
      { label: '12"', price: 1450 },
      { label: '22"', price: null },
    ],
  },
  {
    slug: 'kim-k-loose-bounce-curls',
    name: 'Kim K Loose Bounce Curls',
    category: 'bounce-curls',
    lace: 'Kim K HD lace closure',
    hair: HH,
    description: 'A looser, softer bounce with a wide middle part. Effortless glamour.',
    image: '7682752253781904648',
    variants: [{ label: '16"', price: null }],
  },
  {
    slug: 'ginger-brown-bounce-curls',
    name: 'Ginger Brown Bounce Curls',
    category: 'bounce-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description: 'Ginger with a brown depth that flatters every skin tone. A colour that gets compliments.',
    image: '7682750358065548552',
    variants: [{ label: '14"', price: null }],
  },

  // ——— Pixie curls ———
  {
    slug: 'sdd-pixie-curls',
    name: 'SDD Pixie Curls',
    category: 'pixie-curls',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description:
      'Luxury pixie curls that stay soft, full and defined, long after the first wash. This is not your regular curly wig.',
    image: '7681086289755589896',
    badge: 'Best Seller',
    featured: true,
    variants: [
      { label: '14"', price: 1850 },
      { label: '18"', price: 2280 },
      { label: '22"', price: 2800 },
    ],
  },
  {
    slug: 'two-tone-loose-pixie-curls',
    name: 'Two-Tone Loose Pixie Curls',
    category: 'pixie-curls',
    lace: '5×5 HD lace closure',
    hair: HH,
    description: 'Dark roots melting into honey ends. Loose, touchable curls with easy volume.',
    image: '7686284854404746504',
    badge: 'Grand Opening',
    variants: [{ label: '16"', price: 980 }],
  },
  {
    slug: 'pixie-curls-fringe',
    name: 'Pixie Curls with Fringe',
    category: 'pixie-curls',
    lace: 'Fringe unit · no lace needed',
    hair: `${HH} · super double drawn`,
    description: 'Curly fringe, zero installation. Available in several unique colours; tell us your shade.',
    image: '7681076248092708114',
    badge: 'Grand Opening',
    variants: [{ label: '12"', price: 1300, compareAt: 1450 }],
  },

  // ——— Chioma ———
  {
    slug: 'chioma-everyday',
    name: 'Chioma Everyday Wig',
    category: 'chioma',
    lace: 'With or without 4×4 closure',
    hair: HH,
    description:
      'Proof that quality does not have to cost a fortune. Real human hair in many colours and styles, built to last.',
    image: '7686862319070006546',
    badge: 'Best Seller',
    featured: true,
    variants: [
      { label: 'No closure', price: 280 },
      { label: '4×4 closure', price: 350 },
    ],
  },
  {
    slug: 'chioma-in-colours',
    name: 'Chioma in Colours',
    category: 'chioma',
    lace: 'Closure unit',
    hair: HH,
    description: 'Freshly restocked in every colour. One price, whatever shade you choose.',
    image: '7680130860493950226',
    variants: [{ label: 'All colours', price: 415 }],
  },
  {
    slug: 'chioma-5x5-closure',
    name: 'Chioma Pixie, 5×5 HD Closure',
    category: 'chioma',
    lace: '5×5 HD lace closure',
    hair: HH,
    description: 'The Chioma you love, upgraded with a 5×5 HD closure for a softer, more natural part.',
    image: '7688666296442981640',
    variants: [{ label: 'One size', price: 990 }],
  },
  {
    slug: 'glueless-frontal-chioma',
    name: 'Glueless Frontal Chioma',
    category: 'chioma',
    lace: 'HD lace frontal · glueless',
    hair: HH,
    description: 'Copper Chioma curls on a glueless frontal. Ear-to-ear hairline, no adhesive.',
    image: '7688665591825042696',
    badge: 'New',
    variants: [{ label: 'One size', price: 1380 }],
  },

  // ——— Bobs ———
  {
    slug: 'ready-to-wear-bob',
    name: 'Glueless Ready-to-Wear Bob',
    category: 'bob',
    lace: '5×5 HD lace closure · glueless',
    hair: HH,
    description:
      'Our hot-cake bob. Cut, styled and ready the moment it arrives. Glueless, lightweight and office-to-evening perfect.',
    image: '7686859660946574610',
    badge: 'Best Seller',
    featured: true,
    variants: [
      { label: '12"', price: 950 },
      { label: '14"', price: 990 },
    ],
  },
  {
    slug: 'kim-k-bob',
    name: 'Kim K Bob',
    category: 'bob',
    lace: 'Kim K HD lace closure',
    hair: HH,
    description:
      'A blunt, glossy bob with a deep Kim K part. Available in colours. Pick yours in the showroom.',
    image: '7687758107526712584',
    badge: 'Grand Opening',
    featured: true,
    variants: [{ label: '10"', price: 880 }],
  },
  {
    slug: 'frontal-bob-wave',
    name: 'Frontal Bob Wave',
    category: 'bob',
    lace: 'HD lace frontal',
    hair: HH,
    description: 'A soft wave through a jaw-length bob on a frontal. Feminine, fresh and easy to style.',
    image: '7686291569778904338',
    badge: 'Grand Opening',
    variants: [{ label: 'One size', price: 880 }],
  },
  {
    slug: 'bone-straight-bob',
    name: 'Bone Straight Bob',
    category: 'bob',
    lace: '2×6 Kim K lace closure',
    hair: `${HH} · double drawn`,
    description: 'Pin-straight, swingy and sharp. Value for less without cutting corners.',
    image: '7679375259631389959',
    variants: [{ label: '10"', price: 880, compareAt: 1150 }],
  },
  {
    slug: 'pixie-cut-bob',
    name: 'Pixie Cut Bob',
    category: 'bob',
    lace: '5×5 HD lace closure',
    hair: HH,
    description: 'A short, confident cut in black, burgundy and silver tones. Low maintenance, high impact.',
    image: '7678689809438739719',
    badge: 'Grand Opening',
    variants: [{ label: 'One size', price: 720, compareAt: 900 }],
  },

  // ——— Afro ———
  {
    slug: 'max-afro',
    name: 'Max Afro',
    category: 'afro',
    lace: 'Wig cap',
    hair: HH,
    description:
      'Soft, shiny, voluminous. The Max Afro looks and feels like real African hair, just bigger and bolder.',
    image: '7678350853614554376',
    featured: true,
    variants: [{ label: 'One size', price: 1500, compareAt: 1750 }],
  },
  {
    slug: 'big-afro',
    name: 'Big Afro',
    category: 'afro',
    lace: 'Wig cap',
    hair: `${HH} · super double drawn`,
    description: 'A full, rounded afro in natural black or beautiful colours. The hair no woman can resist.',
    image: '7676802069440843026',
    gallery: ['7681272044100701448'],
    variants: [{ label: '12"', price: 980 }],
  },
  {
    slug: 'short-afro-glueless-frontal',
    name: 'Short Afro, 13×1 Glueless Frontal',
    category: 'afro',
    lace: '13×1 glueless lace frontal',
    hair: HH,
    description: 'A tapered short afro with a real-looking hairline. Everyday-easy at an everyday price.',
    image: '7686855777700678920',
    variants: [{ label: 'One size', price: 510 }],
  },

  // ——— Body wave ———
  {
    slug: 'classic-body-wave',
    name: 'Classic Body Wave',
    category: 'body-wave',
    lace: 'HD lace closure',
    hair: HH,
    description: 'Glossy, loose waves that fall beautifully past the shoulders. A wardrobe essential.',
    image: '7685920997119249671',
    badge: 'Grand Opening',
    variants: [{ label: 'One size', price: 990, compareAt: 1450 }],
  },
  {
    slug: 'raw-donor-body-wave',
    name: 'Raw Donor Body Wave',
    category: 'body-wave',
    lace: '5×5 HD lace closure',
    hair: 'Raw donor hair · super double drawn',
    description: 'Our most luxurious waves: raw donor hair, dense from root to tip, in statement lengths.',
    image: '7655398312509443335',
    badge: 'Limited',
    featured: true,
    variants: [
      { label: '24"', price: 2750 },
      { label: '28"', price: 3130 },
      { label: '30"', price: 3870 },
    ],
  },

  // ——— Deep wave & curls ———
  {
    slug: 'raw-donor-deep-wave',
    name: 'Raw Donor Deep Wave',
    category: 'curly',
    lace: '5×5 HD lace closure',
    hair: 'Raw donor hair · super double drawn',
    description: 'Water curls that are soft to touch, sleek and full right to the tips.',
    image: '7659760711014436103',
    gallery: ['7659756577985072391'],
    variants: [
      { label: '14"', price: 2200 },
      { label: '16"', price: 2350 },
      { label: '20"', price: 2700 },
    ],
  },
  {
    slug: 'royal-amara-curls',
    name: 'Royal Amara Curls',
    category: 'curly',
    lace: '5×5 HD lace closure',
    hair: '100% natural human hair',
    description: 'Soft, bouncy and lightweight, yet wonderfully voluminous. Curls fit for royalty.',
    image: '7672546885579590920',
    badge: 'New',
    variants: [
      { label: '14"', price: 1980 },
      { label: '16"', price: 2280 },
    ],
  },
  {
    slug: 'burmese-curls',
    name: 'Burmese Curls',
    category: 'curly',
    lace: '5×5 HD lace closure · thin, wide lace',
    hair: `${HH} · super double drawn`,
    description:
      'Thirty inches of voluminous Burmese curls. Very limited stock, so message us for today’s price.',
    image: '7684359754239528210',
    badge: 'Limited',
    variants: [{ label: '30"', price: null }],
  },

  // ——— Straight ———
  {
    slug: 'premium-straight',
    name: 'Premium Straight',
    category: 'straight',
    lace: '5×5 HD lace closure',
    hair: `${HH} · super double drawn`,
    description: 'Long, silky and dead straight. Only the best strands, in dramatic lengths.',
    image: '7659803547285867784',
    variants: [
      { label: '24"', price: 2750 },
      { label: '28"', price: 3120 },
      { label: '32"', price: 3870 },
    ],
  },
  {
    slug: 'silky-straight',
    name: 'Silky Straight',
    category: 'straight',
    lace: 'HD lace closure',
    hair: HH,
    description: 'Soft, sleek and tangle-free straight hair at a price that works for everyone.',
    image: '7658005396954598664',
    variants: [
      { label: '20"', price: 1480 },
      { label: '22"', price: 1680 },
      { label: '24"', price: 1800 },
    ],
  },

  // ——— Bundles ———
  {
    slug: 'sdd-body-wave-bundle',
    name: 'SDD Body Wave Bundle',
    category: 'bundles',
    lace: 'Bundle · per piece',
    hair: `${HH} · super double drawn`,
    description:
      'Two bundles are enough for a full, glamorous install. Priced per bundle; wholesale rates on request.',
    image: '7686809612133141778',
    variants: [{ label: '24" (per bundle)', price: 1080 }],
  },
  {
    slug: 'bundles-collection',
    name: 'Bone Straight & Wave Bundles',
    category: 'bundles',
    lace: 'Bundles · all lengths',
    hair: 'Vietnamese bone straight, body wave, pixie curls & more',
    description:
      'Bone straight, body wave, pixie curls and normal straight bundles in every length and colour. Stylists and resellers welcome.',
    image: '7686585702624005383',
    variants: [{ label: 'Choose on WhatsApp', price: null }],
  },
];

export const productBySlug = (slug: string): Product | undefined => PRODUCTS.find((p) => p.slug === slug);
