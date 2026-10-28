import { expect, test, type Page } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';
import { photos } from '../../src/content/media';

async function ready(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  return stage;
}

test('visible photos remain clickable while another photo is focused', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const stage = await ready(page);
  await page.getByText('Photos', { exact: true }).click();
  await page.getByRole('link', { name: 'Lucha', exact: true }).click();
  await expect(stage).toHaveAttribute('data-photo-state', 'focused');
  const box = await stage.locator('canvas').boundingBox();
  if (!box) throw new Error('Scene canvas missing');
  await page.screenshot({ path: testInfo.outputPath('visible-neighbor.png') });
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.55);
  await expect(stage).toHaveAttribute('data-photo-id', 'paris');
  await expect(stage).toHaveAttribute('data-photo-state', 'focused');
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(stage).toHaveAttribute('data-photo-state', 'focused');
  await page
    .getByRole('button', { name: 'Back to stand', exact: true })
    .click();
  await expect(stage).not.toHaveAttribute('data-photo-state');
});

for (const width of [640, 390]) {
  test(`photos stay in the scene with arrows and a clean return at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 844 });
    const errors: string[] = [];
    const originals: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.url().includes('/images/pictures/'))
        originals.push(request.url());
    });
    const stage = await ready(page);
    const canvas = stage.locator('canvas');
    expect(originals).toEqual([]);
    const metrics: SceneMetrics = JSON.parse(
      (await stage.getAttribute('data-scene-metrics')) ?? '{}',
    );
    const box = await canvas.boundingBox();
    const target = metrics.targets.HIT_PHOTOS_POLAROID_0;
    if (!box || !target) throw new Error('Photo target missing');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.mouse.click(
      box.x + ((target.x + 1) * box.width) / 2,
      box.y + ((1 - target.y) * box.height) / 2,
    );
    const controls = page.getByRole('navigation', { name: 'Photo navigation' });
    await expect(stage).toHaveAttribute('data-photo-id', 'lucha');
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(stage.locator('img')).toHaveCount(0);
    await expect(
      controls.getByRole('button', { name: 'Back to stand' }),
    ).toBeFocused();
    expect(originals.length === 0).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`lucha-scene-${width}.png`),
    });
    await controls.getByRole('button', { name: 'Next photo' }).click();
    await expect(stage).toHaveAttribute('data-photo-id', 'paris');
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    await expect(
      controls.getByRole('button', { name: 'Next photo' }),
    ).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(`paris-scene-${width}.png`),
    });
    await controls.getByRole('button', { name: 'Previous photo' }).click();
    await expect(stage).toHaveAttribute('data-photo-id', 'lucha');
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    await controls.getByRole('button', { name: 'Previous photo' }).click();
    await expect(stage).toHaveAttribute('data-photo-id', 'canal');
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    await page.screenshot({
      path: testInfo.outputPath(`canal-scene-${width}.png`),
    });
    await controls.getByRole('button', { name: 'Previous photo' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(stage).toHaveAttribute('data-photo-id', 'lucha');
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    await page.setViewportSize({ width, height: 700 });
    await expect(stage).toHaveAttribute('data-photo-id', 'lucha');
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    await page.keyboard.press('Escape');
    await expect(controls).toHaveCount(0);
    await expect(stage).not.toHaveAttribute('data-photo-state');
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete');
    await expect(
      page.getByRole('button', { name: 'Reset view', exact: true }),
    ).toBeVisible();
    expect(originals).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('HTML controls keep embedded textures and restore focus after rapid photo changes', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.route('**/images/pictures/paris-middle-image.png', (route) =>
    route.abort(),
  );
  const stage = await ready(page);
  await page.getByText('Photos', { exact: true }).click();
  const opener = page.getByRole('link', { name: 'Paris', exact: true });
  await opener.click();
  await expect(stage).toHaveAttribute('data-photo-id', 'paris');
  await expect(stage).toHaveAttribute('data-photo-state', 'focused');
  const controls = page.getByRole('navigation', { name: 'Photo navigation' });
  for (let index = 0; index < 4; index++)
    await controls.getByRole('button', { name: 'Next photo' }).click();
  await expect(stage).toHaveAttribute('data-photo-id', 'canal');
  await expect(stage).toHaveAttribute('data-photo-state', 'focused');
  await controls.getByRole('button', { name: 'Back to stand' }).click();
  await expect(controls).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('photo links remain ordinary original-image links when WebGL fails', async ({
  page,
}) => {
  await page.route('**/*.glb', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'failed',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await page.getByText('Photos', { exact: true }).click();
  const link = page.getByRole('link', { name: 'Lucha', exact: true });
  await expect(link).toHaveAttribute('href', photos[0]?.original ?? '');
  await link.click();
  await expect(page).toHaveURL(
    /\/images\/pictures\/lucha-libre-left-image\.jpg$/,
  );
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
