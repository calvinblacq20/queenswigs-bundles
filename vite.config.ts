/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const root = import.meta.dirname;
const pages = ['index', 'shop', 'product', 'visit', 'policies', '404'];

/** Replaces `<!-- @include name -->` with the contents of partials/name.html. */
function htmlPartials(): Plugin {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name: string) =>
          readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8'),
        );
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('partials')) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(root, `${p}.html`)])),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
  },
});
