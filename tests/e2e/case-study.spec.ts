import { expect, test } from '@playwright/test';
import { orderedProjects, projectPath } from '../../src/content/portfolio';

test('all four case studies share the exhibition entrance and animated diagram traces', async ({
  page,
}, testInfo) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const project of orderedProjects) {
    await page.goto(projectPath(project));
    await expect(page.locator('[data-case-study]')).toHaveAttribute(
      'data-case-ready',
      'true',
    );
    const title = page.getByRole('heading', { level: 1 });
    await expect
      .poll(() =>
        title.evaluate((element) => Number(getComputedStyle(element).opacity)),
      )
      .toBeLessThan(0.99);
    const trace = page.locator('[data-trace] path').first();
    await expect
      .poll(() =>
        trace.evaluate((element) =>
          parseFloat(getComputedStyle(element).strokeDashoffset),
        ),
      )
      .toBeGreaterThan(0);
    await page.screenshot({
      path: testInfo.outputPath(`${project.slug}-entrance.png`),
    });
    await expect(title).toHaveCSS('opacity', '1');
    await expect(trace).toHaveCSS('stroke-dashoffset', '0px');
    await expect(page.locator('[data-work-visual]')).toHaveCSS('opacity', '1');
    await page.screenshot({
      path: testInfo.outputPath(`${project.slug}-settled.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
  expect(
    requests.filter((url) => /\.glb|ExperienceCanvas|\.mp4|\.mp3/.test(url)),
  ).toEqual([]);
});

test('case-study sections replay in both directions and motion changes restore static content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 450 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/knowledge-bridge');
  const root = page.locator('[data-case-study]');
  await expect(root).toHaveAttribute('data-case-ready', 'true');
  const visual = page.locator('[data-work-visual]');
  await expect(visual).not.toBeInViewport();
  await expect(visual).toHaveCSS('opacity', '1');
  await visual.evaluate((element) =>
    element.scrollIntoView({ block: 'center' }),
  );
  await expect
    .poll(() =>
      visual.evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeLessThan(0.99);
  await expect(visual).toHaveCSS('opacity', '1');
  const section = page.locator('.case-study-body section').first();
  const heading = section.locator('h2');
  for (let visit = 0; visit < 2; visit++) {
    await page.evaluate(() => scrollTo(0, 0));
    await expect(section).not.toBeInViewport();
    await section.evaluate((element) =>
      element.scrollIntoView({ block: 'center' }),
    );
    await expect
      .poll(() =>
        heading.evaluate((element) =>
          Number(getComputedStyle(element).opacity),
        ),
      )
      .toBeLessThan(0.99);
    await expect(heading).toHaveCSS('opacity', '1');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-case-motion', 'reduced');
  await expect(heading).toHaveCSS('transform', 'none');
  await expect(visual).toHaveCSS('transform', 'none');
  await expect(page.locator('[data-tag-corrected]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-tag-suggested]')).toHaveCSS('opacity', '0');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(root).toHaveAttribute('data-case-motion', 'full');
  await page.getByRole('link', { name: 'Back to Selected work' }).click();
  await page.goBack();
  await expect(root).toHaveAttribute('data-case-ready', 'true');
  await page.reload();
  await expect(root).toHaveAttribute('data-case-ready', 'true');
});

for (const width of [320, 390, 768, 1440]) {
  test(`case studies remain readable at ${width}px with reduced motion`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const project of orderedProjects) {
      await page.goto(projectPath(project));
      await expect(page.locator('[data-case-study]')).toHaveAttribute(
        'data-case-motion',
        'reduced',
      );
      await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
        'transform',
        'none',
      );
      await expect(page.locator('[data-work-visual]')).toHaveCSS(
        'opacity',
        '1',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`${project.slug}-${width}.png`),
        fullPage: true,
      });
    }
  });
}

test('blocking detail scripts leaves all case-study content readable and navigation usable', async ({
  page,
}) => {
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/work/knowledge-bridge');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(page.locator('[data-work-visual]')).toHaveCSS('opacity', '1');
  for (const paragraph of await page
    .locator('.case-study-body section p')
    .all())
    await expect(paragraph).toHaveCSS('opacity', '1');
  await page.locator('[rel="next"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Trading Agent',
  );
});
