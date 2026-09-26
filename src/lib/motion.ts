/**
 * Scroll + reveal motion. Every effect is opt-in through a data attribute, so markup stays
 * readable and nothing animates when the visitor prefers reduced motion.
 *
 *   data-split[="chars"]   heading lines (or letters) rise out of a mask
 *   data-reveal            fade + rise once in view
 *   data-stagger           children reveal in sequence (batched per row)
 *   data-curtain[="left"]  image wipes open while it zooms out
 *   data-parallax="12"     element drifts ±12% against the scroll
 *   data-expand            inset image grows to full-bleed while scrubbing
 *   data-horizontal        section pins and its .h-track scrolls sideways (desktop)
 *   data-marquee           endless ticker that speeds up with scroll velocity
 *   data-count="8700"      number counts up once in view
 *   data-darken            section background fades cream → noir as it enters
 *   data-line              rule draws itself left → right
 *   data-spin              badge rotates with page scroll
 *   data-magnetic          element leans toward the pointer (fine pointers only)
 *   data-story             sticky media swaps as each .story__step passes the centre
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

let lenis: Lenis | null = null;

export { gsap, ScrollTrigger };

/** Freeze page scroll while a drawer/dialog is open. */
export function lockScroll(locked: boolean): void {
  document.documentElement.classList.toggle('is-locked', locked);
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function scrollToTarget(target: Element | number): void {
  if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -80 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

function smoothScroll(): void {
  if (!finePointer) return;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/*
 * One-shot reveals use IntersectionObserver rather than ScrollTrigger: IO measures the live
 * layout every time, so content can never stay hidden because positions were measured before
 * images, fonts or client-rendered sections settled. Elements already scrolled past (restored
 * scroll, anchor jumps) are shown instantly instead of animating off-screen.
 */
type Reveal = (instant: boolean, order: number) => void;
const pending = new Map<Element, Reveal>();
const observer =
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(
        (entries) => {
          let order = 0;
          for (const entry of entries) {
            const above = entry.boundingClientRect.bottom < 0;
            if (!entry.isIntersecting && !above) continue;
            const run = pending.get(entry.target);
            observer?.unobserve(entry.target);
            pending.delete(entry.target);
            run?.(above, above ? 0 : order++);
          }
        },
        { rootMargin: '0px 0px -4% 0px' },
      );

function whenVisible(el: Element, run: Reveal): void {
  if (!observer) return run(true, 0);
  pending.set(el, run);
  observer.observe(el);
}

function splitHeadings(root: ParentNode): void {
  for (const el of $$('[data-split]:not(.is-split)', root)) {
    const chars = el.dataset.split === 'chars';
    const split = SplitText.create(el, {
      type: chars ? 'lines,words,chars' : 'lines',
      mask: 'lines',
      linesClass: 'split-line',
    });
    const parts = chars ? split.chars : split.lines;
    el.classList.add('is-split');
    gsap.set(parts, { yPercent: 115, rotate: chars ? 6 : 0 });
    whenVisible(el, (instant) =>
      gsap.to(parts, {
        yPercent: 0,
        rotate: 0,
        duration: instant ? 0 : chars ? 1 : 1.15,
        ease: 'expo.out',
        stagger: instant ? 0 : chars ? 0.025 : 0.1,
        onComplete: () => split.revert(),
      }),
    );
  }
}

function reveals(root: ParentNode): void {
  for (const el of $$('[data-reveal]:not(.is-revealed)', root)) {
    el.classList.add('is-revealed');
    gsap.set(el, { y: 32, autoAlpha: 0 });
    whenVisible(el, (instant, order) =>
      gsap.to(el, {
        y: 0,
        autoAlpha: 1,
        duration: instant ? 0 : 1.1,
        ease: 'power3.out',
        delay: instant ? 0 : Number(el.dataset.delay ?? 0) + order * 0.06,
      }),
    );
  }
}

/** Reveal children of [data-stagger] containers row by row. Call again after rendering new cards. */
export function staggerIn(root: ParentNode = document): void {
  if (reducedMotion) return;
  const groups = [
    ...(root instanceof Element && root.matches('[data-stagger]') ? [root] : []),
    ...$$('[data-stagger]', root),
  ];
  for (const group of groups) {
    const items = Array.from(group.children).filter((c) => !c.classList.contains('is-revealed'));
    if (!items.length) continue;
    // Swipe tracks: cards off to the side never cross the viewport vertically, so reveal the
    // whole row together when the track itself comes into view.
    if (getComputedStyle(group).overflowX !== 'visible') {
      items.forEach((item) => item.classList.add('is-revealed'));
      gsap.set(items, { y: 36, autoAlpha: 0 });
      whenVisible(group, (instant) =>
        gsap.to(items, {
          y: 0,
          autoAlpha: 1,
          duration: instant ? 0 : 1,
          ease: 'power3.out',
          stagger: instant ? 0 : 0.08,
          overwrite: true,
        }),
      );
      continue;
    }
    items.forEach((item) => {
      item.classList.add('is-revealed');
      gsap.set(item, { y: 36, autoAlpha: 0 });
      whenVisible(item, (instant, order) =>
        gsap.to(item, {
          y: 0,
          autoAlpha: 1,
          duration: instant ? 0 : 1,
          ease: 'power3.out',
          delay: instant ? 0 : order * 0.09,
          overwrite: true,
        }),
      );
    });
  }
}

function curtains(root: ParentNode): void {
  for (const el of $$('[data-curtain]', root)) {
    const from = el.dataset.curtain === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: from });
    whenVisible(el, (instant) => {
      if (instant) return void gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)' });
      const tl = gsap.timeline();
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
      if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.1);
    });
  }
}

function parallax(root: ParentNode): void {
  for (const el of $$('[data-parallax]', root)) {
    const amount = Number(el.dataset.parallax) || 10;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  }
}

function expanders(root: ParentNode): void {
  for (const el of $$('[data-expand]', root)) {
    const img = el.querySelector('img');
    const copy = el.querySelector('.expand__copy');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.6 },
    });
    tl.fromTo(
      el,
      { clipPath: 'inset(14% 16% 14% 16% round 28px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' },
    );
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
    if (copy) tl.fromTo(copy, { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'power2.out' }, 0.45);
  }
}

function horizontal(root: ParentNode): void {
  const mm = gsap.matchMedia();
  for (const section of $$('[data-horizontal]', root)) {
    const track = section.querySelector<HTMLElement>('.h-track');
    if (!track) continue;
    mm.add('(min-width: 900px)', () => {
      const distance = (): number => Math.max(0, track.scrollWidth - window.innerWidth + 64);
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      // Cards tilt slightly while travelling for a sense of depth.
      gsap.fromTo(
        $$('.h-card', track),
        { rotate: -2.5 },
        {
          rotate: 2.5,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${distance()}`, scrub: true },
        },
      );
    });
  }
}

function marquees(root: ParentNode): void {
  for (const el of $$('[data-marquee]', root)) {
    const track = el.querySelector<HTMLElement>('.marquee__track');
    if (!track) continue;
    const reverse = el.dataset.marquee === 'reverse';
    const loop = gsap.to(track, {
      xPercent: reverse ? 0 : -50,
      startAt: { xPercent: reverse ? -50 : 0 },
      duration: Number(el.dataset.speed ?? 36),
      ease: 'none',
      repeat: -1,
    });
    let direction = 1;
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate(self) {
        direction = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 5);
        gsap.to(loop, { timeScale: direction * boost, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.2, ease: 'power2.out' });
      },
    });
  }
}

function counters(root: ParentNode): void {
  const fmt = new Intl.NumberFormat('en-US');
  for (const el of $$('[data-count]', root)) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    const state = { v: 0 };
    el.textContent = `0${suffix}`;
    whenVisible(el, (instant) =>
      gsap.to(state, {
        v: target,
        duration: instant ? 0 : 2.2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${fmt.format(Math.round(state.v))}${suffix}`;
        },
      }),
    );
  }
}

function darkeners(root: ParentNode): void {
  for (const el of $$('[data-darken]', root)) {
    gsap.fromTo(
      el,
      { backgroundColor: '#f6f1e9', color: '#121212' },
      {
        backgroundColor: '#0b0a09',
        color: '#f6f1e9',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 20%', scrub: true },
      },
    );
  }
}

function lines(root: ParentNode): void {
  for (const el of $$('[data-line]', root)) {
    gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
    whenVisible(el, (instant) => gsap.to(el, { scaleX: 1, duration: instant ? 0 : 1.4, ease: 'expo.inOut' }));
  }
}

function spinners(root: ParentNode): void {
  for (const el of $$('[data-spin]', root)) {
    gsap.to(el, { rotate: 360, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
  }
}

function magnetic(root: ParentNode): void {
  if (!finePointer) return;
  for (const el of $$('[data-magnetic]', root)) {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  }
}

function stories(root: ParentNode): void {
  for (const story of $$('[data-story]', root)) {
    const frames = $$('.story__frame', story);
    const steps = $$('.story__step', story);
    const counter = story.querySelector('.story__index');
    const show = (i: number): void => {
      frames.forEach((f, n) => f.classList.toggle('is-active', n === i));
      steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
    };
    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && show(i),
      });
    });
    const bar = story.querySelector<HTMLElement>('.story__progress span');
    if (bar) {
      gsap.fromTo(
        bar,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: story, start: 'top 55%', end: 'bottom 55%', scrub: true },
        },
      );
    }
    show(0);
  }
}

function chrome(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (header) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        header.classList.toggle('is-scrolled', y > 8);
        const menuOpen = document.documentElement.classList.contains('is-locked');
        header.classList.toggle('is-hidden', !menuOpen && self.direction === 1 && y > 320);
      },
    });
  }
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    gsap.fromTo(
      progress,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
    );
  }
}

/** Initialise every effect found under `root`. Safe to call once per page. */
export function initMotion(root: ParentNode = document): void {
  if (reducedMotion) {
    document.documentElement.classList.remove('motion');
    return;
  }
  smoothScroll();
  chrome();
  curtains(root);
  parallax(root);
  expanders(root);
  horizontal(root);
  marquees(root);
  counters(root);
  darkeners(root);
  lines(root);
  spinners(root);
  magnetic(root);
  stories(root);
  reveals(root);
  staggerIn(root);
  // Line-splitting needs final font metrics.
  document.fonts.ready
    .then(() => {
      splitHeadings(root);
      ScrollTrigger.refresh();
    })
    .catch((err: unknown) => console.warn('motion: font load failed, headings shown unsplit', err));
  (window as unknown as { __motion?: boolean }).__motion = true;
}

/** Reveal elements rendered after load (e.g. filtered product grids). */
export function motionFor(root: ParentNode): void {
  if (reducedMotion) return;
  reveals(root);
  curtains(root);
  staggerIn(root);
  splitHeadings(root);
}
