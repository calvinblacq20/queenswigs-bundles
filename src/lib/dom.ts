export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keep Tab focus inside `container`; returns a function that restores focus to the opener. */
export function trapFocus(container: HTMLElement): () => void {
  const opener = document.activeElement as HTMLElement | null;
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    const items = $$<HTMLElement>(FOCUSABLE, container).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKey);
  requestAnimationFrame(() => ($<HTMLElement>(FOCUSABLE, container) ?? container).focus());
  return () => {
    container.removeEventListener('keydown', onKey);
    opener?.focus();
  };
}
