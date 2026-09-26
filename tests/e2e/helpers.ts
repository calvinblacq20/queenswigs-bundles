import type { Page, TestInfo } from '@playwright/test';

export const PAGES = [
  { slug: 'home', url: '/' },
  { slug: 'shop', url: '/shop.html' },
  { slug: 'shop-bob', url: '/shop.html?c=bob' },
  { slug: 'product', url: '/product.html?p=sdd-pixie-curls' },
  { slug: 'product-gallery', url: '/product.html?p=big-afro' },
  { slug: 'product-on-request', url: '/product.html?p=burmese-curls' },
  { slug: 'product-missing', url: '/product.html?p=nope' },
  { slug: 'visit', url: '/visit.html' },
  { slug: 'policies', url: '/policies.html' },
  { slug: '404', url: '/404.html' },
] as const;

/** Collect page errors, console errors and same-origin HTTP failures. */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    const url = r.url();
    if (r.status() >= 400 && url.startsWith('http://localhost')) errors.push(`HTTP ${r.status()} ${url}`);
  });
  return errors;
}

/** Scroll the whole page in steps so every reveal, pin and lazy image fires, then return to top. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let y = 0;
    // Pinned sections extend the page while scrolling, so re-read the height each step.
    while (y < document.documentElement.scrollHeight - window.innerHeight) {
      y += Math.round(window.innerHeight * 0.6);
      window.scrollTo(0, y);
      await wait(140);
    }
    await wait(1600);
    window.scrollTo(0, 0);
    await wait(400);
  });
}

export interface LayoutReport {
  vw: number;
  docOverflow: number;
  offenders: string[];
  clippedText: string[];
  stuckHidden: string[];
  brokenImages: string[];
  smallTargets: string[];
  tinyText: string[];
  headerCollisions: string[];
}

/** Measure the rendered page for responsive problems. Runs in the browser. */
export function measure(page: Page): Promise<LayoutReport> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const describe = (el: Element): string => {
      const cls =
        typeof el.className === 'string' && el.className
          ? `.${el.className.trim().split(/\s+/).join('.')}`
          : '';
      const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return `${el.tagName.toLowerCase()}${cls}${text ? ` "${text}"` : ''}`;
    };
    const isShown = (el: Element): boolean => {
      if (
        el.closest(
          '[hidden], dialog:not([open]), .drawer:not(.is-open), .hero__slide:not(.is-active), [aria-hidden="true"]',
        )
      )
        return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const clippedByAncestor = (el: Element): boolean => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (/(hidden|clip|auto|scroll)/.test(s.overflowX) || s.position === 'fixed') return true;
      }
      return false;
    };

    const all = Array.from(document.body.querySelectorAll('*'));

    const offenders = all
      .filter((el) => isShown(el) && getComputedStyle(el).position !== 'fixed')
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return (r.right > vw + 2 || r.left < -2) && !clippedByAncestor(el);
      })
      .slice(0, 10)
      .map(describe);

    const clippedText = Array.from(
      document.querySelectorAll(
        'h1, h2, h3, .display-lg, .display-md, .section-title, .hero__line, .card__title, .btn, .chip, .tile__name, .collection__name',
      ),
    )
      .filter(
        (el) =>
          isShown(el) && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible',
      )
      .map((el) => `${describe(el)} (${el.scrollWidth} > ${el.clientWidth})`);

    const stuckHidden = Array.from(
      document.querySelectorAll('[data-reveal], [data-stagger] > *, [data-split], [data-curtain]'),
    )
      .filter((el) => isShown(el))
      .filter((el) => {
        const s = getComputedStyle(el);
        return s.visibility === 'hidden' || Number(s.opacity) < 0.05 || s.clipPath.includes('100%');
      })
      .map(describe);

    const brokenImages = Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0 && img.getAttribute('src'))
      .map((img) => img.getAttribute('src') ?? '');

    const inlineTextLink = (el: Element): boolean =>
      el.tagName === 'A' &&
      getComputedStyle(el).display === 'inline' &&
      !!el.closest('p, li, address, dd, .prose, .footer__contact');
    const smallTargets = Array.from(
      document.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="tab"]',
      ),
    )
      .filter((el) => isShown(el) && !inlineTextLink(el))
      .filter((el) => {
        const target = el.matches('.pill input') ? el.parentElement! : el;
        const r = target.getBoundingClientRect();
        return Math.min(r.width, r.height) < 24;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`;
      });

    const tinyText = all
      .filter(
        (el) =>
          isShown(el) && Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim()),
      )
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 11)
      .map((el) => `${describe(el)} ${getComputedStyle(el).fontSize}`);

    const headerCollisions: string[] = [];
    const bar = document.querySelector('.header__bar');
    if (bar) {
      const [left, logo, right] = Array.from(bar.children).map((c) => c.getBoundingClientRect());
      if (left && logo && right) {
        if (left.right > logo.left + 1) headerCollisions.push('left icons overlap logo');
        if (logo.right > right.left + 1) headerCollisions.push('logo overlaps right icons');
      }
    }

    return {
      vw,
      docOverflow: document.documentElement.scrollWidth - vw,
      offenders,
      clippedText,
      stuckHidden,
      brokenImages,
      smallTargets,
      tinyText: [...new Set(tinyText)].slice(0, 15),
      headerCollisions,
    };
  });
}

export const shotPath = (info: TestInfo, name: string): string =>
  `test-results/responsive/${info.project.name}/${name}.png`;
