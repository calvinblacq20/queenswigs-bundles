import { categoryBySlug } from '../data/categories';
import { productBySlug, type Product } from '../data/products';
import { SITE } from '../data/site';
import { bag } from '../lib/bag';
import { html } from '../lib/html';
import { productSrc, productSrcset } from '../lib/images';
import { lockScroll } from '../lib/motion';
import { enquiryMessage, waLink } from '../lib/whatsapp';
import { openBag } from './bag-drawer';
import { icons } from './icons';
import { productUrl } from './product-card';
import { selectedVariant, variantPicker, variantPriceMarkup } from './variant-picker';

function dialog(): HTMLDialogElement {
  let d = document.getElementById('quick-view') as HTMLDialogElement | null;
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'quick-view';
    d.className = 'qv';
    d.setAttribute('aria-labelledby', 'qv-title');
    d.addEventListener('close', () => lockScroll(false));
    // Click on the backdrop closes.
    d.addEventListener('click', (e) => {
      if (e.target === d) d?.close();
    });
    document.body.append(d);
  }
  return d;
}

function render(p: Product): string {
  return html`<div class="qv__inner">
    <button class="icon-btn qv__close" type="button" data-close aria-label="Close quick view">
      ${icons.close}
    </button>
    <div class="qv__media">
      <img
        src="${productSrc(p.image)}"
        srcset="${productSrcset(p.image)}"
        sizes="(min-width: 800px) 40vw, 90vw"
        width="600"
        height="800"
        alt="${p.name}"
      />
    </div>
    <div class="qv__body">
      <p class="eyebrow">${categoryBySlug(p.category)?.name ?? ''}</p>
      <h2 class="qv__title" id="qv-title">${p.name}</h2>
      <p class="qv__price" data-price></p>
      <p class="qv__spec">${p.lace}<br />${p.hair}</p>
      <p class="qv__desc">${p.description}</p>
      <form class="qv__form" data-form>
        ${variantPicker(p)}
        <div class="qv__actions">
          <button class="btn btn--solid btn--block" type="submit" data-add>Add to bag</button>
          <a class="btn btn--outline btn--block" data-ask target="_blank" rel="noopener"
            >${icons.whatsapp} Ask on WhatsApp</a
          >
        </div>
      </form>
      <a class="link-underline" href="${productUrl(p)}">View full details</a>
    </div>
  </div>`.value;
}

export function openQuickView(slug: string): void {
  const p = productBySlug(slug);
  if (!p) return;
  // Browsers without <dialog> (iOS < 15.4) go straight to the product page.
  if (typeof HTMLDialogElement !== 'function') {
    window.location.href = productUrl(p);
    return;
  }
  const d = dialog();
  d.innerHTML = render(p);
  const form = d.querySelector<HTMLFormElement>('[data-form]')!;
  const priceEl = d.querySelector<HTMLElement>('[data-price]')!;
  const addBtn = d.querySelector<HTMLButtonElement>('[data-add]')!;
  const ask = d.querySelector<HTMLAnchorElement>('[data-ask]')!;

  const sync = (): void => {
    const v = selectedVariant(p, form);
    priceEl.innerHTML = variantPriceMarkup(v).value;
    addBtn.disabled = v.price === null;
    addBtn.textContent = v.price === null ? 'Ask for price' : 'Add to bag';
    ask.href = waLink(SITE.whatsapp, enquiryMessage(p, v.label));
  };
  form.addEventListener('change', sync);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = selectedVariant(p, form);
    if (v.price === null) return;
    bag.add(p.slug, v.label);
    d.close();
    openBag();
  });
  d.querySelector('[data-close]')?.addEventListener('click', () => d.close());
  sync();
  lockScroll(true);
  d.showModal();
}
