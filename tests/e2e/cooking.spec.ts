import { expect, test } from '@playwright/test';

test('cooking shaders animate only after reveal and pause with visibility or reduced motion', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 640, height: 720 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const times = new WeakSet<WebGLUniformLocation>();
    let latest = 0;
    Object.defineProperty(window, '__cookingTime', { get: () => latest });
    const prototype = WebGL2RenderingContext.prototype;
    prototype.getUniformLocation = new Proxy(prototype.getUniformLocation, {
      apply(target, receiver, args: [WebGLProgram, string]) {
        const location = Reflect.apply(target, receiver, args);
        if (location && args[1] === 'time') times.add(location);
        return location;
      },
    });
    prototype.uniform1f = new Proxy(prototype.uniform1f, {
      apply(target, receiver, args: [WebGLUniformLocation | null, number]) {
        if (args[0] && times.has(args[0])) latest = args[1];
        return Reflect.apply(target, receiver, args);
      },
    });
    window.addEventListener(
      'taqueria:scene-settled',
      (event) => event.stopImmediatePropagation(),
      { once: true, capture: true },
    );
  });
  const time = () =>
    page.evaluate(() => Number(Reflect.get(window, '__cookingTime')));
  const visibility = (hidden: boolean) =>
    page.evaluate((value) => {
      Object.defineProperty(document, 'hidden', { value, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
  try {
    await page.goto('/?benchmark=1');
    await expect(page.locator('[data-scene-status]')).toHaveAttribute(
      'data-scene-status',
      'ready',
      { timeout: 45000 },
    );
    await expect(page.locator('#ascii-taco-loader')).toBeVisible();
    expect(await time()).toBe(0);
    await page.keyboard.press('Escape');
    await expect.poll(time).toBeGreaterThan(0);
    await visibility(true);
    await page.waitForTimeout(150);
    const hiddenTime = await time();
    await page.waitForTimeout(200);
    expect(await time()).toBe(hiddenTime);
    await visibility(false);
    await expect.poll(time).toBeGreaterThan(hiddenTime);
    const canvas = page.locator('[data-scene-status] canvas');
    await expect(canvas).toHaveAttribute('data-scene-benchmark', /calls/, {
      timeout: 45000,
    });
    const benchmark = JSON.parse(
      (await canvas.getAttribute('data-scene-benchmark')) ?? '{}',
    );
    expect(benchmark.calls).toBeLessThanOrEqual(190);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(150);
    const still = await time();
    await page.waitForTimeout(200);
    expect(await time()).toBe(still);
    expect(errors).toEqual([]);
  } finally {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  }
});
