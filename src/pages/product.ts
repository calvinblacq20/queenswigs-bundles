import '../styles/main.css';
import { openBag } from '../components/bag-drawer';
import { icons } from '../components/icons';
import { productCard } from '../components/product-card';
import { initShell } from '../components/shell';
import { toast } from '../components/toast';
import { selectedVariant, variantPicker, variantPriceMarkup } from '../components/variant-picker';
import { categoryBySlug } from '../data/categories';
import { PRODUCTS, productBySlug, type Product } from '../data/products';
import { SITE, tiktokVideo } from '../data/site';
import { bag } from '../lib/bag';
import { MAX_QTY } from '../lib/cart';
import { $, $$ } from '../lib/dom';
import { priceSummary } from '../lib/format';
import { html, type Raw } from '../lib/html';
import { productSrc, productSrcset } from '../lib/images';
import { badgeLabel } from '../lib/promo';
import { gsap, initMotion, reducedMotion, ScrollTrigger } from '../lib/motion';
import { enquiryMessage, openWhatsApp, waLink } from '../lib/whatsapp';

const root = $('[data-product]')!;
const slug = new URLSearchParams(window.location.search).get('p') ?? '';
const product = productBySlug(slug);

function notFound(): void {
  document.title = 'Style not found | Queens Wigs & Bundles';
  root.innerHTML = html`<div class="container not-found">
    <p class="eyebrow">Sold out or moved</p>
    <h1 class="display-md">We couldn’t find that style</h1>
    <p>It may have sold out or been renamed. Browse the full collection, or ask us on WhatsApp.</p>
    <div class="empty-state__actions">
      <a class="btn btn--solid" href="/shop.html">Shop all wigs</a>
      <a
        class="btn btn--outline"
        href="${waLink(SITE.whatsapp, 'Hello Queens Wigs & Bundles, I am looking for a style.')}"
        target="_blank"
        rel="noopener"
        >Ask on WhatsApp</a
      >
    </div>
  </div>`.value;
}

function gallery(p: Product): Raw {
  const images = [p.image, ...(p.gallery ?? [])];
  return html`<div class="pdp__gallery">
    <div class="pdp__stage" data-curtain>
      <img
        data-stage
        src="${productSrc(p.image)}"
        srcset="${productSrcset(p.image)}"
        sizes="(min-width: 900px) 50vw, 100vw"
        width="600"
        height="800"
        alt="${p.name}"
        fetchpriority="high"
      />
      ${p.badge ? html`<span class="badge badge--gold">${badgeLabel(p.badge)}</span>` : ''}
    </div>
    ${
      images.length > 1
        ? html`<div class="pdp__thumbs">
            ${images.map(
              (id, i) =>
                html`<button
                  type="button"
                  class="pdp__thumb"
                  data-thumb="${id}"
                  aria-label="Show image ${i + 1}"
                  aria-pressed="${String(i === 0)}"
                >
                  <img src="/img/p/${id}-360.webp" alt="" width="90" height="120" loading="lazy" />
                </button>`,
            )}
          </div>`
        : ''
    }
    <a class="pdp__tiktok" href="${tiktokVideo(p.image)}" target="_blank" rel="noopener">
      <img src="/img/p/${p.image}-360.webp" alt="" loading="lazy" width="90" height="120" />
      <span>${icons.play} Watch it on TikTok</span>
    </a>
  </div>`;
}

function render(p: Product): void {
  const cat = categoryBySlug(p.category);
  document.title = `${p.name} | Queens Wigs & Bundles`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${p.name}: ${p.description}`);

  root.innerHTML = html`<div class="container pdp">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a><span aria-hidden="true">/</span>
        <a href="/shop.html?c=${p.category}">${cat?.name ?? 'Shop'}</a><span aria-hidden="true">/</span>
        <span aria-current="page">${p.name}</span>
      </nav>
      <div class="pdp__grid">
        ${gallery(p)}
        <div class="pdp__info">
          <p class="eyebrow" data-reveal>${cat?.name ?? ''}</p>
          <h1 class="pdp__title" data-split>${p.name}</h1>
          <p class="pdp__price" data-price data-reveal></p>
          <p class="pdp__desc" data-reveal>${p.description}</p>
          <form class="pdp__form" data-form data-reveal>
            ${variantPicker(p)}
            <div class="pdp__buy">
              <div class="qty qty--lg" data-qty>
                <button type="button" class="qty__btn" data-step="-1" aria-label="Decrease quantity">
                  ${icons.minus}
                </button>
                <input
                  class="qty__input"
                  type="number"
                  inputmode="numeric"
                  min="1"
                  max="${MAX_QTY}"
                  value="1"
                  aria-label="Quantity"
                />
                <button type="button" class="qty__btn" data-step="1" aria-label="Increase quantity">
                  ${icons.plus}
                </button>
              </div>
              <button class="btn btn--solid btn--grow" type="submit" data-add data-magnetic>
                Add to bag
              </button>
            </div>
            <a class="btn btn--wa btn--block" data-ask target="_blank" rel="noopener"
              >${icons.whatsapp} Order or ask on WhatsApp</a
            >
          </form>
          <ul class="pdp__trust" data-stagger>
            <li><strong>Pickup in Kasoa</strong><span>Opeikuma showroom, beside Radiance Petroleum</span></li>
            <li><strong>Nationwide delivery</strong><span>Fee confirmed on WhatsApp</span></li>
            <li><strong>Try before you buy</strong><span>Visit and see the texture in person</span></li>
          </ul>
          <div class="accordion">
            <details class="faq__item" open>
              <summary>Details</summary>
              <div class="faq__body">
                <dl class="spec">
                  <dt>Hair</dt>
                  <dd>${p.hair}</dd>
                  <dt>Lace</dt>
                  <dd>${p.lace}</dd>
                  <dt>Options</dt>
                  <dd>${p.variants.map((v) => v.label).join(', ')}</dd>
                </dl>
              </div>
            </details>
            <details class="faq__item">
              <summary>Pickup & delivery</summary>
              <div class="faq__body">
                <p>
                  Collect from our showroom at Queens Plaza, Opeikuma Adom Junction, Kasoa, or have it
                  delivered anywhere in Ghana. We confirm availability, the delivery fee and payment with you
                  on WhatsApp before anything is sent.
                </p>
              </div>
            </details>
            <details class="faq__item">
              <summary>Care tips</summary>
              <div class="faq__body">
                <p>
                  Detangle gently from ends to roots, wash with sulphate-free shampoo, and air-dry on a stand.
                  Curly textures love a leave-in conditioner and a satin bonnet at night. Ask us about
                  revamping when it needs a refresh.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
    <section class="section related" aria-labelledby="related-title">
      <div class="container">
        <div class="section-head">
          <h2 class="section-title" id="related-title" data-split>You may also love</h2>
          <a class="link-underline" href="/shop.html?c=${p.category}">View all ${cat?.name ?? ''}</a>
        </div>
        <div class="grid grid--products" data-stagger>
          ${PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug)
            .concat(PRODUCTS.filter((x) => x.featured && x.category !== p.category))
            .slice(0, 4)
            .map((x) => productCard(x))}
        </div>
      </div>
    </section>
    <div class="buy-bar" data-buy-bar aria-hidden="true">
      <div class="buy-bar__info">
        <span class="buy-bar__name">${p.name}</span><span data-bar-price></span>
      </div>
      <button class="btn btn--solid" type="button" data-bar-add tabindex="-1">Add to bag</button>
    </div>`.value;

  structuredData(p);
  wire(p);
}

function wire(p: Product): void {
  const form = $<HTMLFormElement>('[data-form]', root)!;
  const priceEl = $('[data-price]', root)!;
  const addBtn = $<HTMLButtonElement>('[data-add]', root)!;
  const ask = $<HTMLAnchorElement>('[data-ask]', root)!;
  const qtyInput = $<HTMLInputElement>('.qty__input', root)!;
  const barPrice = $('[data-bar-price]', root);

  const qty = (): number => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(qtyInput.value) || 1)));

  const sync = (): void => {
    const v = selectedVariant(p, form);
    priceEl.innerHTML = variantPriceMarkup(v).value;
    if (barPrice) barPrice.innerHTML = variantPriceMarkup(v).value;
    addBtn.disabled = v.price === null;
    addBtn.textContent = v.price === null ? 'Price on request' : 'Add to bag';
    ask.href = waLink(SITE.whatsapp, enquiryMessage(p, v.label));
  };
  form.addEventListener('change', sync);
  $('[data-qty]', root)?.addEventListener('click', (e) => {
    const step = (e.target as HTMLElement).closest<HTMLElement>('[data-step]');
    if (step) qtyInput.value = String(Math.min(MAX_QTY, Math.max(1, qty() + Number(step.dataset.step))));
  });
  qtyInput.addEventListener('change', () => (qtyInput.value = String(qty())));

  const add = (): void => {
    const v = selectedVariant(p, form);
    if (v.price === null) {
      openWhatsApp(ask.href);
      return;
    }
    bag.add(p.slug, v.label, qty());
    toast(`${p.name} (${v.label}) added to your bag`);
    openBag();
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    add();
  });
  $('[data-bar-add]', root)?.addEventListener('click', add);
  sync();

  // Thumbnails swap the stage image with a quick wipe.
  const stage = $<HTMLImageElement>('[data-stage]', root);
  $$<HTMLButtonElement>('[data-thumb]', root).forEach((btn) =>
    btn.addEventListener('click', () => {
      if (!stage) return;
      const id = btn.dataset.thumb!;
      $$('[data-thumb]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      stage.src = productSrc(id);
      stage.srcset = productSrcset(id);
      if (!reducedMotion)
        gsap.fromTo(
          stage,
          { clipPath: 'inset(0 0 0 100%)', scale: 1.1 },
          { clipPath: 'inset(0 0 0 0%)', scale: 1, duration: 0.9, ease: 'expo.out' },
        );
    }),
  );

  // Sticky buy bar slides up once the main button scrolls away (mobile).
  const bar = $('[data-buy-bar]', root);
  if (bar) {
    ScrollTrigger.create({
      trigger: addBtn,
      start: 'bottom top',
      endTrigger: '.related',
      end: 'top bottom',
      onToggle: (self) => {
        bar.classList.toggle('is-visible', self.isActive);
        bar.setAttribute('aria-hidden', String(!self.isActive));
        $<HTMLButtonElement>('[data-bar-add]', bar)!.tabIndex = self.isActive ? 0 : -1;
      },
    });
  }
}

function structuredData(p: Product): void {
  const { from } = priceSummary(p);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: `${SITE.url}${productSrc(p.image)}`,
    brand: { '@type': 'Brand', name: SITE.name },
    category: categoryBySlug(p.category)?.name,
    ...(from !== null && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'GHS',
        lowPrice: from,
        highPrice: Math.max(...p.variants.map((v) => v.price ?? 0)),
        offerCount: p.variants.length,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: SITE.name },
      },
    }),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data);
  document.head.append(s);
}

initShell();
if (product) render(product);
else notFound();
initMotion();
