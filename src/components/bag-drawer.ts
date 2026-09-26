import { SITE } from '../data/site';
import { bag } from '../lib/bag';
import { MAX_QTY, subtotal } from '../lib/cart';
import { trapFocus } from '../lib/dom';
import { formatCedis } from '../lib/format';
import { html } from '../lib/html';
import { productSrc } from '../lib/images';
import { lockScroll } from '../lib/motion';
import { openWhatsApp, orderMessage, validateCheckout, waLink, type CheckoutDetails } from '../lib/whatsapp';
import { icons } from './icons';
import { productUrl } from './product-card';
import { toast } from './toast';

let release: (() => void) | null = null;

const drawer = (): HTMLElement | null => document.getElementById('bag-drawer');

export function openBag(): void {
  const el = drawer();
  if (!el || el.classList.contains('is-open')) return;
  render();
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('is-open'));
  lockScroll(true);
  release = trapFocus(el.querySelector('.drawer__panel')!);
}

export function closeBag(): void {
  const el = drawer();
  if (!el || !el.classList.contains('is-open')) return;
  el.classList.remove('is-open');
  lockScroll(false);
  release?.();
  release = null;
  window.setTimeout(() => {
    if (!el.classList.contains('is-open')) el.hidden = true;
  }, 450);
}

function render(): void {
  const body = drawer()?.querySelector<HTMLElement>('[data-bag-body]');
  if (!body) return;
  const lines = bag.resolved();
  const title = drawer()?.querySelector('[data-bag-title]');
  if (title) title.textContent = `Your bag (${bag.count})`;

  if (!lines.length) {
    body.innerHTML = html`<div class="bag-empty">
      <p class="bag-empty__title">Your bag is empty</p>
      <p>Find a style you love, or send us a photo on WhatsApp and we will match it.</p>
      <a class="btn btn--solid" href="/shop.html">Shop all wigs</a>
    </div>`.value;
    return;
  }

  body.innerHTML = html`<ul class="bag-lines">
      ${lines.map(
        (r) =>
          html`<li class="bag-line">
            <a class="bag-line__img" href="${productUrl(r.product)}"
              ><img src="${productSrc(r.product.image)}" alt="" width="84" height="112" loading="lazy"
            /></a>
            <div class="bag-line__info">
              <a class="bag-line__name" href="${productUrl(r.product)}">${r.product.name}</a>
              <p class="bag-line__variant">${r.variant.label} · ${formatCedis(r.variant.price)}</p>
              <div class="qty" data-slug="${r.product.slug}" data-variant="${r.variant.label}">
                <button
                  type="button"
                  class="qty__btn"
                  data-step="-1"
                  aria-label="Decrease quantity of ${r.product.name}"
                >
                  ${icons.minus}
                </button>
                <span class="qty__value" aria-live="polite">${r.line.qty}</span>
                <button
                  type="button"
                  class="qty__btn"
                  data-step="1"
                  aria-label="Increase quantity of ${r.product.name}"
                  ${r.line.qty >= MAX_QTY ? html`disabled` : ''}
                >
                  ${icons.plus}
                </button>
                <button type="button" class="qty__remove" data-remove aria-label="Remove ${r.product.name}">
                  ${icons.trash}
                </button>
              </div>
            </div>
            <p class="bag-line__total">${formatCedis(r.total)}</p>
          </li>`,
      )}
    </ul>
    <div class="bag-foot">
      <p class="bag-subtotal"><span>Subtotal</span><span>${formatCedis(subtotal(lines))}</span></p>
      <p class="bag-note">Delivery fee and payment are confirmed with you on WhatsApp.</p>
      <form class="checkout" data-checkout novalidate>
        <div class="field">
          <label for="co-name">Your name</label>
          <input id="co-name" name="name" autocomplete="name" required maxlength="60" />
          <p class="field__error" id="co-name-err"></p>
        </div>
        <fieldset class="field field--inline">
          <legend>How would you like it?</legend>
          <label class="pill"
            ><input type="radio" name="fulfilment" value="pickup" checked /><span
              >Showroom pickup</span
            ></label
          >
          <label class="pill"
            ><input type="radio" name="fulfilment" value="delivery" /><span>Delivery</span></label
          >
        </fieldset>
        <div class="field">
          <label for="co-area">Town / area <span class="field__hint">(needed for delivery)</span></label>
          <input id="co-area" name="area" autocomplete="address-level2" maxlength="80" />
          <p class="field__error" id="co-area-err"></p>
        </div>
        <div class="field">
          <label for="co-note">Note <span class="field__hint">(colour, date needed…)</span></label>
          <textarea id="co-note" name="note" rows="2" maxlength="300"></textarea>
        </div>
        <button class="btn btn--wa btn--block" type="submit">${icons.whatsapp} Send order on WhatsApp</button>
      </form>
    </div>`.value;
}

function onSubmit(form: HTMLFormElement): void {
  const data = new FormData(form);
  const input: CheckoutDetails = {
    name: String(data.get('name') ?? ''),
    area: String(data.get('area') ?? ''),
    fulfilment: data.get('fulfilment') === 'delivery' ? 'delivery' : 'pickup',
    note: String(data.get('note') ?? ''),
  };
  const { value, errors } = validateCheckout(input);
  for (const key of ['name', 'area'] as const) {
    const field = form.querySelector<HTMLInputElement>(`[name="${key}"]`);
    const msg = form.querySelector(`#co-${key}-err`);
    if (msg) msg.textContent = errors[key] ?? '';
    field?.setAttribute('aria-invalid', String(!!errors[key]));
    if (errors[key]) field?.setAttribute('aria-describedby', `co-${key}-err`);
  }
  const first = Object.keys(errors)[0];
  if (first) {
    form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    return;
  }
  const url = waLink(SITE.whatsapp, orderMessage(bag.resolved(), value));
  openWhatsApp(url);
  toast('Opening WhatsApp. Your bag is saved until we confirm.');
}

export function initBagDrawer(): void {
  const el = drawer();
  if (!el) return;
  el.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-close-bag]')) return closeBag();
    const qty = t.closest<HTMLElement>('.qty');
    if (!qty) return;
    const slug = qty.dataset.slug!;
    const variant = qty.dataset.variant!;
    const step = t.closest<HTMLElement>('[data-step]');
    const line = bag.lines.find((l) => l.slug === slug && l.variant === variant);
    if (step && line) bag.setQty(slug, variant, line.qty + Number(step.dataset.step));
    if (t.closest('[data-remove]')) bag.remove(slug, variant);
  });
  el.addEventListener('submit', (e) => {
    const form = (e.target as HTMLElement).closest<HTMLFormElement>('[data-checkout]');
    if (!form) return;
    e.preventDefault();
    onSubmit(form);
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBag();
  });
  bag.subscribe(() => {
    if (!el.classList.contains('is-open')) return;
    // Preserve anything typed into the checkout form across re-renders.
    const form = el.querySelector<HTMLFormElement>('[data-checkout]');
    const saved = form ? new FormData(form) : null;
    render();
    if (saved) {
      const next = el.querySelector<HTMLFormElement>('[data-checkout]');
      saved.forEach((v, k) => {
        const field = next?.querySelector<HTMLInputElement>(`[name="${k}"]`);
        if (!field) return;
        if (field.type === 'radio') {
          next?.querySelector<HTMLInputElement>(`[name="${k}"][value="${String(v)}"]`)?.click();
        } else field.value = String(v);
      });
    }
  });
}
