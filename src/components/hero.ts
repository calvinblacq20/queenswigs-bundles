import { $, $$ } from '../lib/dom';
import { gsap, reducedMotion, ScrollTrigger } from '../lib/motion';

const DURATION = 7000;

/** Wrap each letter of `.hero__line` elements in a span for per-letter motion. */
function splitChars(root: HTMLElement): void {
  for (const line of $$('.hero__line', root)) {
    const text = line.textContent ?? '';
    line.setAttribute('aria-label', text);
    line.textContent = '';
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'hero__char';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch === ' ' ? ' ' : ch;
      line.append(span);
    }
  }
}

/** Editorial hero slideshow: letter-by-letter titles, curtain image swaps, colour-shifting backdrop. */
export function initHero(): void {
  const hero = $('[data-hero]');
  if (!hero) return;
  if (!reducedMotion) splitChars(hero);
  const slides = $$('.hero__slide', hero);
  slides.forEach((s, i) => {
    s.classList.toggle('is-active', i === 0);
    if (i) s.setAttribute('aria-hidden', 'true');
  });
  // Dots are built from the slides that survived promo filtering.
  const dotWrap = $('.hero__dots', hero);
  if (dotWrap) {
    dotWrap.innerHTML = slides
      .map(
        (s, i) =>
          `<button type="button" class="hero__dot${i === 0 ? ' is-active' : ''}" aria-label="Slide ${i + 1}: ${s.dataset.label ?? ''}" aria-current="${i === 0}"><span class="hero__dot-fill"></span></button>`,
      )
      .join('');
  }
  const dots = $$<HTMLButtonElement>('.hero__dot', hero);
  const pause = $<HTMLButtonElement>('[data-hero-pause]', hero);
  let index = 0;
  let playing = !reducedMotion;
  let timer: gsap.core.Tween | null = null;

  const setBg = (slide: HTMLElement, instant = false): void => {
    const bg = slide.dataset.bg ?? '#0b0a09';
    const ink = slide.dataset.ink ?? '#f6f1e9';
    if (instant || reducedMotion) {
      hero.style.setProperty('--hero-bg', bg);
      hero.style.setProperty('--hero-ink', ink);
    } else {
      gsap.to(hero, { '--hero-bg': bg, '--hero-ink': ink, duration: 1.2, ease: 'power2.inOut' });
    }
  };

  const enter = (slide: HTMLElement): void => {
    if (reducedMotion) return;
    const chars = $$('.hero__char', slide);
    const img = $('.hero__img', slide);
    const frame = $('.hero__frame', slide);
    const rest = $$('[data-hero-fade]', slide);
    const tl = gsap.timeline();
    if (frame)
      tl.fromTo(
        frame,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' },
        0,
      );
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.1);
    tl.fromTo(
      chars,
      { yPercent: 120, rotate: 8 },
      { yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.03 },
      0.35,
    );
    tl.fromTo(
      rest,
      { y: 30, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1 },
      0.8,
    );
  };

  const leave = (slide: HTMLElement): Promise<void> =>
    new Promise((resolve) => {
      if (reducedMotion) return resolve();
      gsap
        .timeline({ onComplete: () => resolve() })
        .to(
          $$('.hero__char', slide),
          { yPercent: -120, duration: 0.55, ease: 'power3.in', stagger: 0.012 },
          0,
        )
        .to($$('[data-hero-fade]', slide), { autoAlpha: 0, y: -20, duration: 0.4 }, 0)
        .to(
          $('.hero__frame', slide),
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.in' },
          0.05,
        );
    });

  const progress = (): void => {
    timer?.kill();
    const fill = $('.hero__dot.is-active .hero__dot-fill', hero);
    if (!fill) return;
    gsap.set($$('.hero__dot-fill', hero), { scaleX: 0 });
    if (!playing) return;
    timer = gsap.fromTo(
      fill,
      { scaleX: 0 },
      { scaleX: 1, duration: DURATION / 1000, ease: 'none', onComplete: () => void go(index + 1) },
    );
  };

  let busy = false;
  const go = async (n: number): Promise<void> => {
    if (busy || slides.length < 2) return;
    const next = (n + slides.length) % slides.length;
    if (next === index) return;
    busy = true;
    const current = slides[index]!;
    const incoming = slides[next]!;
    await leave(current);
    current.classList.remove('is-active');
    current.setAttribute('aria-hidden', 'true');
    incoming.classList.add('is-active');
    incoming.removeAttribute('aria-hidden');
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === next);
      d.setAttribute('aria-current', String(k === next));
    });
    index = next;
    setBg(incoming);
    enter(incoming);
    busy = false;
    progress();
  };

  dots.forEach((d, k) => d.addEventListener('click', () => void go(k)));
  $('[data-hero-prev]', hero)?.addEventListener('click', () => void go(index - 1));
  $('[data-hero-next]', hero)?.addEventListener('click', () => void go(index + 1));
  pause?.addEventListener('click', () => {
    playing = !playing;
    pause.setAttribute('aria-pressed', String(!playing));
    pause.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
    hero.classList.toggle('is-paused', !playing);
    progress();
  });

  // Swipe on touch screens.
  let startX = 0;
  hero.addEventListener('touchstart', (e) => (startX = e.touches[0]?.clientX ?? 0), { passive: true });
  hero.addEventListener(
    'touchend',
    (e) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - startX;
      if (Math.abs(dx) > 50) void go(index + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );

  // Stop auto-advance while the hero is off screen.
  new IntersectionObserver(([entry]) => {
    if (!timer) return;
    if (entry?.isIntersecting) timer.resume();
    else timer.pause();
  }).observe(hero);

  setBg(slides[0]!, true);
  enter(slides[0]!);
  progress();

  if (!reducedMotion) {
    // Scroll-out: portrait drifts, title lifts and fades.
    gsap.to($$('.hero__frame', hero), {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    // fromTo (not autoAlpha): titles in hidden slides must not inherit a 0 start value.
    gsap.fromTo(
      $$('.hero__title, .hero__copy', hero),
      { y: 0, opacity: 1 },
      {
        y: -90,
        opacity: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      },
    );
    ScrollTrigger.refresh();
  }
}
