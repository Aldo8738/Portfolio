import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

const run = promisify(execFile);

test('development React hydration survives a concurrent production build', async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Disable browser HTTP caching so reload reads the optimized runtime from disk again.
  await page.route('**/*', (route) => route.continue());
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });

  await run(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    env: { ...process.env, NODE_ENV: 'production' },
    timeout: 60000,
  });
  await page.reload();
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset view' }).click();
  expect(errors).toEqual([]);
});
