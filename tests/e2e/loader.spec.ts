import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';

test('the prepared stand stops redrawing behind the ASCII loader', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 640, height: 480 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    let draws = 0;
    let downloaded = 0;
    Object.defineProperty(window, '__testDownloadedBytes', {
      get: () => downloaded,
    });
    window.addEventListener('taqueria:scene-progress', (event) => {
      downloaded = (event as CustomEvent<{ loaded: number }>).detail.loaded;
    });
    Object.defineProperty(window, '__testWebglDraws', { get: () => draws });
    for (const name of ['drawElements', 'drawArrays'] as const) {
      Object.defineProperty(WebGL2RenderingContext.prototype, name, {
        value: new Proxy(WebGL2RenderingContext.prototype[name], {
          apply(target, receiver, args) {
            draws++;
            return Reflect.apply(target, receiver, args);
          },
        }),
      });
    }
    // Hold the loader after preparation so its covered render budget can be checked.
    window.addEventListener(
      'taqueria:scene-settled',
      (event) => event.stopImmediatePropagation(),
      { once: true, capture: true },
    );
  });
  try {
    await page.goto('/');
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-scene-status',
      'ready',
      { timeout: 45000 },
    );
    await expect(page.locator('#ascii-taco-loader')).toBeVisible();
    expect(
      await page.evaluate(() =>
        Number(Reflect.get(window, '__testDownloadedBytes')),
      ),
    ).toBeGreaterThan(0);
    const draws = () =>
      page.evaluate(() => Number(Reflect.get(window, '__testWebglDraws')));
    // Allow the final React commit and initial control invalidations to settle.
    await page.waitForTimeout(250);
    const prepared = await draws();
    expect(prepared).toBeGreaterThan(0);
    const ascii = page.locator('#ascii-taco-canvas');
    const frame = async () =>
      createHash('sha256')
        .update(
          await ascii.evaluate((canvas: HTMLCanvasElement) =>
            canvas.toDataURL(),
          ),
        )
        .digest('hex');
    const initial = await frame();
    await expect.poll(frame).not.toBe(initial);
    await page.waitForTimeout(350);
    expect(await draws()).toBe(prepared);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
    await expect.poll(draws).toBeGreaterThan(prepared);
  } finally {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
});

test('the taco and ASCII progress bar remain visible for at least 400 ms', async ({
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
  await expect(bar.locator('.ascii-track')).toHaveText(
    '[░░░░░░░░░░░░░░░░░░░░]',
  );
  await expect(bar.locator('.ascii-fill')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.loading-caption')).toHaveText(
    'Loading Taquería Aldo…',
  );
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
  for (const loaded of [25, 75, 100]) {
    await page.evaluate(
      (loaded) =>
        window.dispatchEvent(
          new CustomEvent('taqueria:scene-progress', {
            detail: { loaded, total: 100 },
          }),
        ),
      loaded,
    );
    await expect(bar).toHaveAttribute(
      'aria-valuenow',
      String(Math.min(99, loaded)),
    );
  }
  await expect(page.locator('.loading-caption')).toHaveText(
    'Download complete. Preparing the scene…',
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('taqueria:scene-settled', { detail: 'ready' }),
    ),
  );
  await expect(bar).toHaveAttribute('aria-valuenow', '100');
  await page.clock.fastForward(399);
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
