import { expect, test } from '@playwright/test';

test('HTML navigation works with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const modelRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.glb')) modelRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A small stand.',
  );
  await page.getByRole('link', { name: 'View work' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'About' })
    .click();
  await expect(page).toHaveTitle('About · Taquería Aldo');
  expect(modelRequests).toEqual([]);
  await context.close();
});

test('unknown projects return a real 404', async ({ page }) => {
  const response = await page.goto('/work/not-a-real-project');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'isn’t on the menu',
  );
});

test('theme persists on content routes without a 3D request', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/work');
  await page.getByRole('button', { name: 'Noir', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Contact' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
  expect(requests.some((url) => url.includes('.glb'))).toBe(false);
});

test('mobile HTML pages fit without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/work', '/about', '/contact']) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
