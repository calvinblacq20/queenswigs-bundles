export const SITE = {
  name: 'Queens Wigs & Bundles',
  shortName: 'Queens',
  tagline: 'Classy Hair, Classy You.',
  url: 'https://queenswigsandbundlesgh.com',
  whatsapp: '233241648058',
  phones: [
    { label: '024 164 8058', tel: '+233241648058' },
    { label: '050 442 6604', tel: '+233504426604' },
  ],
  email: 'info@queenswigsandbundlesgh.com',
  address: {
    line1: 'Queens Plaza, Opeikuma Adom Junction',
    line2: 'Beside Radiance Petroleum, Kasoa',
    region: 'Central Region, Ghana',
    plusCode: 'GHR2+CX Kasoa',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Queens+Wigs+%26+Bundles+Opeikuma+Kasoa',
  hours: [
    { days: 'Monday – Saturday', time: '9:00 am – 8:00 pm' },
    { days: 'Sunday', time: '10:00 am – 3:00 pm' },
  ],
  social: {
    tiktok: 'https://www.tiktok.com/@queens_wigsandbun',
    instagram: 'https://www.instagram.com/queens_wigsandbundles/',
    facebook: 'https://www.facebook.com/Queenswigsandbundle',
  },
  /** Grand-opening promotion window (inclusive, Africa/Accra). */
  promo: { start: '2026-09-25', end: '2026-09-30' },
} as const;

export const tiktokVideo = (id: string): string => `${SITE.social.tiktok}/video/${id}`;
