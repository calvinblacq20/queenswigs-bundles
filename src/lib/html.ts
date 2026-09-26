/** Minimal escaping template tag so interpolated data can never inject markup. */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (value: unknown): string => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]!);

export class Raw {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

type Part = string | number | Raw | null | undefined | false | readonly (string | Raw)[];

/** Template tag: interpolations are escaped unless they are `Raw` (i.e. output of `html`). */
export function html(strings: TemplateStringsArray, ...values: Part[]): Raw {
  let out = strings[0] ?? '';
  values.forEach((v, i) => {
    out += render(v) + (strings[i + 1] ?? '');
  });
  return new Raw(out);
}

function render(v: Part): string {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.value;
  if (Array.isArray(v)) return v.map((x: string | Raw) => (x instanceof Raw ? x.value : esc(x))).join('');
  return esc(v);
}
