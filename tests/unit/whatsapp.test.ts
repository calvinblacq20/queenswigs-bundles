import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../../src/data/products';
import { resolveLines } from '../../src/lib/cart';
import { enquiryMessage, orderMessage, validateCheckout, waLink } from '../../src/lib/whatsapp';

describe('waLink', () => {
  it('strips non-digits from the phone and URL-encodes the text', () => {
    const url = waLink('+233 24 164 8058', 'Hi & hello\nline 2 #1');
    expect(url).toBe('https://wa.me/233241648058?text=Hi%20%26%20hello%0Aline%202%20%231');
  });
});

describe('validateCheckout', () => {
  it('requires a name', () => {
    const { errors } = validateCheckout({ name: ' ', area: '', fulfilment: 'pickup', note: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.area).toBeUndefined();
  });

  it('requires an area only for delivery', () => {
    expect(validateCheckout({ name: 'Ama', area: '', fulfilment: 'pickup', note: '' }).errors).toEqual({});
    expect(
      validateCheckout({ name: 'Ama', area: '', fulfilment: 'delivery', note: '' }).errors.area,
    ).toBeTruthy();
  });

  it('collapses whitespace and enforces length limits', () => {
    const { value } = validateCheckout({
      name: '  Ama    Mensah  ',
      area: 'x'.repeat(200),
      fulfilment: 'delivery',
      note: 'y'.repeat(1000),
    });
    expect(value.name).toBe('Ama Mensah');
    expect(value.area).toHaveLength(80);
    expect(value.note).toHaveLength(300);
  });

  it('falls back to pickup for an unexpected fulfilment value', () => {
    const input = { name: 'Ama', area: '', fulfilment: 'teleport', note: '' } as unknown as Parameters<
      typeof validateCheckout
    >[0];
    expect(validateCheckout(input).value.fulfilment).toBe('pickup');
  });
});

describe('orderMessage', () => {
  const lines = resolveLines(
    [
      { slug: 'ready-to-wear-bob', variant: '14"', qty: 2 },
      { slug: 'chioma-everyday', variant: 'No closure', qty: 1 },
    ],
    PRODUCTS,
  );

  it('lists each item, the subtotal, fulfilment and name', () => {
    const msg = orderMessage(lines, { name: 'Ama', area: 'Weija', fulfilment: 'delivery', note: 'Honey' });
    expect(msg).toContain('1. Glueless Ready-to-Wear Bob (14") x 2 = GH₵1,980');
    expect(msg).toContain('2. Chioma Everyday Wig (No closure) x 1 = GH₵280');
    expect(msg).toContain('Subtotal: GH₵2,260');
    expect(msg).toContain('Delivery to: Weija');
    expect(msg).toContain('Name: Ama');
    expect(msg).toContain('Note: Honey');
  });

  it('describes showroom pickup and omits an empty note', () => {
    const msg = orderMessage(lines, { name: 'Ama', area: '', fulfilment: 'pickup', note: '' });
    expect(msg).toContain('Pickup at the showroom');
    expect(msg).not.toContain('Note:');
  });
});

describe('enquiryMessage', () => {
  it('names the product and option', () => {
    const p = PRODUCTS.find((x) => x.slug === 'burmese-curls')!;
    expect(enquiryMessage(p, '30"')).toContain('Burmese Curls (30")');
  });
});
