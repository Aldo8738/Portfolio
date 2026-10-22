import { expect, test, type Page } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

async function getCrtPosition(page: Page) {
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const box = await page.locator('[data-scene-status] canvas').boundingBox();
  const target = metrics.targets.HIT_WORK_CRT_SCREEN;
  if (!box || !target) throw new Error('CRT target coordinates are missing');
  return {
    x: box.x + ((target.x + 1) * box.width) / 2,
    y: box.y + ((1 - target.y) * box.height) / 2,
  };
}

test('normal-motion camera entrance can be interrupted and reset without blocking work navigation', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  try {
    await page.goto('/');
    const screen = await getCrtPosition(page);
    await page.mouse.move(300, 340);
    await page.mouse.down();
    await page.mouse.move(380, 320);
    await page.mouse.up();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('button', { name: 'Reset view', exact: true }).click();
    await page.mouse.click(screen.x, screen.y);
    await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
  } finally {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
});

test('mobile touch keeps the CRT navigation available', async ({ browser }) => {
  test.setTimeout(60000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const screen = await getCrtPosition(page);
      const metrics: SceneMetrics = JSON.parse(
        (await page
          .locator('[data-scene-status]')
          .getAttribute('data-scene-metrics')) ?? '{}',
      );
      expect(metrics.quality).toBe('mobile');
      await page.touchscreen.tap(screen.x, screen.y);
      await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
    }
  } finally {
    await context.close();
  }
});

test('renders the real frozen stand once, exposes metrics and routes through the CRT', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?debug=1');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  expect(metrics.calls).toBeGreaterThan(0);
  expect(metrics.triangles).toBeGreaterThanOrEqual(70293);
  expect(requests.filter((url) => url.endsWith('.glb'))).toHaveLength(1);
  expect(
    requests.some((url) => /\/media\/(photos|drawings|audio)\//.test(url)),
  ).toBe(false);
  expect(errors).toEqual([]);
  await testInfo.attach('scene-metrics', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });
  await page.screenshot({
    path: testInfo.outputPath('desktop.png'),
    fullPage: true,
  });
  const screen = metrics.targets.HIT_WORK_CRT_SCREEN;
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const canvas = await page.locator('[data-scene-status] canvas').boundingBox();
  expect(screen).toBeDefined();
  expect(canvas).not.toBeNull();
  if (!screen || !canvas) throw new Error('Scene target coordinates missing');
  expect(canvas).toMatchObject({ x: 0, y: 0, width: 1280, height: 720 });
  await page.mouse.click(
    canvas.x + ((screen.x + 1) * canvas.width) / 2,
    canvas.y + ((1 - screen.y) * canvas.height) / 2,
  );
  await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
});

test('drag and scroll explore without activating the CRT, and pointer/keyboard resets restore the view', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Keep software WebGL from accumulating delayed transmission frames during gestures.
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const canvas = page.locator('[data-scene-status] canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas is missing');
  const initial = await canvas.screenshot();
  const target = metrics.targets.HIT_WORK_CRT_SCREEN;
  if (!target) throw new Error('CRT target coordinates are missing');
  const x = box.x + ((target.x + 1) * box.width) / 2;
  const y = box.y + ((1 - target.y) * box.height) / 2;
  await page.mouse.move(x, y);
  await page.mouse.down({ button: 'left' });
  await page.mouse.move(x - 140, y);
  await page.mouse.move(x, y);
  await page.mouse.up({ button: 'left' });
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);

  await page.mouse.move(box.width / 2, box.height / 2);
  await page.mouse.wheel(0, -400);
  const zoomedIn = await canvas.screenshot();
  expect(zoomedIn.equals(initial)).toBe(false);
  await page.mouse.wheel(0, 400);
  expect((await canvas.screenshot()).equals(zoomedIn)).toBe(false);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);
  await canvas.focus();
  await page.keyboard.press('+');
  await canvas.evaluate((element) => element.blur());
  const keyboardZoom = await canvas.screenshot();
  expect(keyboardZoom.equals(initial)).toBe(false);
  await canvas.focus();
  await page.keyboard.press('-');
  await canvas.evaluate((element) => element.blur());
  expect((await canvas.screenshot()).equals(keyboardZoom)).toBe(false);
  await canvas.focus();
  await page.keyboard.press('Home');
  await canvas.evaluate((element) => element.blur());
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);

  await page.mouse.move(box.width / 2, box.height / 2);
  await page.mouse.down({ button: 'left' });
  await page.mouse.move(box.width / 2 + 180, box.height / 2 - 40, {
    steps: 1,
  });
  await page.mouse.up({ button: 'left' });
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  await page.screenshot({
    path: testInfo.outputPath('explored.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);

  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  await canvas.evaluate((element) => element.blur());
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  await canvas.focus();
  await page.keyboard.press('Home');
  await canvas.evaluate((element) => element.blur());
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);
  expect(errors).toEqual([]);
  await page.mouse.click(x, y);
  await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
});

test('blocked model falls back to useful HTML navigation', async ({ page }) => {
  await page.route('**/*.glb', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'failed',
    { timeout: 30000 },
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await page.getByRole('link', { name: 'View work' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
});

test('mobile scene fits and uses the cheaper glass profile', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?debug=1');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  expect(metrics.quality).toBe('mobile');
  // First-frame cost includes one cached shadow bake; steady draws are measured separately.
  expect(metrics.calls).toBeLessThan(400);
  expect(
    await page.locator('[data-scene-status] canvas').boundingBox(),
  ).toMatchObject({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await testInfo.attach('mobile-scene-metrics', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });
  await page.screenshot({
    path: testInfo.outputPath('mobile.png'),
    fullPage: true,
  });
});

test('unsupported WebGL preserves navigation without requesting the model', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.addInitScript(() =>
    Object.defineProperty(window, 'WebGL2RenderingContext', {
      value: undefined,
    }),
  );
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'failed',
  );
  expect(requests.some((url) => url.endsWith('.glb'))).toBe(false);
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await page.getByRole('link', { name: 'View work' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
});
