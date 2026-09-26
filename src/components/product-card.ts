import { categoryBySlug } from '../data/categories';
import type { Product } from '../data/products';
import { formatCedis, optionsLabel, priceSummary } from '../lib/format';
import { html, type Raw } from '../lib/html';
import { productSrc, productSrcset } from '../lib/images';
import { badgeLabel } from '../lib/promo';

export const productUrl = (p: Product): string => `/product.html?p=${encodeURIComponent(p.slug)}`;

export function priceMarkup(p: Product): Raw {
  const { from, compareAt, varies } = priceSummary(p);
  if (from === null) return html`<span class="price price--ask">Price on request</span>`;
  const label = `${varies ? 'From ' : ''}${formatCedis(from)}`;
  return compareAt
    ? html`<span class="price price--sale">${label}</span>
        <s class="price--was">${formatCedis(compareAt)}</s>`
    : html`<span class="price">${label}</span>`;
}

export function productCard(p: Product, eager = false): Raw {
  const url = productUrl(p);
  const category = categoryBySlug(p.category)?.name ?? '';
  return html`<article class="card" data-slug="${p.slug}">
    <div class="card__media">
      <a href="${url}" tabindex="-1" aria-hidden="true">
        <img
          src="${productSrc(p.image)}"
          srcset="${productSrcset(p.image)}"
          sizes="(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw"
          width="600"
          height="800"
          alt="${p.name}, ${category}"
          loading="${eager ? 'eager' : 'lazy'}"
          decoding="async"
        />
      </a>
      ${p.badge ? html`<span class="badge badge--${p.badge === 'Limited' ? 'ink' : 'gold'}">${badgeLabel(p.badge)}</span>` : ''}
      <button class="card__quick" type="button" data-quick="${p.slug}">Quick view</button>
    </div>
    <div class="card__body">
      <p class="card__kicker">${category}</p>
      <h3 class="card__title"><a href="${url}">${p.name}</a></h3>
      <p class="card__price">${priceMarkup(p)}</p>
      <p class="card__meta">${p.lace} · ${optionsLabel(p)}</p>
    </div>
  </article>`;
}
