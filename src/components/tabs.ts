import { $, $$ } from '../lib/dom';
import { gsap, reducedMotion } from '../lib/motion';

/** Accessible tabs (roving tabindex + arrow keys) with an animated panel swap. */
export function initTabs(root: ParentNode = document): void {
  for (const el of $$('[data-tabs]', root)) {
    const tabs = $$<HTMLButtonElement>('[role="tab"]', el);
    const panels = $$('[role="tabpanel"]', el);
    const ink = $('.tabs__ink', el);

    const moveInk = (tab: HTMLElement): void => {
      if (!ink) return;
      ink.style.width = `${tab.offsetWidth}px`;
      ink.style.transform = `translateX(${tab.offsetLeft}px)`;
    };

    const select = (i: number, focus = false): void => {
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k]!.hidden = !on;
      });
      const tab = tabs[i]!;
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
      moveInk(tab);
      const panel = panels[i]!;
      if (reducedMotion) return;
      const media = $('.tab-panel__media', panel);
      const img = $('img', panel);
      const copy = $$('.tab-panel__copy > *', panel);
      const tl = gsap.timeline();
      if (media)
        tl.fromTo(
          media,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' },
          0,
        );
      if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
      tl.fromTo(
        copy,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.8, ease: 'power3.out' },
        0.25,
      );
    };

    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (e.key === 'Home') select(0, true);
        else if (e.key === 'End') select(tabs.length - 1, true);
        else if (dir) select((i + dir + tabs.length) % tabs.length, true);
        else return;
        e.preventDefault();
      });
    });
    window.addEventListener('resize', () => {
      const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
      if (active) moveInk(active);
    });
    requestAnimationFrame(() => {
      const active = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      moveInk(tabs[Math.max(0, active)]!);
    });
  }
}
