import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test('sound loops grilling, amp takes priority, and muting silences both', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 640, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.mp3')) requests.push(request.url());
  });
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  expect(requests).toEqual([]);
  const ambient = page.locator('audio[data-audio="ambient"]');
  const amp = page.locator('audio[data-audio="amp"]');
  const sound = page.locator('[data-music-toggle]');
  await expect(ambient).not.toHaveAttribute('src');
  await expect(amp).not.toHaveAttribute('src');
  await page.getByRole('button', { name: 'Sound off' }).click();
  await expect
    .poll(() =>
      ambient.evaluate((player) => (player as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0);
  expect(
    await ambient.evaluate((player) => (player as HTMLAudioElement).loop),
  ).toBe(true);
  await expect(amp).not.toHaveAttribute('src');
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const box = await stage.locator('canvas').boundingBox();
  const target = metrics.targets.HIT_MUSIC_AMP;
  if (!box || !target) throw new Error('Amp target missing');
  const clickAmp = () =>
    page.mouse.click(
      box.x + ((target.x + 1) * box.width) / 2,
      box.y + ((1 - target.y) * box.height) / 2,
    );
  await clickAmp();
  await expect
    .poll(() =>
      amp.evaluate((player) => (player as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0);
  await expect(sound).toHaveAttribute('data-music-source', 'amp');
  expect(
    await ambient.evaluate((player) => (player as HTMLAudioElement).paused),
  ).toBe(true);
  expect(
    requests.some((url) => url.endsWith('/media/music/original/h6.mp3')),
  ).toBe(true);
  await clickAmp();
  await expect(sound).toHaveAttribute('data-music-source', 'ambient');
  expect(
    await amp.evaluate((player) => (player as HTMLAudioElement).paused),
  ).toBe(true);
  await expect
    .poll(() =>
      ambient.evaluate((player) => (player as HTMLAudioElement).paused),
    )
    .toBe(false);
  await clickAmp();
  await amp.evaluate((player) => {
    const audio = player as HTMLAudioElement;
    audio.currentTime = audio.duration - 0.1;
  });
  await expect(sound).toHaveAttribute('data-music-source', 'ambient');
  await page.getByRole('button', { name: 'Sound on' }).click();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  expect(
    await ambient.evaluate((player) => (player as HTMLAudioElement).paused),
  ).toBe(true);
  await clickAmp();
  await expect(sound).toHaveAttribute('data-music-source', 'amp');
  await page.getByRole('button', { name: 'Sound on' }).click();
  expect(
    await amp.evaluate((player) => (player as HTMLAudioElement).paused),
  ).toBe(true);
  expect(
    await ambient.evaluate((player) => (player as HTMLAudioElement).paused),
  ).toBe(true);
  await expect(page.getByRole('button', { name: 'Sound off' })).toBeVisible();
});

test('existing sound control works without WebGL and retries a failed background download', async ({
  page,
}) => {
  await page.route('**/*.glb', (route) => route.abort());
  await page.route('**/grilling-meat.mp3', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'failed',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const sound = page.locator('[data-music-toggle]');
  await sound.focus();
  await page.keyboard.press('Space');
  await expect(sound).toHaveAttribute('data-music-state', 'error');
  await page.unroute('**/grilling-meat.mp3');
  await sound.click();
  await expect(sound).toHaveAttribute('data-music-state', 'playing');
  await expect(sound).toHaveAttribute('data-music-source', 'ambient');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
});
