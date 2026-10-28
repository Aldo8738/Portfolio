import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'ready',
    { timeout: 45000 },
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
}

test('blocked playback and failed media remain recoverable', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLVideoElement && !this.dataset.allowed) {
        this.dataset.allowed = 'true';
        return Promise.reject(
          new DOMException('Test browser gesture rejection', 'NotAllowedError'),
        );
      }
      return play.call(this);
    };
  });
  await ready(page);
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(
    page.getByRole('button', { name: 'Play performance', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Play performance', exact: true })
    .click();
  await expect(page.locator('[data-guitar-panel]')).toHaveAttribute(
    'data-guitar-playback',
    'playing',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-guitar-phase',
    'idle',
  );
  await page.route('**/media/video/guitar.mp4', (route) => route.abort());
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(
    page.getByRole('button', { name: 'Retry video', exact: true }),
  ).toBeVisible();
  await page.unroute('**/media/video/guitar.mp4');
  await page.getByRole('button', { name: 'Retry video', exact: true }).click();
  await expect(page.locator('[data-guitar-panel]')).toHaveAttribute(
    'data-guitar-playback',
    'playing',
  );
  await page.getByRole('button', { name: 'Close guitar video' }).click();
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-guitar-phase',
    'idle',
  );
});

test('buffering remains closable without waiting for the video response', async ({
  page,
}) => {
  test.setTimeout(60000);
  await ready(page);
  await page.route('**/media/video/guitar.mp4', () => {});
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-guitar-phase',
    'open',
  );
  await expect(page.locator('[data-guitar-panel]')).toHaveAttribute(
    'data-guitar-playback',
    'loading',
  );
  await expect(page.locator('video')).toHaveAttribute(
    'poster',
    '/media/video/guitar-poster.jpg',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-guitar-phase',
    'idle',
  );
  await expect(page.locator('video')).not.toHaveAttribute('src');
});

test('normal motion survives early close, repeats, hidden tabs and navigation with no idle scene loop', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await ready(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const stage = page.locator('[data-scene-status]');
  const canvas = stage.locator('canvas');
  await expect(canvas).toHaveAttribute('data-salsa-motion', 'full');
  for (let visit = 0; visit < 3; visit++) {
    await page
      .getByRole('button', { name: "Play Aldo's guitar video" })
      .click();
    if (visit !== 0)
      await expect(stage).toHaveAttribute('data-guitar-phase', 'open');
    await page.keyboard.press('Escape');
    await expect(stage).toHaveAttribute('data-guitar-phase', 'idle');
    await expect(
      page.getByRole('button', { name: "Play Aldo's guitar video" }),
    ).toBeFocused();
    await expect(canvas).toHaveCSS('cursor', 'grab');
  }
  await page.getByRole('button', { name: "Play Aldo's guitar video" }).click();
  await expect(stage).toHaveAttribute('data-guitar-phase', 'open');
  await expect(page.locator('[data-guitar-panel]')).toHaveAttribute(
    'data-guitar-playback',
    'playing',
  );
  await page.screenshot({
    path: testInfo.outputPath('guitar-composition.png'),
  });
  expect(await canvas.count()).toBe(1);
  await page.evaluate(() => {
    document.documentElement.dataset.guitarDraws = '0';
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      document.documentElement.dataset.guitarDraws = String(
        Number(document.documentElement.dataset.guitarDraws) + 1,
      );
      return original.apply(this, args);
    };
  });
  await page.waitForTimeout(250);
  await expect(page.locator('html')).toHaveAttribute('data-guitar-draws', '0');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('[data-guitar-panel]')).toHaveAttribute(
    'data-guitar-playback',
    'paused',
  );
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(
    await page
      .locator('video')
      .evaluate((video) => (video as HTMLVideoElement).paused),
  ).toBe(true);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Work', exact: true })
    .click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator('video')).toHaveCount(0);
});

test('mobile touch preserves the portrait footage and keeps controls within reach', async ({
  browser,
}, testInfo) => {
  test.setTimeout(90000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await ready(page);
    await page.getByRole('button', { name: "Play Aldo's guitar video" }).tap();
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-guitar-phase',
      'open',
    );
    await expect(
      page.getByRole('button', { name: 'Close guitar video' }),
    ).toBeInViewport();
    await expect(page.locator('video')).toHaveJSProperty('videoWidth', 720);
    await expect(page.locator('video')).toHaveJSProperty('videoHeight', 1280);
    await expect(page.locator('video')).toHaveCSS('object-fit', 'contain');
    await expect(page.locator('video')).toHaveAttribute('playsinline', '');
    await page.screenshot({ path: testInfo.outputPath('guitar-mobile.png') });
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(
      page.getByRole('button', { name: 'Close guitar video' }),
    ).toBeInViewport();
    await page.getByRole('button', { name: 'Close guitar video' }).tap();
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-guitar-phase',
      'idle',
    );
  } finally {
    await context.close();
  }
});
