import { expect, test } from '@playwright/test';
import { orderedProjects, projectPath } from '../../src/content/portfolio';

test('project reveals replay when scrolling down and back up', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work');
  await expect(page.locator('[data-work-experience]')).toHaveAttribute(
    'data-work-ready',
    'true',
  );
  await expect(page.locator('.project-constellation')).toHaveCount(0);
  const section = page.locator('#project-trading-agent');
  const title = section.locator('[data-project-title]');
  for (const direction of ['down', 'up', 'down']) {
    await page
      .locator(direction === 'up' ? '#project-custom-cpu-os' : '#work-title')
      .evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await expect(section).not.toBeInViewport();
    await section.evaluate((element) =>
      element.scrollIntoView({ block: 'start' }),
    );
    await expect
      .poll(() =>
        title.evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeLessThan(0.99);
    await expect(title).toHaveCSS('opacity', '1');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#work-title').scrollIntoViewIfNeeded();
  await section.scrollIntoViewIfNeeded();
  await expect(title).toHaveCSS('opacity', '1');
});

test('the complete exhibition and four real detail routes work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/work');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Selected work.',
  );
  await expect(
    page.getByText('Different problems. Same curiosity.'),
  ).toBeVisible();
  await expect(page.locator('[data-project-section]')).toHaveCount(
    orderedProjects.length,
  );
  for (const project of orderedProjects) {
    await page.locator(`#project-${project.slug}`).scrollIntoViewIfNeeded();
    const section = page.locator(`#project-${project.slug}`);
    await expect(section.getByRole('heading', { level: 2 })).toBeInViewport();
    await section.getByRole('link', { name: 'View project' }).click();
    await expect(page).toHaveURL(new RegExp(`${projectPath(project)}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      project.title,
    );
    await expect(page.getByText(project.caseStudy.intro)).toBeVisible();
    await page.getByRole('link', { name: 'Back to Selected work' }).click();
    await page.goto('/work');
  }
  await context.close();
});

test('detail navigation, keyboard links, browser Back and live reduced-motion changes stay coherent', async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/work');
  const root = page.locator('[data-work-experience]');
  await expect(root).toHaveAttribute('data-work-ready', 'true');
  await expect(root.locator('.project-sequence')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-work-motion', 'reduced');
  await page
    .locator('#project-knowledge-bridge')
    .getByRole('link', { name: 'View project' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Knowledge Bridge',
  );
  const next = page
    .getByRole('navigation', { name: 'Project navigation', exact: true })
    .locator('[rel="next"]');
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Trading Agent',
  );
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Knowledge Bridge',
  );
  await page.getByRole('link', { name: 'Back to Selected work' }).click();
  await expect(root).toHaveAttribute('data-work-ready', 'true');
  expect(requests.some((url) => /\.glb|ExperienceCanvas/.test(url))).toBe(
    false,
  );
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`exhibition fits and remains readable at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/work');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator('[data-project-section]')).toHaveCount(
      orderedProjects.length,
    );
    await page.screenshot({
      path: testInfo.outputPath(`overview-${width}.png`),
      fullPage: false,
    });
    for (const project of orderedProjects) {
      await page.locator(`#title-${project.slug}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#title-${project.slug}`)).toBeInViewport();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`${project.slug}-${width}.png`),
      });
    }
  });
}
