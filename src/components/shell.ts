import { SITE } from '../data/site';
import { bag } from '../lib/bag';
import { $, $$, trapFocus } from '../lib/dom';
import { gsap, lockScroll, reducedMotion } from '../lib/motion';
import { promoActive, promoEndsAt } from '../lib/promo';
import { waLink } from '../lib/whatsapp';
import { closeBag, initBagDrawer, openBag } from './bag-drawer';
import { openQuickView } from './quick-view';

function announcement(): void {
  const bar = $('.announce');
  if (!bar) return;
  const items = $$('.announce__item', bar).filter((i) => !i.hasAttribute('data-promo') || promoActive());
  $$('.announce__item[data-promo]', bar).forEach((i) => !promoActive() && i.remove());
  if (items.length < 2) {
    items[0]?.classList.add('is-active');
    return;
  }
  let i = 0;
  const show = (n: number): void => {
    items.forEach((el, k) => el.classList.toggle('is-active', k === n));
  };
  show(0);
  let timer = window.setInterval(() => show((i = (i + 1) % items.length)), 4500);
  $$('[data-announce-step]', bar).forEach((btn) =>
    btn.addEventListener('click', () => {
      window.clearInterval(timer);
      i = (i + Number(btn.dataset.announceStep) + items.length) % items.length;
      show(i);
      timer = window.setInterval(() => show((i = (i + 1) % items.length)), 6000);
    }),
  );
}

function menuDrawer(): void {
  const drawer = $('#menu-drawer');
  const toggle = $<HTMLButtonElement>('[data-open-menu]');
  if (!drawer || !toggle) return;
  let release: (() => void) | null = null;
  const open = (): void => {
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    release = trapFocus($('.drawer__panel', drawer)!);
    if (!reducedMotion) {
      gsap.fromTo(
        $$('.menu-list > li', drawer),
        { x: -30, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.6, ease: 'power3.out', delay: 0.15 },
      );
    }
  };
  const close = (): void => {
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    release?.();
    window.setTimeout(() => {
      if (!drawer.classList.contains('is-open')) drawer.hidden = true;
    }, 450);
  };
  toggle.addEventListener('click', open);
  drawer.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-close-menu]')) close();
  });
  drawer.addEventListener('keydown', (e) => e.key === 'Escape' && close());
}

function megaMenus(): void {
  // Hover opens on desktop (CSS); these buttons make it work for touch and keyboard too.
  for (const item of $$('.nav__item--mega')) {
    const btn = $<HTMLButtonElement>('.nav__trigger', item);
    if (!btn) continue;
    const set = (open: boolean): void => {
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => set(!item.classList.contains('is-open')));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        set(false);
        btn.focus();
      }
    });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget as Node)) set(false);
    });
    item.addEventListener('mouseleave', () => set(false));
  }
}

function search(): void {
  const panel = $('#search-panel');
  const input = $<HTMLInputElement>('#search-input');
  if (!panel || !input) return;
  const toggle = (open: boolean): void => {
    panel.classList.toggle('is-open', open);
    panel.hidden = !open;
    $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', String(open)));
    if (open) input.focus();
  };
  $$('[data-open-search]').forEach((b) =>
    b.addEventListener('click', () => toggle(!panel.classList.contains('is-open'))),
  );
  panel.addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false));
  $('[data-close-search]', panel)?.addEventListener('click', () => toggle(false));
}

function bagBadge(): void {
  const update = (): void => {
    for (const el of $$('[data-bag-count]')) {
      el.textContent = String(bag.count);
      el.classList.toggle('is-empty', bag.count === 0);
    }
    const btn = $('[data-open-bag]');
    btn?.setAttribute('aria-label', `Open bag, ${bag.count} item${bag.count === 1 ? '' : 's'}`);
  };
  update();
  bag.subscribe(() => {
    update();
    const badge = $('[data-bag-count]');
    if (badge && !reducedMotion)
      gsap.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  });
  $$('[data-open-bag]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      openBag();
    }),
  );
}

function whatsappLinks(): void {
  for (const a of $$<HTMLAnchorElement>('a[data-wa]')) {
    a.href = waLink(SITE.whatsapp, a.dataset.wa || 'Hello Queens Wigs & Bundles, I have a question.');
    a.target = '_blank';
    a.rel = 'noopener';
  }
}

function promo(): void {
  if (!promoActive()) $$('[data-promo]').forEach((el) => el.remove());
  const countdown = $$('[data-countdown]');
  if (!countdown.length || !promoActive()) return;
  const tick = (): void => {
    const ms = Math.max(0, promoEndsAt - Date.now());
    const d = Math.floor(ms / 86_400_000);
    const h = Math.floor((ms % 86_400_000) / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const parts = { d, h, m, s };
    for (const el of countdown) {
      for (const [k, v] of Object.entries(parts)) {
        const slot = $(`[data-unit="${k}"]`, el);
        if (slot) slot.textContent = String(v).padStart(2, '0');
      }
    }
  };
  tick();
  window.setInterval(tick, 1000);
}

export function initShell(): void {
  announcement();
  menuDrawer();
  megaMenus();
  search();
  initBagDrawer();
  bagBadge();
  whatsappLinks();
  promo();
  document.addEventListener('click', (e) => {
    const quick = (e.target as HTMLElement).closest<HTMLElement>('[data-quick]');
    if (quick) openQuickView(quick.dataset.quick!);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBag();
  });
  for (const el of $$('[data-year]')) el.textContent = String(new Date().getFullYear());
}
