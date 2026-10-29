import { expect, test } from '@playwright/test';
import { contactContent } from '../../src/content/contact';

test('Contact has truthful static content and working keyboard navigation without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto('/contact');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    contactContent.headline,
  );
  await expect(page.getByText(contactContent.description)).toBeVisible();
  await expect(page.getByText(contactContent.unavailable)).toBeVisible();
  await expect(page.locator('main a')).toHaveCount(0);
  await expect(
    page.locator(
      'a[href^="mailto:"], a[href*="linkedin.com"], a[href*="instagram.com"]',
    ),
  ).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toContainText(
    `© ${new Date().getFullYear()} Aldo Juárez · Mexico → Berlin`,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    contactContent.metadata,
  );
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText(
    'Contact',
  );
  const back = page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Back to stand' });
  await back.focus();
  await expect(back).toBeFocused();
  await expect(back).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/');
  await context.close();
});

test('Contact handles motion changes, themes and browser history without loading scene assets', async ({
  page,
}) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/about');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'opacity',
    '1',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'transform',
    'none',
  );
  await page.getByRole('button', { name: 'Synthwave', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  await page.goBack();
  await expect(page).toHaveURL('/about');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'synthwave');
  expect(
    requests.filter((url) =>
      /\.glb|ExperienceCanvas|\.mp4|\.mp3|fonts\.google/.test(url),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`Contact stays readable at ${width}px with reduced motion and enlarged text`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`contact-${width}.png`),
      fullPage: true,
    });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByText(contactContent.closing)).toBeVisible();
  });
}

test('Contact remains readable if enhancement scripts fail to load', async ({
  page,
}) => {
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/contact');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(page.getByText(contactContent.description)).toBeVisible();
  await expect(page.getByText(contactContent.unavailable)).toBeVisible();
});
