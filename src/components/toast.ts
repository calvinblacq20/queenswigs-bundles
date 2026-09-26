let timer: number | undefined;

/** Announce a short status message (visually + to screen readers). */
export function toast(message: string): void {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('is-visible'), 2600);
}
