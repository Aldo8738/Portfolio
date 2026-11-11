import { expect, test } from '@playwright/test';

test('skip link stays hidden until keyboard focus and moves focus into main', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    for (const route of ['/work/knowledge-bridge', '/work', '/about']) {
      await page.goto(route);
      const skip = page.getByRole('link', {
        name: 'Skip to content',
        exact: true,
      });
      await expect(skip).not.toBeInViewport();
      await page.keyboard.press('Tab');
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport({ ratio: 1 });
      expect(await skip.evaluate((el) => el.matches(':focus-visible'))).toBe(
        true,
      );
      const link = await skip.boundingBox();
      const heading = await page.locator('h1').boundingBox();
      if (!link || !heading) throw new Error('Skip-link layout missing');
      expect(link.y + link.height).toBeLessThan(heading.y);
      if (route === '/work/knowledge-bridge')
        await page.screenshot({
          path: testInfo.outputPath(`skip-focused-${width}.png`),
        });
      await page.keyboard.press('Enter');
      await expect(page.locator('main')).toBeFocused();
      await expect(skip).not.toBeInViewport();
      await page.reload();
      await page.mouse.click(width - 10, height - 10);
      await skip.focus();
      expect(await skip.evaluate((el) => el.matches(':focus-visible'))).toBe(
        false,
      );
      await expect(skip).not.toBeInViewport();
    }
  }
});

test('HTML navigation works with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const modelRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.glb')) modelRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('#ascii-taco-loader')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Taquería Aldo',
  );
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Work', exact: true })
    .click();
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

test('Synthwave replaces Vintage and persists across routes', async ({
  page,
}) => {
  await page.goto('/work');
  await expect(
    page.getByRole('button', { name: 'Vintage', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Synthwave', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Synthwave', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => localStorage.setItem('taqueria-theme', 'vintage'));
  await page.goto('/about');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
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

test('fullscreen shell keeps navigation and theme controls usable at small sizes', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'WebGL2RenderingContext', {
      value: undefined,
    }),
  );
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
    const stage = await page.locator('[data-scene-status]').boundingBox();
    expect(stage).toMatchObject({ x: 0, y: 0, ...viewport });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
    await expect(
      page
        .getByRole('navigation')
        .getByRole('link', { name: 'Work', exact: true }),
    ).toBeVisible();
    const brand = await page.locator('.site-header .brand').boundingBox();
    const navigation = await page.getByRole('navigation').boundingBox();
    if (!brand || !navigation) throw new Error('Header controls are missing');
    expect(navigation.x).toBeGreaterThanOrEqual(brand.x + brand.width);
    expect(navigation.x + navigation.width).toBeLessThanOrEqual(viewport.width);
    await page.locator('.salsa-menu > summary').focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Noir', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
  }
  await page.goto('/work');
  await page.getByRole('button', { name: 'Original', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-presentation',
    'portfolio',
  );
  await expect(page.locator('html')).toHaveCSS(
    'background-color',
    'rgb(248, 247, 242)',
  );
  await page.goto('/work');
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({
    path: testInfo.outputPath('work.png'),
    fullPage: true,
  });
});
