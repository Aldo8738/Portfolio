import { expect, test } from '@playwright/test';

test('Berlin scenery uses the camera orientation and restores with Reset view', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 640, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.addInitScript(() => {
    const skyPrograms = new WeakSet<WebGLProgram>();
    const views = new WeakMap<WebGLUniformLocation, WebGLProgram>();
    let latest: number[] = [];
    Object.defineProperty(window, '__berlinView', { get: () => latest });
    const prototype = WebGL2RenderingContext.prototype;
    prototype.getUniformLocation = new Proxy(prototype.getUniformLocation, {
      apply(target, receiver, args: [WebGLProgram, string]) {
        const location = Reflect.apply(target, receiver, args);
        if (location && args[1] === 'panorama') skyPrograms.add(args[0]);
        if (location && args[1] === 'viewMatrix') views.set(location, args[0]);
        return location;
      },
    });
    prototype.uniformMatrix4fv = new Proxy(prototype.uniformMatrix4fv, {
      apply(
        target,
        receiver,
        args: [WebGLUniformLocation | null, boolean, Float32List],
      ) {
        const program = args[0] ? views.get(args[0]) : undefined;
        if (program && skyPrograms.has(program)) latest = Array.from(args[2]);
        return Reflect.apply(target, receiver, args);
      },
    });
  });
  const view = () =>
    page.evaluate(() => Reflect.get(window, '__berlinView') as number[]);
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'ready',
    { timeout: 45000 },
  );
  await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
  await expect.poll(async () => (await view()).length).toBe(16);
  const initial = await view();
  const canvas = page.locator('[data-scene-status] canvas');
  for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowUp']) {
    await page.getByRole('button', { name: 'Reset view', exact: true }).click();
    await canvas.focus();
    await page.keyboard.press(key);
    await expect.poll(view).not.toEqual(initial);
  }
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expect.poll(view).toEqual(initial);
  expect(errors).toEqual([]);
});
