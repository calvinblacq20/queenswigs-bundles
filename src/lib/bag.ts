import { PRODUCTS } from '../data/products';
import { addLine, itemCount, removeLine, resolveLines, sanitize, setQty, type CartLine } from './cart';

const KEY = 'qwb.bag.v1';
const events = new EventTarget();

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? sanitize(JSON.parse(raw), PRODUCTS) : [];
  } catch (err) {
    console.warn('bag: saved bag unreadable, starting empty', err);
    return [];
  }
}

let lines: CartLine[] = load();

function commit(next: CartLine[]): void {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch (err) {
    // Private mode / storage full: the bag still works for this page view.
    console.warn('bag: could not persist', err);
  }
  events.dispatchEvent(new Event('change'));
}

// Keep several open tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  lines = load();
  events.dispatchEvent(new Event('change'));
});

export const bag = {
  get lines(): readonly CartLine[] {
    return lines;
  },
  get count(): number {
    return itemCount(lines);
  },
  resolved: () => resolveLines(lines, PRODUCTS),
  add: (slug: string, variant: string, qty = 1): void => commit(addLine(lines, slug, variant, qty)),
  setQty: (slug: string, variant: string, qty: number): void => commit(setQty(lines, slug, variant, qty)),
  remove: (slug: string, variant: string): void => commit(removeLine(lines, slug, variant)),
  clear: (): void => commit([]),
  subscribe(fn: () => void): () => void {
    events.addEventListener('change', fn);
    return () => events.removeEventListener('change', fn);
  },
};
