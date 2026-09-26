const EDIT_WIDTHS = [480, 800, 1200, 1600] as const;
const STUDIO = new Set(['studio-ombre-bob', 'studio-bundles', 'studio-burgundy-bob', 'grand-opening-flyer']);

/** srcset for editorial/stock images under /img. */
export function editSrcset(stem: string): string {
  const widths = STUDIO.has(stem) ? EDIT_WIDTHS.slice(0, 3) : EDIT_WIDTHS;
  return widths.map((w) => `/img/${stem}-${w}.webp ${w}w`).join(', ');
}

export const editSrc = (stem: string, w: 480 | 800 | 1200 = 800): string => `/img/${stem}-${w}.webp`;

export const productSrcset = (id: string): string => `/img/p/${id}-360.webp 360w, /img/p/${id}-600.webp 600w`;
export const productSrc = (id: string): string => `/img/p/${id}-600.webp`;

export const tallSrcset = (id: string): string =>
  `/img/tall/${id}-360.webp 360w, /img/tall/${id}-720.webp 720w`;
export const tallSrc = (id: string): string => `/img/tall/${id}-720.webp`;
