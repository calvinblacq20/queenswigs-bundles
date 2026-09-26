import { expect, test } from '@playwright/test';

// Core action: find a wig, add it to the bag, send the order to WhatsApp.
test('shop → quick view → bag → WhatsApp order', async ({ page }) => {
  // Capture the WhatsApp URL instead of leaving the site.
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url: string) => {
      (window as unknown as { __opened: string[] }).__opened.push(url);
      return {} as Window; // a real tab handle, so the page does not fall back to navigating
    }) as typeof window.open;
  });

  await page.goto('/');
  await expect(page.locator('.hero')).toBeVisible();

  await page.goto('/shop.html?c=bob');
  await expect(page.locator('[data-collection-title]')).toHaveText('Bobs');
  const cards = page.locator('[data-grid] .card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(1);

  await page.locator('[data-quick="ready-to-wear-bob"]').click();
  const dialog = page.locator('#quick-view');
  await expect(dialog).toBeVisible();
  // The radio sits on top of its pill so the whole pill is tappable; select it by role.
  await dialog.getByRole('radio', { name: '14"' }).check();
  await expect(dialog.locator('[data-price]')).toContainText('GH₵990');
  await dialog.getByRole('button', { name: 'Add to bag' }).click();

  const bag = page.locator('#bag-drawer');
  await expect(bag).toHaveClass(/is-open/);
  await expect(bag.locator('.bag-line')).toHaveCount(1);
  await expect(page.locator('[data-bag-count]')).toHaveText('1');

  // Unhappy path: empty name is rejected.
  await bag.getByRole('button', { name: /Send order on WhatsApp/ }).click();
  await expect(bag.locator('#co-name-err')).toHaveText(/enter your name/);

  await bag.getByLabel('Your name').fill('Ama Mensah');
  await bag.getByRole('button', { name: /Send order on WhatsApp/ }).click();

  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  expect(opened).toHaveLength(1);
  expect(opened[0]).toMatch(/^https:\/\/wa\.me\/233241648058\?text=/);
  const text = decodeURIComponent(opened[0]!.split('text=')[1]!);
  expect(text).toContain('Glueless Ready-to-Wear Bob (14") x 1 = GH₵990');
  expect(text).toContain('Name: Ama Mensah');

  // The bag survives a reload.
  await page.reload();
  await expect(page.locator('[data-bag-count]')).toHaveText('1');
});

test('unknown product shows a friendly not-found state', async ({ page }) => {
  await page.goto('/product.html?p=does-not-exist');
  await expect(page.getByRole('heading', { name: /couldn’t find that style/ })).toBeVisible();
});
