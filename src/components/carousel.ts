import { $, $$ } from '../lib/dom';

/** Native scroll-snap carousel with arrows, a progress rail and drag-to-scroll for mice. */
export function initCarousels(root: ParentNode = document): void {
  for (const el of $$('[data-carousel]', root)) {
    const track = $('.carousel__track', el);
    if (!track) continue;
    const prev = $<HTMLButtonElement>('[data-prev]', el);
    const next = $<HTMLButtonElement>('[data-next]', el);
    const rail = $('.carousel__rail span', el);

    const step = (): number => {
      const card = track.firstElementChild as HTMLElement | null;
      return card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
    };
    const update = (): void => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      if (rail) {
        const size = Math.max(0.12, track.clientWidth / track.scrollWidth);
        rail.style.width = `${size * 100}%`;
        rail.style.transform = `translateX(${(ratio * (1 - size) * 100) / size}%)`;
      }
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    // Mouse drag (touch already scrolls natively).
    let down = false;
    let moved = false;
    let x0 = 0;
    let left0 = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      x0 = e.clientX;
      left0 = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = left0 - dx;
    });
    window.addEventListener('pointerup', () => {
      down = false;
      track.classList.remove('is-dragging');
    });
    // Swallow the click that ends a drag so links don't fire.
    track.addEventListener(
      'click',
      (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      },
      true,
    );
  }
}
