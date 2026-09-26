import type { Product, Variant } from '../data/products';
import { formatCedis, savingsPercent } from '../lib/format';
import { html, type Raw } from '../lib/html';

let uid = 0;

/** Radio pills for a product's options. The first priced option is pre-selected. */
export function variantPicker(p: Product): Raw {
  const name = `variant-${++uid}`;
  const initial = p.variants.find((v) => v.price !== null) ?? p.variants[0]!;
  return html`<fieldset class="variants">
    <legend class="variants__legend">${p.variants.length > 1 ? 'Choose length / option' : 'Option'}</legend>
    <div class="variants__list">
      ${p.variants.map(
        (v) =>
          html`<label class="pill">
            <input type="radio" name="${name}" value="${v.label}" ${v === initial ? html`checked` : ''} />
            <span>${v.label}</span>
          </label>`,
      )}
    </div>
  </fieldset>`;
}

export const selectedVariant = (p: Product, root: ParentNode): Variant => {
  const value = root.querySelector<HTMLInputElement>('.variants input:checked')?.value;
  return p.variants.find((v) => v.label === value) ?? p.variants[0]!;
};

export function variantPriceMarkup(v: Variant): Raw {
  if (v.price === null) return html`<span class="price price--ask">Price on request</span>`;
  if (!v.compareAt) return html`<span class="price">${formatCedis(v.price)}</span>`;
  const off = savingsPercent(v.price, v.compareAt);
  return html`<span class="price price--sale">${formatCedis(v.price)}</span>
    <s class="price--was">${formatCedis(v.compareAt)}</s>
    ${off ? html`<span class="price__save">Save ${off}%</span>` : ''}`;
}
