import '../styles/main.css';
import { initCarousels } from '../components/carousel';
import { initShell } from '../components/shell';
import { initTabs } from '../components/tabs';
import { $$ } from '../lib/dom';
import { initMotion } from '../lib/motion';

// FAQ accordions: animate <details> height open/closed.
for (const d of $$<HTMLDetailsElement>('details.faq__item')) {
  const summary = d.querySelector('summary');
  const body = d.querySelector<HTMLElement>('.faq__body');
  if (!summary || !body) continue;
  summary.addEventListener('click', (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    if (d.open) {
      const anim = body.animate(
        [
          { height: `${body.offsetHeight}px`, opacity: 1 },
          { height: '0px', opacity: 0 },
        ],
        {
          duration: 320,
          easing: 'cubic-bezier(.26,.54,.32,1)',
        },
      );
      anim.onfinish = () => (d.open = false);
    } else {
      d.open = true;
      body.animate(
        [
          { height: '0px', opacity: 0 },
          { height: `${body.offsetHeight}px`, opacity: 1 },
        ],
        {
          duration: 420,
          easing: 'cubic-bezier(.26,.54,.32,1)',
        },
      );
    }
  });
}

initShell();
initCarousels();
initTabs();
initMotion();
