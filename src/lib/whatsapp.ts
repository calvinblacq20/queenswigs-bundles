import type { Product } from '../data/products';
import type { ResolvedLine } from './cart';
import { subtotal } from './cart';
import { formatCedis } from './format';

export type Fulfilment = 'pickup' | 'delivery';

export interface CheckoutDetails {
  name: string;
  area: string;
  fulfilment: Fulfilment;
  note: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutDetails, string>>;

export const waLink = (phone: string, text: string): string =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

/**
 * Open WhatsApp in a new tab, keeping the shop open. (`noopener` would make window.open
 * always return null, so the opener is cleared by hand instead.) Falls back to same-tab
 * navigation only when a pop-up blocker really stopped the new tab.
 */
export function openWhatsApp(url: string): void {
  const win = window.open(url, '_blank');
  if (win) win.opener = null;
  else window.location.href = url;
}

const clean = (s: string, max: number): string => s.replace(/\s+/g, ' ').trim().slice(0, max);

export function validateCheckout(input: CheckoutDetails): { value: CheckoutDetails; errors: CheckoutErrors } {
  const value: CheckoutDetails = {
    name: clean(input.name, 60),
    area: clean(input.area, 80),
    fulfilment: input.fulfilment === 'delivery' ? 'delivery' : 'pickup',
    note: clean(input.note, 300),
  };
  const errors: CheckoutErrors = {};
  if (value.name.length < 2) errors.name = 'Please enter your name.';
  if (value.fulfilment === 'delivery' && value.area.length < 2) {
    errors.area = 'Tell us your town or area so we can quote delivery.';
  }
  return { value, errors };
}

export function orderMessage(lines: readonly ResolvedLine[], d: CheckoutDetails): string {
  const items = lines.map(
    (r, i) => `${i + 1}. ${r.product.name} (${r.variant.label}) x ${r.line.qty} = ${formatCedis(r.total)}`,
  );
  const how =
    d.fulfilment === 'delivery'
      ? `Delivery to: ${d.area}`
      : `Pickup at the showroom (Opeikuma, Kasoa)${d.area ? ` - I am in ${d.area}` : ''}`;
  return [
    'Hello Queens Wigs & Bundles,',
    'I would like to order:',
    '',
    ...items,
    '',
    `Subtotal: ${formatCedis(subtotal(lines))}`,
    how,
    `Name: ${d.name}`,
    ...(d.note ? [`Note: ${d.note}`] : []),
    '',
    'Please confirm availability and the total. Thank you!',
  ].join('\n');
}

export function enquiryMessage(product: Product, variant?: string): string {
  return [
    'Hello Queens Wigs & Bundles,',
    `I am interested in the ${product.name}${variant ? ` (${variant})` : ''}.`,
    'Is it available, and what is the price?',
  ].join('\n');
}
