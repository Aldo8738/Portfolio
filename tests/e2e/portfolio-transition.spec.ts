import { expect, test } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test('monitor handoff does not replay the Work page entrance', async ({
  page,
}) => {
  test.setTimeout(90000);
  const workRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/work')
      workRequests.push(request.resourceType());
  });
  await page.setViewportSize({ width: 640, height: 720 });
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
  const target = metrics.targets.HIT_WORK_CRT_SCREEN;
  if (!box || !target) throw new Error('Monitor target missing');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(canvas).toHaveAttribute('data-salsa-motion', 'full');
  await page.evaluate(() => {
    document.documentElement.dataset.workEntranceReplayed = 'false';
    const observer = new MutationObserver(() => {
      if (document.querySelector('canvas[data-portfolio-phase="portfolio"]')) {
        const content = document.querySelectorAll(
          '.portfolio-destination .work-header > *, .portfolio-destination [data-project-title]',
        );
        for (const element of content) {
          const rect = element.getBoundingClientRect();
          if (
            rect.top < innerHeight &&
            rect.bottom > 0 &&
            Number(getComputedStyle(element).opacity) < 0.99
          )
            document.documentElement.dataset.workEntranceReplayed = 'true';
        }
      }
    });
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'data-portfolio-phase', 'data-work-ready'],
    });
  });
  await page.mouse.click(
    box.x + ((target.x + 1) * box.width) / 2,
    box.y + ((1 - target.y) * box.height) / 2,
  );
  await expect(page).toHaveURL(/\/work$/, { timeout: 30000 });
  const work = page.locator('[data-work-experience]');
  await expect(work).toHaveAttribute('data-work-ready', 'true');
  await expect(work.locator('h1')).toHaveCSS('opacity', '1');
  await expect(page.locator('html')).toHaveAttribute(
    'data-work-entrance-replayed',
    'false',
  );
  expect(workRequests).toEqual(['fetch']);
  const first = work.locator('[data-project-section]').first();
  await work.locator('[data-project-section]').last().scrollIntoViewIfNeeded();
  await expect(first).not.toBeInViewport();
  await first.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  const title = first.locator('[data-project-title]');
  await expect
    .poll(() =>
      title.evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeLessThan(0.99);
  await expect(title).toHaveCSS('opacity', '1');
});

for (const motion of ['reduce', 'no-preference'] as const) {
  test(`mobile ${motion} monitor entry reveals usable work content`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const stage = page.locator('[data-scene-status]');
    await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
      timeout: 45000,
    });
    await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
    const metrics: SceneMetrics = JSON.parse(
      (await stage.getAttribute('data-scene-metrics')) ?? '{}',
    );
    const box = await stage.locator('canvas').boundingBox();
    const target = metrics.targets.HIT_WORK_CRT_SCREEN;
    if (!box || !target) throw new Error('Monitor missing');
    await page.emulateMedia({ reducedMotion: motion });
    await page.mouse.click(
      box.x + ((target.x + 1) * box.width) / 2,
      box.y + ((1 - target.y) * box.height) / 2,
    );
    await expect(page).toHaveURL(/\/work$/, { timeout: 30000 });
    await expect(
      page.getByRole('heading', { name: 'Selected work.', exact: true }),
    ).toBeVisible();
    expect(await page.locator('canvas[data-engine]').count()).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const work = page.locator('[data-work-experience]');
    await expect(work).toHaveAttribute('data-work-ready', 'true');
    await expect(page.locator('.project-sequence')).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(work).toHaveCount(0);
  });
}

test('monitor reconstructs real work HTML, replays and supports browser Back', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const locations = new WeakSet<WebGLUniformLocation>();
    const prototype = WebGL2RenderingContext.prototype;
    const getLocation = prototype.getUniformLocation;
    const uniform4fv = prototype.uniform4fv;
    prototype.getUniformLocation = function (program, name) {
      const location = getLocation.call(this, program, name);
      if (location && name === 'revealRegions[0]') locations.add(location);
      return location;
    };
    prototype.uniform4fv = function (location, values, ...rest) {
      if (location && locations.has(location))
        sessionStorage.setItem(
          'portfolio-reveal-regions',
          JSON.stringify(Array.from(values)),
        );
      return uniform4fv.call(this, location, values, ...rest);
    };
  });
  await page.goto('/?debug=1');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const target = metrics.targets.HIT_WORK_CRT_SCREEN;
  const canvas = stage.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box || !target) throw new Error('Monitor missing');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete');
  await canvas.evaluate((element) => {
    const observer = new MutationObserver(() => {
      const phase = element.getAttribute('data-portfolio-phase');
      if (
        phase === 'activation' ||
        phase === 'wormhole' ||
        phase === 'decompose' ||
        phase === 'reconstruct'
      )
        window.dispatchEvent(
          new CustomEvent('taqueria:pause-portfolio', { detail: true }),
        );
      if (phase === 'reconstruct') observer.disconnect();
    });
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-portfolio-phase'],
    });
  });
  await page.mouse.click(
    box.x + ((target.x + 1) * box.width) / 2,
    box.y + ((1 - target.y) * box.height) / 2,
  );
  await expect(canvas).toHaveAttribute('data-portfolio-phase', 'activation', {
    timeout: 30000,
  });
  await page.screenshot({ path: testInfo.outputPath('approach.png') });
  await expect(canvas).not.toHaveAttribute(
    'data-matrix-rain',
    /playing|holding/,
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('taqueria:pause-portfolio', { detail: false }),
    ),
  );
  await expect(canvas).toHaveAttribute('data-portfolio-phase', 'wormhole', {
    timeout: 30000,
  });
  await page.screenshot({ path: testInfo.outputPath('wormhole.png') });
  await expect(canvas).not.toHaveAttribute(
    'data-matrix-rain',
    /playing|holding/,
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new CustomEvent('taqueria:pause-portfolio', { detail: false }),
    ),
  );
  for (const phase of ['decompose', 'reconstruct']) {
    await expect(canvas).toHaveAttribute('data-portfolio-phase', phase, {
      timeout: 30000,
    });
    await page.screenshot({ path: testInfo.outputPath(`${phase}.png`) });
    if (phase === 'reconstruct') {
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('taqueria:pause-portfolio', { detail: false }),
        );
        setTimeout(
          () =>
            window.dispatchEvent(
              new CustomEvent('taqueria:pause-portfolio', { detail: true }),
            ),
          300,
        );
      });
      await page.waitForTimeout(400);
      await expect(page.locator('.portfolio-destination')).toHaveCSS(
        'opacity',
        '1',
      );
      const regions = await page.evaluate(() => {
        const actual: unknown = JSON.parse(
          sessionStorage.getItem('portfolio-reveal-regions') ?? 'null',
        );
        const expected = [
          '.page-intro',
          '.site-header',
          '.project-focus',
        ].flatMap((selector) => {
          const rect = document
            .querySelector('.portfolio-destination')
            ?.querySelector(selector)
            ?.getBoundingClientRect();
          if (!rect) throw new Error(`Reveal region missing: ${selector}`);
          return [
            Math.max(0, rect.left / innerWidth),
            Math.max(0, rect.top / innerHeight),
            Math.min(1, rect.right / innerWidth),
            Math.min(1, rect.bottom / innerHeight),
          ];
        });
        return { actual, expected };
      });
      const actual = regions.actual;
      expect(Array.isArray(actual)).toBe(true);
      if (!Array.isArray(actual)) throw new Error('Reveal uniforms missing');
      expect(actual).toHaveLength(12);
      regions.expected.forEach((value, index) => {
        expect(Math.abs(Number(actual[index]) - value)).toBeLessThan(0.02);
      });
      await page.screenshot({
        path: testInfo.outputPath('pixel-mask-handoff.png'),
      });
    }
    await page.evaluate(() =>
      window.dispatchEvent(
        new CustomEvent('taqueria:pause-portfolio', { detail: false }),
      ),
    );
  }
  await expect(page).toHaveURL(/\/work$/, { timeout: 60000 });
  await expect(
    page.getByRole('heading', { name: 'Selected work.', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Synthwave', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  await page.screenshot({ path: testInfo.outputPath('portfolio.png') });
  expect(await page.locator('canvas[data-engine]').count()).toBe(1);
  await page.evaluate(() => {
    document.documentElement.dataset.postTransitionDraws = '0';
    const prototype = WebGL2RenderingContext.prototype;
    const original = prototype.drawElements;
    prototype.drawElements = function (...args) {
      document.documentElement.dataset.postTransitionDraws = String(
        Number(document.documentElement.dataset.postTransitionDraws) + 1,
      );
      return original.apply(this, args);
    };
  });
  await page.waitForTimeout(250);
  await expect(page.locator('html')).toHaveAttribute(
    'data-post-transition-draws',
    '0',
  );

  await page.getByRole('button', { name: 'Replay monitor transition' }).click();
  await expect(page).toHaveURL(/\/work$/, { timeout: 60000 });
  await page.goBack();
  await expect(stage).toBeVisible();
  expect(errors).toEqual([]);
});
