import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test('monitor entry preserves development Work styles without duplicating them', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work');
  const readStyles = () =>
    page
      .locator('.project-focus')
      .first()
      .evaluate((element) => {
        const layout = element.querySelector('.project-focus-layout');
        if (!layout) throw new Error('Project layout missing');
        return {
          border: getComputedStyle(element).borderTopStyle,
          padding: getComputedStyle(element).paddingTop,
          display: getComputedStyle(layout).display,
          columns: getComputedStyle(layout).gridTemplateColumns,
        };
      });
  const directStyles = await readStyles();
  expect(directStyles.display).toBe('grid');
  expect(directStyles.border).toBe('solid');
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);

  for (let entry = 0; entry < 2; entry++) {
    const metrics: SceneMetrics = JSON.parse(
      (await stage.getAttribute('data-scene-metrics')) ?? '{}',
    );
    const box = await stage.locator('canvas').boundingBox();
    const target = metrics.targets.HIT_WORK_CRT_SCREEN;
    if (!box || !target) throw new Error('Monitor missing');
    await page.mouse.click(
      box.x + ((target.x + 1) * box.width) / 2,
      box.y + ((1 - target.y) * box.height) / 2,
    );
    await expect(page).toHaveURL(/\/work$/, { timeout: 30000 });
    await expect(page.locator('[data-work-experience]')).toHaveAttribute(
      'data-work-ready',
      'true',
    );
    expect(await readStyles()).toEqual(directStyles);
    await expect(
      page.locator('style[data-vite-dev-id$="/work.css"]'),
    ).toHaveCount(1);
    await expect(page.locator('.project-constellation')).toHaveCount(0);
    await expect(page.locator('#title-knowledge-bridge')).toBeInViewport();
    if (entry === 0) {
      await page.screenshot({ path: 'test-results/monitor-dev-styled.png' });
      await page.goBack();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator('[data-work-experience]')).toHaveCount(0);
    }
  }
});
