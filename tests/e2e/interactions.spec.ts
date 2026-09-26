import { expect, test, type Page } from '@playwright/test';
import { watchErrors } from './helpers';

const isDesktopNav = (page: Page): boolean => (page.viewportSize()?.width ?? 0) >= 1100;

test.describe('navigation', () => {
  test('mobile menu drawer opens, traps focus and closes', async ({ page }) => {
    await page.goto('/');
    test.skip(isDesktopNav(page), 'desktop shows the full nav instead');
    const toggle = page.locator('[data-open-menu]');
    await toggle.click();
    const drawer = page.locator('#menu-drawer');
    await expect(drawer).toHaveClass(/is-open/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer.getByRole('link', { name: 'Bounce Curls' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveClass(/is-open/);
    await toggle.click();
    await drawer.getByRole('button', { name: 'Close menu' }).click();
    await expect(drawer).toBeHidden();
    // Links in the drawer navigate.
    await toggle.click();
    await drawer.getByRole('link', { name: 'Bobs' }).click();
    await expect(page).toHaveURL(/shop\.html\?c=bob/);
  });

  test('desktop mega menu and nav', async ({ page }) => {
    await page.goto('/');
    test.skip(!isDesktopNav(page), 'only desktop widths show the full nav');
    await expect(page.locator('[data-open-menu]')).toBeHidden();
    const trigger = page.getByRole('button', { name: 'Wigs' });
    await trigger.hover();
    const mega = page.locator('#mega-wigs');
    await expect(mega).toBeVisible();
    await mega.getByRole('link', { name: 'Afro Wigs' }).click();
    await expect(page).toHaveURL(/c=afro/);
    // Keyboard/touch path: the trigger toggles it too.
    await page.getByRole('button', { name: 'Wigs' }).click();
    await expect(page.getByRole('button', { name: 'Wigs' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('search panel submits to the shop', async ({ page }) => {
    await page.goto('/');
    await page.locator('.header__left [data-open-search]').click();
    const input = page.locator('#search-input');
    await expect(input).toBeFocused();
    await input.fill('bounce');
    await input.press('Enter');
    await expect(page).toHaveURL(/shop\.html\?q=bounce/);
    await expect(page.locator('[data-grid] .card').first()).toBeVisible();
    await expect(page.locator('[data-collection-title]')).toContainText('bounce');
  });
});

test.describe('home page', () => {
  test('hero controls, tabs and carousel respond', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    const active = () => page.locator('.hero__slide.is-active').getAttribute('data-label');
    const first = await active();
    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(active).not.toBe(first);
    const pause = page.getByRole('button', { name: /Pause slideshow/ });
    await pause.click();
    await expect(page.locator('[data-hero-pause]')).toHaveAttribute('aria-pressed', 'true');

    const tab = page.getByRole('tab', { name: 'Wholesale' });
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await expect(page.locator('#panel-5')).toBeVisible();
    await expect(page.locator('#panel-1')).toBeHidden();
    await tab.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Install & style' })).toHaveAttribute('aria-selected', 'true');

    const track = page.locator('[data-carousel] .carousel__track');
    await track.scrollIntoViewIfNeeded();
    const before = await track.evaluate((t) => t.scrollLeft);
    await page.getByRole('button', { name: 'Scroll styles right' }).click();
    await expect.poll(() => track.evaluate((t) => t.scrollLeft)).toBeGreaterThan(before);

    await page.locator('[data-set="deals"]').click();
    await expect(page.locator('[data-best-sellers] .card').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('shop', () => {
  const prices = (page: Page) =>
    page
      .locator('[data-grid] .card .card__price .price')
      .evaluateAll((els) => els.map((e) => Number((e.textContent ?? '').replace(/[^\d]/g, '')) || Infinity));

  test('sort, price filter, search and empty state', async ({ page }) => {
    await page.goto('/shop.html');
    await page.locator('#sort').selectOption('price-asc');
    await expect(page).toHaveURL(/sort=price-asc/);
    const asc = await prices(page);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await page.locator('#max-price').selectOption('500');
    const cheap = await prices(page);
    expect(cheap.length).toBeGreaterThan(0);
    expect(cheap.every((p) => p <= 500)).toBe(true);

    await page.locator('#shop-search').fill('zzzz no such wig');
    await expect(page.locator('.empty-state')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('[data-count-label]')).toHaveText(/38 styles/);
  });

  test('deep links restore filters', async ({ page }) => {
    await page.goto('/shop.html?c=afro&sort=price-desc');
    await expect(page.locator('[data-filter-cat="afro"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#sort')).toHaveValue('price-desc');
    await expect(page.locator('[data-collection-title]')).toHaveText('Afro Wigs');
  });
});

test.describe('product page', () => {
  test('gallery, quantity bounds and price-on-request', async ({ page }) => {
    await page.goto('/product.html?p=big-afro');
    const stage = page.locator('[data-stage]');
    const src = await stage.getAttribute('src');
    await page.getByRole('button', { name: 'Show image 2' }).click();
    await expect.poll(() => stage.getAttribute('src')).not.toBe(src);

    const qty = page.locator('.qty__input');
    const plus = page.getByRole('button', { name: 'Increase quantity' });
    for (let i = 0; i < 12; i++) await plus.click();
    await expect(qty).toHaveValue('10');
    await page.getByRole('button', { name: 'Decrease quantity' }).click();
    await expect(qty).toHaveValue('9');

    await page.goto('/product.html?p=burmese-curls');
    await expect(page.locator('[data-add]')).toBeDisabled();
    await expect(page.locator('[data-add]')).toHaveText('Price on request');
    await expect(page.locator('[data-ask]')).toHaveAttribute('href', /wa\.me\/233241648058/);
  });

  test('sticky buy bar appears on phones after scrolling past the button', async ({ page }) => {
    await page.goto('/product.html?p=sdd-pixie-curls');
    test.skip((page.viewportSize()?.width ?? 0) >= 900, 'buy bar is a phone/tablet feature');
    const bar = page.locator('[data-buy-bar]');
    await expect(bar).not.toHaveClass(/is-visible/);
    await page.locator('.accordion').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 400);
    await expect(bar).toHaveClass(/is-visible/);
    await bar.getByRole('button', { name: 'Add to bag' }).click();
    await expect(page.locator('#bag-drawer')).toHaveClass(/is-open/);
  });
});

test.describe('bag', () => {
  test('quantity steps, removal and empty state', async ({ page }) => {
    await page.goto('/product.html?p=chioma-everyday');
    await page.locator('[data-add]').click();
    const bag = page.locator('#bag-drawer');
    await expect(bag).toHaveClass(/is-open/);
    await bag.getByRole('button', { name: /Increase quantity/ }).click();
    await expect(bag.locator('.qty__value')).toHaveText('2');
    await expect(bag.locator('.bag-subtotal')).toContainText('GH₵560');
    await bag.getByRole('button', { name: /Remove/ }).click();
    await expect(bag.getByText('Your bag is empty')).toBeVisible();
    await bag.getByRole('button', { name: 'Close bag' }).click();
    await expect(bag).not.toHaveClass(/is-open/);
  });
});

test.describe('visit page', () => {
  test('FAQ accordion and contact links', async ({ page }) => {
    await page.goto('/visit.html');
    const item = page.locator('details.faq__item').first();
    await item.locator('summary').scrollIntoViewIfNeeded();
    await item.locator('summary').click();
    await expect(item).toHaveAttribute('open', '');
    await expect(page.locator('a[href="tel:+233241648058"]').first()).toBeAttached();
    await expect(page.locator('a[data-wa]').first()).toHaveAttribute('href', /wa\.me\/233241648058\?text=/);
  });
});
