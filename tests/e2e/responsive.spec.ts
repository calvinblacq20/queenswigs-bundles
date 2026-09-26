import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { measure, PAGES, scrollThrough, shotPath, watchErrors } from './helpers';

for (const { slug, url } of PAGES) {
  test(`layout: ${slug}`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors = watchErrors(page);
    await page.goto(url);
    await page.waitForLoadState('load');
    await scrollThrough(page);
    const report = await measure(page);

    await page.screenshot({ path: shotPath(info, `${slug}-top`) });
    // Full-page captures are slow on long pages; opt in with SHOTS=full.
    if (process.env.SHOTS === 'full') {
      await page.screenshot({ path: shotPath(info, `${slug}-full`), fullPage: true, scale: 'css' });
    }
    await info.attach('layout-report', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });

    // The Google Maps embed may log its own warnings; only our origin counts.
    expect(
      errors.filter((e) => !/google|gstatic|maps/i.test(e)),
      'errors',
    ).toEqual([]);
    expect(report.docOverflow, 'page scrolls sideways').toBeLessThanOrEqual(1);
    expect(report.offenders, 'elements poking out of the viewport').toEqual([]);
    expect(report.clippedText, 'text cut off inside its box').toEqual([]);
    expect(report.stuckHidden, 'content still hidden after scrolling').toEqual([]);
    expect(report.brokenImages, 'broken images').toEqual([]);
    expect(report.smallTargets, 'tap targets under 24px (WCAG 2.5.8)').toEqual([]);
    expect(report.headerCollisions, 'header layout').toEqual([]);
  });
}

test('reduced motion: everything visible without scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('load');
  const hidden = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('[data-reveal], [data-stagger] > *, [data-split], [data-curtain]'))
        .filter((el) => !el.closest('[hidden], .hero__slide:not(.is-active)'))
        .filter((el) => {
          const s = getComputedStyle(el);
          return s.visibility === 'hidden' || Number(s.opacity) < 0.05 || s.clipPath.includes('100%');
        }).length,
  );
  expect(hidden).toBe(0);
  expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(false);
});

// Accessibility is engine-independent; scan once on a phone and once on a laptop.
test.describe('accessibility (axe)', () => {
  // eslint-disable-next-line no-empty-pattern -- Playwright requires a destructured fixtures arg
  test.beforeEach(({}, info) => {
    test.skip(
      !['android-pixel-7', 'desktop-chrome-1366'].includes(info.project.name),
      'axe runs on two representative devices',
    );
  });
  for (const { slug, url } of PAGES) {
    test(`a11y: ${slug}`, async ({ page }, info) => {
      test.setTimeout(120_000);
      await page.goto(url);
      await page.waitForLoadState('load');
      await scrollThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .exclude('iframe')
        .analyze();
      const serious = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map(
          (v) =>
            `${v.id}: ${v.help} → ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' '))
              .join(' | ')}`,
        );
      await info.attach('axe', {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
      expect(serious).toEqual([]);
    });
  }
});
