import '../styles/main.css';
import { initCarousels } from '../components/carousel';
import { initHero } from '../components/hero';
import { productCard } from '../components/product-card';
import { initShell } from '../components/shell';
import { initTabs } from '../components/tabs';
import { PRODUCTS, type Product } from '../data/products';
import { onSale } from '../lib/catalog';
import { $, $$ } from '../lib/dom';
import { gsap, initMotion, reducedMotion, staggerIn } from '../lib/motion';

const SETS: Record<string, (p: Product) => boolean> = {
  loved: (p) => !!p.featured,
  deals: onSale,
  new: (p) => p.badge === 'New' || p.badge === 'Limited',
};

function bestSellers(): void {
  const grid = $('[data-best-sellers]');
  if (!grid) return;
  const render = (key: string, animate: boolean): void => {
    const list = PRODUCTS.filter(SETS[key] ?? SETS.loved!).slice(0, 8);
    grid.innerHTML = list.map((p) => productCard(p).value).join('');
    if (animate && !reducedMotion) {
      gsap.fromTo(
        grid.children,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.8, ease: 'power3.out' },
      );
    }
  };
  render('loved', false);
  const pills = $$<HTMLButtonElement>('[data-set]');
  pills.forEach((pill) =>
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.setAttribute('aria-pressed', String(p === pill)));
      render(pill.dataset.set!, true);
    }),
  );
}

// Keep "38 styles" copy in sync with the catalogue.
for (const el of $$('[data-product-count]')) {
  el.textContent = String(PRODUCTS.length);
  if (el.dataset.count) el.dataset.count = String(PRODUCTS.length);
}

initShell();
bestSellers();
initCarousels();
initTabs();
initHero();
initMotion();
staggerIn();
