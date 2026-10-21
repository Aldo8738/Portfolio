import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

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
  const canvas = await page.locator('canvas').boundingBox();
  expect(screen).toBeDefined();
  expect(canvas).not.toBeNull();
  if (!screen || !canvas) throw new Error('Scene target coordinates missing');
  await page.mouse.click(
    canvas.x + ((screen.x + 1) * canvas.width) / 2,
    canvas.y + ((1 - screen.y) * canvas.height) / 2,
  );
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
  expect(metrics.quality).toBe('mobile');
  expect(metrics.calls).toBeLessThan(250);
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
  await page.getByRole('link', { name: 'View work' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
});
