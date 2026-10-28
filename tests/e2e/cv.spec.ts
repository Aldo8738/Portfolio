import { expect, test } from '@playwright/test';
import { cv, experience } from '../../src/content/cv';

test('CV content, native disclosures and thesis navigation work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto('/cv');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'The road so far.',
  );
  await expect(page.getByText(cv.intro)).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'CV', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page.locator('[data-career-entry][data-kind="employment"]'),
  ).toHaveCount(3);
  await expect(
    page.locator('[data-career-entry][data-kind="education"]'),
  ).toHaveCount(1);
  for (const role of experience) {
    const entry = page.locator(`[data-career-entry="${role.id}"]`);
    await expect(entry.getByText(role.role, { exact: true })).toBeVisible();
    await expect(entry.locator('time').first()).toHaveAttribute(
      'datetime',
      role.start,
    );
    if (role.end !== null)
      await expect(entry.locator('time').last()).toHaveAttribute(
        'datetime',
        role.end,
      );
    else
      await expect(entry.getByText('Present', { exact: true })).toBeVisible();
  }
  const sap = page.locator('[data-career-entry="sap"]');
  await sap.locator('summary').click();
  await expect(sap.locator('details')).toHaveAttribute('open');
  await expect(sap.getByText(cv.experience[0]?.details[0] ?? '')).toBeVisible();
  await expect(page.getByRole('link', { name: /Download CV/ })).toHaveCount(0);
  await page.getByRole('link', { name: 'Explore Knowledge Bridge' }).click();
  await expect(page).toHaveURL(/\/work\/knowledge-bridge$/);
  await context.close();
});

test('keyboard skill emphasis, history and motion preferences remain coherent', async ({
  page,
}) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/work');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'CV', exact: true })
    .click();
  const root = page.locator('[data-cv-page]');
  await expect(root).toHaveAttribute('data-cv-ready', 'true');
  await page.locator('[data-career-entry="sap"] summary').focus();
  await expect(page.locator('[data-skill-id="angular"]')).toHaveAttribute(
    'data-related',
    'true',
  );
  await expect(page.locator('[data-skill-id="vue"]')).toHaveAttribute(
    'data-related',
    'false',
  );
  await page.keyboard.press('Enter');
  await expect(
    page.locator('[data-career-entry="sap"] details'),
  ).toHaveAttribute('open');
  await page.locator('[data-career-entry="koppla"] summary').focus();
  await expect(page.locator('[data-skill-id="vue"]')).toHaveAttribute(
    'data-related',
    'true',
  );
  await expect(page.locator('[data-skill-id="angular"]')).toHaveAttribute(
    'data-related',
    'false',
  );
  await expect(page.locator('[data-skill-id]')).toHaveCount(29);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-cv-motion', 'reduced');
  await page.reload();
  await expect(root).toHaveAttribute('data-cv-ready', 'true');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'About', exact: true })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await page.goBack();
  await expect(root).toHaveAttribute('data-cv-ready', 'true');
  await page.locator('[data-career-entry="axel-springer"] summary').focus();
  await expect(page.locator('[data-skill-id="mui"]')).toHaveAttribute(
    'data-related',
    'true',
  );
  expect(requests.some((url) => /\.glb|ExperienceCanvas/.test(url))).toBe(
    false,
  );
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`CV is readable without horizontal overflow at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/cv');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`cv-${width}.png`),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Noir', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Synthwave', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      'synthwave',
    );
  });
}

test('touch disclosure highlights related skills, and enlarged text stays in flow', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cv');
  await expect(page.locator('[data-cv-page]')).toHaveAttribute(
    'data-cv-ready',
    'true',
  );
  await page.locator('[data-career-entry="koppla"] summary').tap();
  await expect(page.locator('[data-skill-id="vue"]')).toHaveAttribute(
    'data-related',
    'true',
  );
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath('cv-enlarged-text.png'),
    fullPage: false,
  });
  const overflow = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body *')).flatMap((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > innerWidth + 1 && rect.width > 0
        ? [
            {
              tag: element.tagName,
              className: element.getAttribute('class'),
              right: Math.round(rect.right),
            },
          ]
        : [];
    }),
  );
  expect(overflow).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByText('Frontend Engineer · Working Student', { exact: true }),
  ).toBeVisible();
  await context.close();
});
