import { expect, test } from '@playwright/test';
import { aboutContent } from '../../src/content/about';

const paragraphs = [
  ...aboutContent.introduction,
  ...aboutContent.setup,
  aboutContent.payoff,
];

test('About serves the approved copy, metadata and keyboard navigation without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto('/about');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    aboutContent.title,
  );
  await expect(page.locator('.about-prose p')).toHaveText(paragraphs);
  await expect(page).toHaveTitle('About · Taquería Aldo');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    aboutContent.metadata,
  );
  await expect(
    page.locator('.site-header nav a[aria-current="page"]'),
  ).toHaveText('About');
  const contact = page
    .getByRole('navigation', { name: 'Continue exploring' })
    .getByRole('link');
  await contact.focus();
  await expect(contact).toBeFocused();
  await expect(contact).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/contact');
  await context.close();
});

test('About reveals once, reverts on motion changes and survives history and repeated visits', async ({
  page,
}) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/work');
  await page
    .locator('.site-header nav')
    .getByRole('link', { name: 'About' })
    .click();
  const payoff = page.locator('[data-about-payoff]');
  await payoff.scrollIntoViewIfNeeded();
  await expect(payoff).toHaveCSS('opacity', '1');
  await expect(payoff).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.evaluate(() => scrollTo(0, 0));
  await payoff.scrollIntoViewIfNeeded();
  await expect(payoff).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(payoff).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(payoff).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: 'Noir', exact: true }).click();
  await page
    .locator('.site-header nav')
    .getByRole('link', { name: 'CV', exact: true })
    .click();
  await page
    .locator('.site-header nav')
    .getByRole('link', { name: 'About' })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'noir');
  await page.goBack();
  await expect(page).toHaveURL('/cv');
  await page.goForward();
  await payoff.scrollIntoViewIfNeeded();
  await expect(payoff).toHaveCSS('opacity', '1');
  await page.reload();
  await payoff.scrollIntoViewIfNeeded();
  await expect(payoff).toHaveCSS('opacity', '1');
  expect(
    requests.filter((url) =>
      /\.glb|ExperienceCanvas|\.mp4|\.mp3|fonts\.google/.test(url),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`About stays readable at ${width}px with reduced motion and enlarged text`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about');
    await expect(page.locator('.about-prose p')).toHaveText(paragraphs);
    await expect(page.locator('[data-about-payoff]')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-about-payoff]')).toHaveCSS(
      'transform',
      'none',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`about-${width}.png`),
      fullPage: true,
    });
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.getByText(aboutContent.payoff)).toBeVisible();
  });
}

test('About fails visible when enhancement scripts are blocked', async ({
  page,
}) => {
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/about');
  await expect(page.locator('.about-prose p')).toHaveText(paragraphs);
  await expect(page.locator('[data-about-payoff]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-about-payoff]')).toHaveCSS(
    'transform',
    'none',
  );
});
