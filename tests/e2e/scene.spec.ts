import { expect, test, type Page } from '@playwright/test';
import type { SceneMetrics } from '../../src/components/experience/scene-types';

test('Synthwave switches live and renders on desktop and mobile', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      /THREE|shader|WebGL/i.test(message.text())
    )
      errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?quality=standard');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'ready',
    { timeout: 45000 },
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await page.getByText('Choose salsa', { exact: true }).click();
  await page.getByRole('button', { name: 'Synthwave', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.screenshot({
      path: testInfo.outputPath(`synthwave-${viewport.width}.png`),
    });
  }
  await page.getByRole('button', { name: 'Original', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');
  expect(errors).toEqual([]);
});

async function getCrtPosition(page: Page) {
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const box = await page.locator('[data-scene-status] canvas').boundingBox();
  const target = metrics.targets.HIT_WORK_CRT_SCREEN;
  if (!box || !target) throw new Error('CRT target coordinates are missing');
  return {
    x: box.x + ((target.x + 1) * box.width) / 2,
    y: box.y + ((1 - target.y) * box.height) / 2,
  };
}

test('stand sauce bottles select themes and keep HTML controls synchronized', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await getCrtPosition(page);
  const stage = page.locator('[data-scene-status]');
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const box = await stage.locator('canvas').boundingBox();
  if (!box) throw new Error('Scene canvas missing');
  for (const [node, theme] of [
    ['SALSA_ORANGE_PIVOT', 'synthwave'],
    ['SALSA_GREEN_PIVOT', 'noir'],
    ['SALSA_RED_PIVOT', 'original'],
  ] as const) {
    const target = metrics.targets[node];
    if (!target) throw new Error(`Bottle target missing: ${node}`);
    await page.mouse.click(
      box.x + ((target.x + 1) * box.width) / 2,
      box.y + ((1 - target.y) * box.height) / 2,
    );
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator(`[data-theme-id="${theme}"]`)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(stage.locator('canvas')).toHaveAttribute(
      'data-salsa-phase',
      'idle',
    );
    expect(
      await page.evaluate(() => localStorage.getItem('taqueria-theme')),
    ).toBe(theme);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'original';
      window.dispatchEvent(new CustomEvent('taqueria:theme'));
    });
  }
});

test('monitor tile activation restores the original screen on browser Back', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const point = await getCrtPosition(page);
  const canvas = page.locator('[data-scene-status] canvas');
  const original = await canvas.screenshot();
  await page.mouse.click(point.x, point.y);
  await expect(page).toHaveURL(/\/work$/, { timeout: 30000 });
  await expect(canvas).not.toHaveAttribute(
    'data-matrix-rain',
    /playing|holding/,
  );
  await page.goBack();
  await expect(canvas).toHaveAttribute('data-portfolio-phase', 'idle');
  await expect
    .poll(async () => (await canvas.screenshot()).equals(original))
    .toBe(true);
});

test('interactive objects show a pointer and empty scene restores grab', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const crt = await getCrtPosition(page);
  const canvas = page.locator('[data-scene-status] canvas');
  await page.mouse.move(crt.x, crt.y);
  await expect(canvas).toHaveCSS('cursor', 'pointer');
  await page.mouse.move(350, 150);
  await expect(canvas).toHaveCSS('cursor', 'grab');
});

test('salsa squeezes directly, spreads its theme and settles without moving the camera', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-10-28T10:00:00Z') });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await getCrtPosition(page);
  await page.clock.pauseAt(new Date('2026-10-28T11:00:00Z'));
  const stage = page.locator('[data-scene-status]');
  const canvas = stage.locator('canvas');
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  const box = await canvas.boundingBox();
  const target = metrics.targets.SALSA_ORANGE_PIVOT;
  if (!box || !target) throw new Error('Salsa target missing');
  await canvas.evaluate((element) => {
    const phases: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.oldValue) phases.push(record.oldValue);
      }
      phases.push(element.getAttribute('data-salsa-phase') ?? '');
      element.setAttribute('data-salsa-observed', JSON.stringify(phases));
    });
    observer.observe(element, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['data-salsa-phase'],
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(canvas).toHaveAttribute('data-salsa-motion', 'full');
  await page.mouse.click(
    box.x + ((target.x + 1) * box.width) / 2,
    box.y + ((1 - target.y) * box.height) / 2,
  );
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'squeeze');
  await page.clock.runFor(330);
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'release');
  await page.screenshot({ path: testInfo.outputPath('salsa-droplets.png') });
  await page.clock.runFor(250);
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'ripple');
  await page.screenshot({ path: testInfo.outputPath('salsa-ripple.png') });
  await page.clock.runFor(650);
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'idle');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete');
  const phases = JSON.parse(
    (await canvas.getAttribute('data-salsa-observed')) ?? '[]',
  );
  expect(phases).toEqual(
    expect.arrayContaining(['squeeze', 'release', 'ripple', 'idle']),
  );
  await page.screenshot({ path: testInfo.outputPath('salsa-settled.png') });
  await page.getByText('Choose salsa', { exact: true }).click();
  await page.locator('[data-theme-id="noir"]').focus();
  await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'squeeze');
  await page
    .locator('[data-theme-id="original"]')
    .evaluate((button) => (button as HTMLButtonElement).click());
  await page.clock.runFor(1200);
  await expect(canvas).toHaveAttribute('data-salsa-phase', 'idle');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'original');
  await expect(page.locator('[data-theme-id="original"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(errors).toEqual([]);
});

test('touch selects salsa without hover or camera movement', async ({
  browser,
}) => {
  test.setTimeout(60000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await getCrtPosition(page);
    const stage = page.locator('[data-scene-status]');
    const metrics: SceneMetrics = JSON.parse(
      (await stage.getAttribute('data-scene-metrics')) ?? '{}',
    );
    const box = await stage.locator('canvas').boundingBox();
    const target = metrics.targets.SALSA_GREEN_PIVOT;
    if (!box || !target) throw new Error('Mobile salsa target missing');
    await page.touchscreen.tap(
      box.x + ((target.x + 1) * box.width) / 2,
      box.y + ((1 - target.y) * box.height) / 2,
    );
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
    await expect(stage.locator('canvas')).toHaveAttribute(
      'data-salsa-phase',
      'idle',
    );
    await expect(stage.locator('canvas')).toHaveAttribute(
      'data-camera-entrance',
      'complete',
    );
  } finally {
    await context.close();
  }
});

test('normal-motion camera entrance can be interrupted and reset without blocking work navigation', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const screen = await getCrtPosition(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  try {
    await page.goto('/');
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-scene-status',
      'ready',
      { timeout: 45000 },
    );
    await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
    const canvas = page.locator('[data-scene-status] canvas');
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'running');
    await page.mouse.move(300, 340);
    await page.mouse.down();
    await page.mouse.move(380, 320);
    await page.mouse.up();
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'interrupted');
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('button', { name: 'Reset view', exact: true }).click();
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete');
    await canvas.evaluate((element) => {
      const observer = new MutationObserver(() => {
        if (element.getAttribute('data-camera-entrance') === 'resetting') {
          sessionStorage.setItem('monitor-zoom-observed', 'true');
          observer.disconnect();
        }
      });
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['data-camera-entrance'],
      });
    });
    await page.mouse.click(screen.x, screen.y);
    await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem('monitor-zoom-observed'),
      ),
    ).toBe('true');
  } finally {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`the rear orbit waits for the loader, pauses when hidden and ends at Reset view at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const screen = await getCrtPosition(page);
    await page.addInitScript(() => {
      window.addEventListener(
        'taqueria:scene-settled',
        (event) => event.stopImmediatePropagation(),
        { once: true, capture: true },
      );
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-scene-status',
      'ready',
      { timeout: 45000 },
    );
    const canvas = page.locator('[data-scene-status] canvas');
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'waiting');
    await page.waitForTimeout(200);
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'waiting');
    await page.keyboard.press('Escape');
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'running');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(100);
    const paused = await canvas.screenshot();
    await page.waitForTimeout(250);
    expect((await canvas.screenshot()).equals(paused)).toBe(true);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete', {
      timeout: 15000,
    });
    await page.mouse.click(screen.x, screen.y);
    await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
  });
}

test('mobile touch keeps the CRT navigation available', async ({ browser }) => {
  test.setTimeout(60000);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      const screen = await getCrtPosition(page);
      const metrics: SceneMetrics = JSON.parse(
        (await page
          .locator('[data-scene-status]')
          .getAttribute('data-scene-metrics')) ?? '{}',
      );
      expect(metrics.quality).toBe('mobile');
      await page.touchscreen.tap(screen.x, screen.y);
      await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
    }
  } finally {
    await context.close();
  }
});

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
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const canvas = await page.locator('[data-scene-status] canvas').boundingBox();
  expect(screen).toBeDefined();
  expect(canvas).not.toBeNull();
  if (!screen || !canvas) throw new Error('Scene target coordinates missing');
  expect(canvas).toMatchObject({ x: 0, y: 0, width: 1280, height: 720 });
  await page.mouse.click(
    canvas.x + ((screen.x + 1) * canvas.width) / 2,
    canvas.y + ((1 - screen.y) * canvas.height) / 2,
  );
  await expect(page).toHaveURL(/\/work$/, { timeout: 15000 });
});

test('drag and scroll explore without activating the CRT, and pointer/keyboard resets restore the view', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Keep software WebGL from accumulating delayed transmission frames during gestures.
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const stage = page.locator('[data-scene-status]');
  await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
    timeout: 45000,
  });
  const metrics: SceneMetrics = JSON.parse(
    (await stage.getAttribute('data-scene-metrics')) ?? '{}',
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  const canvas = page.locator('[data-scene-status] canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas is missing');
  const initial = await canvas.screenshot();
  const target = metrics.targets.HIT_WORK_CRT_SCREEN;
  if (!target) throw new Error('CRT target coordinates are missing');
  const x = box.x + ((target.x + 1) * box.width) / 2;
  const y = box.y + ((1 - target.y) * box.height) / 2;
  await page.mouse.move(x, y);
  await page.mouse.down({ button: 'left' });
  await page.mouse.move(x - 140, y);
  await page.mouse.move(x, y);
  await page.mouse.up({ button: 'left' });
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);

  await page.mouse.move(box.width / 2, box.height / 2);
  await page.mouse.wheel(0, -400);
  const zoomedIn = await canvas.screenshot();
  expect(zoomedIn.equals(initial)).toBe(false);
  await page.mouse.wheel(0, 400);
  expect((await canvas.screenshot()).equals(zoomedIn)).toBe(false);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);
  await canvas.focus();
  await page.keyboard.press('+');
  await canvas.evaluate((element) => element.blur());
  const keyboardZoom = await canvas.screenshot();
  expect(keyboardZoom.equals(initial)).toBe(false);
  await canvas.focus();
  await page.keyboard.press('-');
  await canvas.evaluate((element) => element.blur());
  expect((await canvas.screenshot()).equals(keyboardZoom)).toBe(false);
  await canvas.focus();
  await page.keyboard.press('Home');
  await canvas.evaluate((element) => element.blur());
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);

  await page.mouse.move(box.width / 2, box.height / 2);
  await page.mouse.down({ button: 'left' });
  await page.mouse.move(box.width / 2 + 180, box.height / 2 - 40, {
    steps: 1,
  });
  await page.mouse.up({ button: 'left' });
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  await page.screenshot({
    path: testInfo.outputPath('explored.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);

  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  await canvas.evaluate((element) => element.blur());
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  await canvas.focus();
  await page.keyboard.press('Home');
  await canvas.evaluate((element) => element.blur());
  await expect
    .poll(async () => (await canvas.screenshot()).equals(initial))
    .toBe(true);
  expect(errors).toEqual([]);
  await page.mouse.click(x, y);
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
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
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
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  expect(metrics.quality).toBe('mobile');
  // First-frame cost includes one cached shadow bake; steady draws are measured separately.
  expect(metrics.calls).toBeLessThan(400);
  expect(
    await page.locator('[data-scene-status] canvas').boundingBox(),
  ).toMatchObject({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  });
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
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await page.getByRole('link', { name: 'View work' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
});
