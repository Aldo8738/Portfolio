import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test('salsa splats and camera whooshes are lazy, replayable, and obey mute', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 640, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const salsa = page.locator('audio[data-audio="salsa"]');
  const whoosh = page.locator('audio[data-audio="camera"]');
  await page.locator('audio').evaluateAll((players) => {
    for (const player of players) {
      player.setAttribute('data-plays', '0');
      player.addEventListener('playing', () => {
        player.setAttribute(
          'data-plays',
          String(Number(player.getAttribute('data-plays')) + 1),
        );
      });
    }
  });
  const canvas = stage.locator('canvas');
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const box = await canvas.boundingBox();
  const bottle = metrics.targets.SALSA_ORANGE_PIVOT;
  if (!box || !bottle) throw new Error('Salsa target missing');
  const clickBottle = () =>
    page.mouse.click(
      box.x + ((bottle.x + 1) * box.width) / 2,
      box.y + ((1 - bottle.y) * box.height) / 2,
    );
  await clickBottle();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  await expect(salsa).not.toHaveAttribute('src');
  await expect(whoosh).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Sound off' }).click();
  await expect
    .poll(() =>
      salsa.evaluate((audio) => (audio as HTMLAudioElement).readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(canvas).toHaveAttribute('data-salsa-motion', 'full');
  await clickBottle();
  await expect(salsa).toHaveAttribute('data-plays', '1');
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'idle');
  await expect(whoosh).toHaveAttribute('data-plays', '0');
  await expect(page.locator('[data-music-toggle]')).toHaveAttribute(
    'data-music-source',
    'ambient',
  );
  await page.getByRole('button', { name: 'Sound on' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await clickBottle();
  await expect(salsa).toHaveAttribute('data-plays', '1');
  expect(
    await salsa.evaluate((audio) => (audio as HTMLAudioElement).paused),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test('CRT approach whooshes while sound is on and stops audio on entry to Work', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 640, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const whoosh = page.locator('audio[data-audio="camera"]');
  await whoosh.evaluate((player) => {
    player.addEventListener('playing', () =>
      player.setAttribute('data-played', 'true'),
    );
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const box = await stage.locator('canvas').boundingBox();
  const crt = metrics.targets.HIT_WORK_CRT_SCREEN;
  if (!box || !crt) throw new Error('CRT target missing');
  await page.getByRole('button', { name: 'Sound off' }).click();
  await expect
    .poll(() =>
      whoosh.evaluate((player) => (player as HTMLAudioElement).readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(stage.locator('canvas')).toHaveAttribute(
    'data-salsa-motion',
    'full',
  );
  await page.mouse.click(
    box.x + ((crt.x + 1) * box.width) / 2,
    box.y + ((1 - crt.y) * box.height) / 2,
  );
  await expect(page).toHaveURL(/\/work$/, { timeout: 30000 });
  await expect(whoosh).toHaveAttribute('data-played', 'true');
  expect(
    await page
      .locator('audio')
      .evaluateAll((players) =>
        players.every((player) => (player as HTMLAudioElement).paused),
      ),
  ).toBe(true);
});
