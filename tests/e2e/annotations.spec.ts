import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'ready',
    { timeout: 45000 },
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await expect(page.locator('[data-scene-annotations]')).toHaveAttribute(
    'data-ready',
    'true',
  );
}

test('annotations follow orbit, zoom, resize and reset without blocking the canvas', async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  const layer = page.locator('[data-scene-annotations]');
  const canvas = page.locator('[data-scene-status] canvas');
  const work = layer.locator('[data-annotation="work"]');
  const position = () => work.getAttribute('style');
  const initial = await position();
  await expect(layer.locator('[data-visible="true"]')).toHaveCount(0);
  await expect(page.locator('.scene-work-link')).toHaveCount(0);
  await expect(layer.locator('svg')).toHaveCount(0);
  await page.screenshot({ path: 'docs/qa/diegetic-desktop.png' });
  const metrics = JSON.parse(
    (await page
      .locator('[data-scene-status]')
      .getAttribute('data-scene-metrics')) ?? '{}',
  );
  const paper = metrics.targets.HIT_DRAWINGS_SKETCHBOOK_0;
  await page.mouse.move((paper.x + 1) * 720, (1 - paper.y) * 450);
  await expect(layer.locator('[data-annotation="drawings"]')).toHaveAttribute(
    'data-visible',
    'true',
  );
  await page.screenshot({ path: 'docs/qa/diegetic-hover.png' });
  await page.mouse.move(20, 300);
  await expect(layer.locator('[data-visible="true"]')).toHaveCount(0);

  await expect(layer.locator('[data-annotation-work]')).toHaveCSS(
    'min-height',
    '44px',
  );
  await canvas.focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(position).not.toBe(initial);
  await expect(page.locator('[data-camera-tools]')).toHaveAttribute(
    'data-view-changed',
    'true',
  );
  await expect(page.locator('[data-camera-tools] span')).toHaveAttribute(
    'data-used',
    'true',
  );
  await page.keyboard.press('+');
  for (let step = 0; step < 18; step++) await page.keyboard.press('ArrowLeft');
  await expect(layer.locator('[data-visible="true"]')).toHaveCount(0);
  const explore = layer.getByRole('button', { name: 'Explore', exact: true });
  await explore.click();
  await expect(
    layer.getByRole('button', { name: 'Drawings', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(explore).toBeFocused();
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect.poll(position).toBe(initial);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(layer.locator('[data-visible="true"]')).toHaveCount(0);
  await expect.poll(position).not.toBe(initial);
  await page.mouse.move(200, 380);
  await page.mouse.down();
  await page.mouse.move(350, 400, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('[data-camera-tools]')).toHaveAttribute(
    'data-view-changed',
    'true',
  );
  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
  );
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'failed',
  );
  await expect(layer).toBeHidden();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Work', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('labels wait for the loader and full-motion camera entrance', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.addEventListener(
      'taqueria:scene-settled',
      (event) => event.stopImmediatePropagation(),
      { once: true, capture: true },
    );
  });
  await page.goto('/');
  const canvas = page.locator('[data-scene-status] canvas');
  const layer = page.locator('[data-scene-annotations]');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'ready',
    { timeout: 45000 },
  );
  await expect(canvas).toHaveAttribute('data-camera-entrance', 'waiting');
  await expect(layer).toBeHidden();
  await page.evaluate(() => {
    document.documentElement.dataset.labelsRevealedEarly = 'false';
    const layer = document.querySelector<HTMLElement>(
      '[data-scene-annotations]',
    );
    const canvas = document.querySelector<HTMLCanvasElement>(
      '[data-scene-status] canvas',
    );
    const observer = new MutationObserver(() => {
      if (
        layer?.dataset.ready === 'true' &&
        canvas?.dataset.cameraEntrance !== 'complete'
      )
        document.documentElement.dataset.labelsRevealedEarly = 'true';
    });
    if (layer)
      observer.observe(layer, {
        attributes: true,
        attributeFilter: ['data-ready'],
      });
  });
  await page.keyboard.press('Escape');
  await expect(canvas).toHaveAttribute('data-camera-entrance', 'complete', {
    timeout: 20000,
  });
  await expect(layer).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('html')).toHaveAttribute(
    'data-labels-revealed-early',
    'false',
  );
  await expect(layer.locator('[data-visible="true"]')).toHaveCount(0);
});

test('annotation Work uses the existing monitor transition and restores on Back', async ({
  page,
}) => {
  test.setTimeout(90000);
  await ready(page);
  await page.getByRole('button', { name: 'Explore', exact: true }).click();
  const link = page.locator('[data-annotation-work]');
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work$/, { timeout: 20000 });
  await expect(page.locator('canvas')).toHaveAttribute(
    'data-portfolio-phase',
    'portfolio',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
  await expect(page.locator('[data-scene-annotations]')).not.toBeVisible();
  await page.goBack();
  await expect(link).toBeVisible();
});

for (const [width, height] of [
  [390, 844],
  [844, 390],
  [768, 1024],
] as const) {
  test(`compact actions preserve keyboard and touch access at ${width}px`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await ready(page, width, height);
    const explore = page.getByRole('button', { name: 'Explore', exact: true });
    await explore.tap();
    const actions = page.getByRole('navigation', {
      name: 'Stand interactions',
    });
    for (const control of [
      actions.getByRole('link', { name: 'Work', exact: true }),
      actions.locator('summary'),
      actions.getByRole('button', { name: 'Drawings', exact: true }),
      actions.getByRole('button', { name: "Play Aldo's guitar video" }),
    ]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      if (!box) throw new Error('Action missing');
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y).toBeGreaterThan(80);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    expect(
      requests.some((url) =>
        /\/images\/pictures\/|\/media\/(video|music|drawings)\//.test(url),
      ),
    ).toBe(false);
    await actions
      .getByRole('button', { name: 'Drawings', exact: true })
      .focus();
    await page.keyboard.press('Space');
    await expect(page.locator('canvas')).toHaveAttribute(
      'data-drawings-view',
      'focused',
    );
    await expect(actions).not.toBeVisible();
    await page
      .getByRole('button', { name: 'Back to stand', exact: true })
      .tap();
    await expect(
      actions.getByRole('button', { name: 'Drawings', exact: true }),
    ).toBeFocused();
    await actions.locator('summary').tap();
    const photoPicker = await actions
      .getByRole('navigation', { name: 'Photos', exact: true })
      .boundingBox();
    if (!photoPicker) throw new Error('Photo choices missing');
    expect(photoPicker.y).toBeGreaterThan(90);
    expect(photoPicker.y + photoPicker.height).toBeLessThan(height - 100);
    expect(photoPicker.x).toBeGreaterThanOrEqual(0);
    expect(photoPicker.x + photoPicker.width).toBeLessThanOrEqual(width);
    await actions.getByRole('link', { name: 'Paris', exact: true }).tap();
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-photo-id',
      'paris',
    );
    await page.keyboard.press('Escape');
    await expect(
      actions.getByRole('link', { name: 'Paris', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(explore).toBeFocused();
    await context.close();
  });
}
