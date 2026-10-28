import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test('amp video is lazy, owns sound, restores ambience and returns to the saved view', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1280, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  expect(requests.some((url) => /\.mp4|\.mp3|guitar-poster/.test(url))).toBe(
    false,
  );
  const canvas = stage.locator('canvas');
  const original = await canvas.screenshot({
    path: testInfo.outputPath('before-video.png'),
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const box = await canvas.boundingBox();
  const target = metrics.targets.HIT_MUSIC_AMP;
  if (!box || !target) throw new Error('Amp target missing');
  await page.mouse.click(
    box.x + ((target.x + 1) * box.width) / 2,
    box.y + ((1 - target.y) * box.height) / 2,
  );
  const player = page.locator('video');
  const sound = page.locator('[data-music-toggle]');
  const ambient = page.locator('audio[data-audio="ambient"]');
  await expect(stage).toHaveAttribute('data-guitar-phase', 'open');
  await expect
    .poll(() =>
      player.evaluate((element) => (element as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0);
  await expect(sound).toHaveAttribute('data-music-source', 'video');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  expect(
    await player.evaluate((element) => (element as HTMLVideoElement).muted),
  ).toBe(false);
  expect(
    await ambient.evaluate((element) => (element as HTMLAudioElement).paused),
  ).toBe(true);
  expect(requests.some((url) => url.includes('/h6.mp3'))).toBe(false);
  await player.evaluate((element) => {
    const video = element as HTMLVideoElement;
    video.currentTime = 10;
    video.pause();
  });
  await expect(page.locator('[data-guitar-panel]')).toHaveAttribute(
    'data-guitar-playback',
    'paused',
  );
  await page.screenshot({ path: testInfo.outputPath('guitar-desktop.png') });
  await page.keyboard.press('Escape');
  await expect(stage).toHaveAttribute('data-guitar-phase', 'idle');
  await expect(
    page.getByRole('button', { name: "Play Aldo's guitar video" }),
  ).toBeFocused();
  await expect(sound).toHaveAttribute('data-music-source', 'off');
  await expect(player).not.toHaveAttribute('src');
  // Focus return is asserted above; its HTML outline must not affect the camera image comparison.
  await page
    .getByRole('button', { name: "Play Aldo's guitar video" })
    .evaluate((button) => button.blur());
  await canvas.screenshot({ path: testInfo.outputPath('after-video.png') });
  await expect
    .poll(async () => (await canvas.screenshot()).equals(original))
    .toBe(true);
  await sound.click();
  await expect(sound).toHaveAttribute('data-music-state', 'playing');
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(stage).toHaveAttribute('data-guitar-phase', 'open');
  expect(
    await ambient.evaluate((element) => (element as HTMLAudioElement).paused),
  ).toBe(true);
  await page.getByRole('button', { name: 'Close guitar video' }).click();
  await expect(stage).toHaveAttribute('data-guitar-phase', 'idle');
  await expect(sound).toHaveAttribute('data-music-source', 'ambient');
  await expect(sound).toHaveAttribute('data-music-state', 'playing');
  await sound.click();
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(stage).toHaveAttribute('data-guitar-phase', 'open');
  expect(
    await player.evaluate((element) => (element as HTMLVideoElement).muted),
  ).toBe(true);
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Unmute', exact: true }).click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await sound.click();
  expect(
    await player.evaluate((element) => (element as HTMLVideoElement).muted),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(stage).toHaveAttribute('data-guitar-phase', 'idle');
  expect(errors).toEqual([]);
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
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-guitar-phase',
    'open',
  );
  expect(
    await page
      .locator('video')
      .evaluate((player) => (player as HTMLVideoElement).muted),
  ).toBe(true);
  await page.getByRole('button', { name: 'Close guitar video' }).click();
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-guitar-phase',
    'idle',
  );
});
