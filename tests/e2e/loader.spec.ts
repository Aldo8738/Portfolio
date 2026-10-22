import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('the smaller taco and loading bar remain visible for at least one second', async ({
  page,
}) => {
  await page.clock.install({ time: new Date(0) });
  await page.clock.pauseAt(new Date(1000));
  await page.route('**/*.js', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const canvas = await page.locator('#ascii-taco-canvas').boundingBox();
  expect(canvas?.width).toBeLessThanOrEqual(360);
  const bar = page.getByRole('progressbar', { name: 'Loading Taquería Aldo' });
  await expect(bar).toBeVisible();
  await expect(bar).not.toHaveAttribute('aria-valuenow');
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('taqueria:scene-settled', { detail: 'ready' }),
    ),
  );
  await expect(bar).toHaveAttribute('aria-valuenow', '100');
  await page.clock.fastForward(999);
  await expect(page.locator('#ascii-taco-loader')).toBeVisible();
  await page.clock.fastForward(1);
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
});

test('the inline taco draws before React and offers keyboard navigation', async ({
  page,
}) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const canvas = page.locator('#ascii-taco-canvas');
  await expect(canvas).toBeVisible();
  expect(
    await canvas.evaluate((element: HTMLCanvasElement) => {
      const context = element.getContext('2d');
      return context
        ?.getImageData(0, 0, element.width, element.height)
        .data.some((value, index) => index % 4 !== 3 && value > 0);
    }),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await page.reload();
  await page.keyboard.press('Tab');
  await page.getByRole('link', { name: 'Skip loading and view work' }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
});

test('the taco rotates, pauses when hidden and respects motion changes', async ({
  page,
}) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 640, height: 360 });
  await page.goto('/');
  const canvas = page.locator('#ascii-taco-canvas');
  const frame = async () =>
    createHash('sha256')
      .update(
        await canvas.evaluate((element: HTMLCanvasElement) =>
          element.toDataURL(),
        ),
      )
      .digest('hex');
  const initial = await frame();
  await expect.poll(frame).not.toBe(initial);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const hidden = await frame();
  await page.waitForTimeout(200);
  expect(await frame()).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(frame).not.toBe(hidden);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const still = await frame();
  await page.waitForTimeout(200);
  expect(await frame()).toBe(still);
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`the taco hands off only when the real scene is ready at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(60000);
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/*.glb', async (route) => {
      await gate;
      await route.continue();
    });
    try {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#ascii-taco-loader')).toBeVisible();
      expect(
        await page
          .locator('#ascii-taco-loader')
          .evaluate((element) => element.matches(':modal')),
      ).toBe(true);
      expect(
        await page.locator('#ascii-taco-loader').boundingBox(),
      ).toMatchObject({ x: 0, y: 0, ...viewport });
      await expect(page.locator('[data-scene-status]')).toHaveAttribute(
        'data-scene-status',
        'loading',
      );
      await page.screenshot({ path: testInfo.outputPath('taco-loading.png') });
      release();
      await expect(page.locator('[data-scene-status]')).toHaveAttribute(
        'data-scene-status',
        'ready',
        { timeout: 45000 },
      );
      await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
      await expect(page.locator('[data-scene-status] canvas')).toBeVisible();
    } finally {
      release();
    }
  });
}

test('missing Canvas 2D falls back to the loading status', async ({ page }) => {
  await page.route('**/*.js', (route) => route.abort());
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = new Proxy(
      HTMLCanvasElement.prototype.getContext,
      {
        apply(target, receiver, args) {
          return args[0] === '2d'
            ? null
            : Reflect.apply(target, receiver, args);
        },
      },
    );
  });
  await page.goto('/');
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await expect(
    page.getByText('Preparing the stand…', { exact: true }),
  ).toBeVisible();
});
