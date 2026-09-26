import '../styles/main.css';
import { productCard } from '../components/product-card';
import { initShell } from '../components/shell';
import { CATEGORIES, categoryBySlug, type CategorySlug } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { SITE } from '../data/site';
import { waLink } from '../lib/whatsapp';
import { isSortKey, queryCatalog, type CatalogQuery } from '../lib/catalog';
import { $, $$ } from '../lib/dom';
import { html } from '../lib/html';
import { editSrc, editSrcset } from '../lib/images';
import { gsap, initMotion, reducedMotion, ScrollTrigger } from '../lib/motion';

const params = new URLSearchParams(window.location.search);

function readQuery(): CatalogQuery {
  const c = params.get('c');
  const max = Number(params.get('max'));
  const sort = params.get('sort');
  return {
    category: c === 'sale' ? 'sale' : categoryBySlug(c ?? '') ? (c as CategorySlug) : undefined,
    q: (params.get('q') ?? '').slice(0, 60) || undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? max : undefined,
    sort: isSortKey(sort) ? sort : 'featured',
  };
}

function writeQuery(q: CatalogQuery): void {
  const next = new URLSearchParams();
  if (q.category) next.set('c', q.category);
  if (q.q) next.set('q', q.q);
  if (q.maxPrice) next.set('max', String(q.maxPrice));
  if (q.sort && q.sort !== 'featured') next.set('sort', q.sort);
  const qs = next.toString();
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

function header(q: CatalogQuery): void {
  const cat = q.category && q.category !== 'sale' ? categoryBySlug(q.category) : undefined;
  const title = $('[data-collection-title]');
  const blurb = $('[data-collection-blurb]');
  const img = $<HTMLImageElement>('[data-collection-img]');
  const name = cat?.name ?? (q.category === 'sale' ? 'Grand Opening Deals' : 'Shop All Wigs');
  if (title) title.textContent = q.q ? `Results for “${q.q}”` : name;
  if (blurb) {
    blurb.textContent =
      cat?.blurb ??
      (q.category === 'sale'
        ? 'Reduced prices on 100% human hair to celebrate our new showroom in Kasoa.'
        : 'Every texture, every length. 100% human hair, available for pickup in Kasoa or delivered nationwide.');
  }
  if (img && cat) {
    img.src = editSrc(cat.image);
    img.srcset = editSrcset(cat.image);
  }
  document.title = `${name} | Queens Wigs & Bundles`;
}

function render(q: CatalogQuery, animate: boolean): void {
  const grid = $('[data-grid]')!;
  const count = $('[data-count-label]');
  const list = queryCatalog(PRODUCTS, q);
  if (count) count.textContent = `${list.length} style${list.length === 1 ? '' : 's'}`;
  header(q);
  if (!list.length) {
    grid.innerHTML = html`<div class="empty-state">
      <p class="empty-state__title">No styles match yet</p>
      <p>Try another texture or price, or send us a photo on WhatsApp. We restock every week.</p>
      <div class="empty-state__actions">
        <button class="btn btn--solid" type="button" data-reset>Clear filters</button>
        <a
          class="btn btn--outline"
          data-wa="Hello Queens Wigs & Bundles, I am looking for a style I could not find on your website."
          >Ask on WhatsApp</a
        >
      </div>
    </div>`.value;
    $('[data-reset]', grid)?.addEventListener('click', () => apply({ sort: 'featured' }));
    const wa = $<HTMLAnchorElement>('[data-wa]', grid);
    if (wa) {
      wa.href = waLink(SITE.whatsapp, wa.dataset.wa!);
      wa.target = '_blank';
      wa.rel = 'noopener';
    }
    return;
  }
  grid.innerHTML = list.map((p, i) => productCard(p, i < 4).value).join('');
  if (animate && !reducedMotion) {
    gsap.fromTo(
      grid.children,
      { y: 50, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.8, ease: 'power3.out' },
    );
  } else if (!reducedMotion) {
    gsap.set(grid.children, { y: 36, autoAlpha: 0 });
    ScrollTrigger.batch(Array.from(grid.children), {
      start: 'top bottom',
      once: true,
      onEnter: (b) => gsap.to(b, { y: 0, autoAlpha: 1, stagger: 0.08, duration: 1, ease: 'power3.out' }),
    });
  }
  ScrollTrigger.refresh();
}

let state = readQuery();

function syncControls(): void {
  $$<HTMLButtonElement>('[data-filter-cat]').forEach((b) =>
    b.setAttribute('aria-pressed', String((b.dataset.filterCat || undefined) === state.category)),
  );
  const sort = $<HTMLSelectElement>('#sort');
  if (sort) sort.value = state.sort ?? 'featured';
  const max = $<HTMLSelectElement>('#max-price');
  if (max) max.value = state.maxPrice ? String(state.maxPrice) : '';
  const search = $<HTMLInputElement>('#shop-search');
  if (search && document.activeElement !== search) search.value = state.q ?? '';
}

function apply(next: CatalogQuery): void {
  state = next;
  writeQuery(state);
  syncControls();
  render(state, true);
}

function controls(): void {
  const pills = $('[data-cat-pills]');
  if (pills) {
    pills.innerHTML = html`<button class="chip" type="button" data-filter-cat="">All</button>
      <button class="chip chip--sale" type="button" data-filter-cat="sale" data-promo-label>Deals</button>
      ${CATEGORIES.map((c) => html`<button class="chip" type="button" data-filter-cat="${c.slug}">${c.name}</button>`)}`.value;
    pills.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filter-cat]');
      if (!b) return;
      const value = b.dataset.filterCat as CatalogQuery['category'] | '';
      apply({ ...state, category: value || undefined });
      b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    });
  }
  $<HTMLSelectElement>('#sort')?.addEventListener('change', (e) => {
    const v = (e.target as HTMLSelectElement).value;
    apply({ ...state, sort: isSortKey(v) ? v : 'featured' });
  });
  $<HTMLSelectElement>('#max-price')?.addEventListener('change', (e) => {
    const v = Number((e.target as HTMLSelectElement).value);
    apply({ ...state, maxPrice: v > 0 ? v : undefined });
  });
  let t: number | undefined;
  $<HTMLInputElement>('#shop-search')?.addEventListener('input', (e) => {
    window.clearTimeout(t);
    const v = (e.target as HTMLInputElement).value.slice(0, 60);
    t = window.setTimeout(() => apply({ ...state, q: v.trim() || undefined }), 250);
  });
  $('[data-shop-search-form]')?.addEventListener('submit', (e) => e.preventDefault());
}

initShell();
controls();
syncControls();
render(state, false);
initMotion();
