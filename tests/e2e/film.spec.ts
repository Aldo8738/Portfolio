import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`film stays behind controls at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const textureRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/textures/film-grain-tile.png'))
        textureRequests.push(request.url());
    });
    await page.goto('/');
    const stage = page.locator('[data-scene-status]');
    await expect(stage).toHaveAttribute('data-scene-status', 'ready', {
      timeout: 45000,
    });
    await expect(page.locator('#ascii-taco-loader')).toHaveCount(0);
    const film = page.locator('[data-scene-film]');
    await expect(film).toBeHidden();
    expect(textureRequests).toHaveLength(0);
    await expect(film).toHaveAttribute('aria-hidden', 'true');
    await expect(film).toHaveCSS('pointer-events', 'none');
    expect(await film.locator('..').locator('canvas').count()).toBe(1);
    expect(await film.locator('button, a, canvas').count()).toBe(0);
    expect(
      await film.evaluate((element) =>
        ['::before', '::after'].map(
          (pseudo) => getComputedStyle(element, pseudo).pointerEvents,
        ),
      ),
    ).toEqual(['none', 'none']);

    for (const theme of ['original', 'noir', 'synthwave', 'noir']) {
      await page.getByText('Choose salsa', { exact: true }).click();
      await page.locator(`[data-theme-id="${theme}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.getByText('Choose salsa', { exact: true }).click();
      if (theme === 'noir') await expect(film).toBeVisible();
      else await expect(film).toBeHidden();
      const grainOpacity = viewport.width <= 640 ? '0.025' : '0.045';
      expect(
        await film.evaluate(
          (element) => getComputedStyle(element, '::before').opacity,
        ),
      ).toBe(grainOpacity);
      for (const enabled of [false, true]) {
        await stage.evaluate(
          (element, value) => {
            (element as HTMLElement).style.setProperty(
              '--film-treatment-opacity',
              value,
            );
          },
          enabled ? '1' : '0',
        );
        await expect(film).toHaveCSS('opacity', enabled ? '1' : '0');
        await page.screenshot({
          path: testInfo.outputPath(
            `${theme}-hero-${enabled ? 'on' : 'off'}.png`,
          ),
        });
      }
    }
    await page.getByText('Photos', { exact: true }).click();
    await page.getByRole('link', { name: 'Paris', exact: true }).click();
    await expect(stage).toHaveAttribute('data-photo-state', 'focused');
    expect(
      await film.evaluate(
        (element) => getComputedStyle(element, '::before').opacity,
      ),
    ).toBe('0.0125');
    expect(
      await film.evaluate(
        (element) => getComputedStyle(element, '::after').display,
      ),
    ).toBe('none');
    const back = page.getByRole('button', { name: 'Back to stand' });
    expect(
      await back.evaluate((element) => element.closest('[data-scene-film]')),
    ).toBeNull();
    await page.screenshot({ path: testInfo.outputPath('gallery-on.png') });
    await back.click();
    await expect(stage).not.toHaveAttribute('data-photo-id');
    const canvas = stage.locator('canvas');
    await canvas.focus();
    await page.keyboard.press('+');
    await page.screenshot({ path: testInfo.outputPath('close-up-on.png') });
    await page.keyboard.press('Home');
    expect(textureRequests).toHaveLength(1);
    for (const route of [
      '/work',
      '/cv',
      '/about',
      '/contact',
      '/work/knowledge-bridge',
    ]) {
      await page.goto(route);
      await expect(page.locator('[data-scene-film]')).toHaveCount(0);
    }
    expect(textureRequests).toHaveLength(1);
  });
}

test('failed WebGL never adds film over fallback content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGL2RenderingContext', {
      value: undefined,
    });
  });
  await page.goto('/');
  await expect(page.locator('[data-scene-status]')).toHaveAttribute(
    'data-scene-status',
    'failed',
  );
  await expect(page.locator('[data-scene-film]')).toHaveCount(0);
  await expect(page.getByText('The portfolio is still open.')).toBeVisible();
});
