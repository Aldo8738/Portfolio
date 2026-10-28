import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test.use({ hasTouch: true });

for (const width of [1280, 390]) {
  test(`notebook clicks and keyboard controls frame both pages at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(90000);
    const requests: string[] = [];
    const errors: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const stage = page.locator('[data-scene-status]');
    const canvas = stage.locator('canvas');
    await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
      timeout: 45000,
    });
    await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
    const metrics: SceneMetrics = JSON.parse(
      (await stage.getAttribute('data-scene-metrics')) ?? '{}',
    );
    const box = await canvas.boundingBox();
    const target = metrics.targets.HIT_DRAWINGS_SKETCHBOOK_0;
    if (!box || !target) throw new Error('Notebook target missing');
    const point = {
      x: box.x + ((target.x + 1) * box.width) / 2,
      y: box.y + ((1 - target.y) * box.height) / 2,
    };
    if (width < 600) await page.touchscreen.tap(point.x, point.y);
    else await page.mouse.click(point.x, point.y);
    await expect(canvas).toHaveAttribute('data-drawings-view', 'focused');
    await page.screenshot({
      path: testInfo.outputPath(`drawings-${width}.png`),
    });
    await page.setViewportSize({ width, height: 720 });
    await expect(canvas).toHaveAttribute('data-drawings-view', 'focused');
    await page.getByRole('button', { name: 'Reset view', exact: true }).click();
    await expect(canvas).not.toHaveAttribute('data-drawings-view');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(canvas).toHaveAttribute('data-salsa-motion', 'full');
    await page.getByRole('button', { name: 'Drawings', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(canvas).toHaveAttribute('data-drawings-view', 'focused', {
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Reset view', exact: true }).click();
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete');
    expect(
      requests.some((url) => /\/media\/(drawings|music|sound)/.test(url)),
    ).toBe(false);
    expect(errors).toEqual([]);
  });
}
