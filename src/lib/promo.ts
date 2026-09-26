import { SITE } from '../data/site';
import type { Badge } from '../data/products';

// Ghana is on GMT all year, so UTC dates are local dates.
const start = Date.parse(`${SITE.promo.start}T00:00:00Z`);
const end = Date.parse(`${SITE.promo.end}T23:59:59Z`);

export const promoActive = (now: number = Date.now()): boolean => now >= start && now <= end;

export const promoEndsAt = end;

/** "Grand Opening" reads oddly once the event is over, so it becomes "Special Price". */
export const badgeLabel = (badge: Badge, now: number = Date.now()): string =>
  badge === 'Grand Opening' && !promoActive(now) ? 'Special Price' : badge;
