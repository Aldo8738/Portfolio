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
  await expect(page.locator('main a')).toHaveCount(3);
  await expect(
    page.getByText('Public contact details will appear here once confirmed.'),
  ).toHaveCount(0);
  for (const method of contactContent.methods) {
    const link = page.locator(`[data-contact-method="${method.id}"]`);
    await expect(link).toHaveAttribute('href', method.href ?? '');
    await expect(link).toContainText(method.label);
    const symbol = page.locator(`[data-contact-symbol="${method.id}"]`);
    await expect(symbol).toHaveAttribute('href', method.href ?? '');
    await expect(symbol.locator('.contact-mark--light')).toHaveAttribute(
      'src',
      /^data:image\//,
    );
    expect(
      await symbol
        .locator('.contact-mark--light')
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    ).toBe(true);
    if (method.external) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    } else await expect(link).not.toHaveAttribute('target');
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-style', 'solid');
  }
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
    requests.filter(
      (url) =>
        url.includes('/images/contact/') ||
        /\.glb|ExperienceCanvas|\.mp4|\.mp3|fonts\.google/.test(url),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
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
    const overlappingMarks = await page
      .locator('.contact-mark--light')
      .evaluateAll((images) => {
        const rectangles = images.map((image) => image.getBoundingClientRect());
        return rectangles.some((rectangle, index) =>
          rectangles
            .slice(index + 1)
            .some(
              (other) =>
                rectangle.left < other.right &&
                rectangle.right > other.left &&
                rectangle.top < other.bottom &&
                rectangle.bottom > other.top,
            ),
        );
      });
    expect(overlappingMarks).toBe(false);
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
  await expect(page.locator('[data-contact-method]')).toHaveCount(3);
});

test('Contact icon links coordinate hover, keyboard focus and motion preferences', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/contact');
  const root = page.locator('[data-contact-page]');
  await expect(root).toHaveAttribute('data-contact-ready', 'true');
  await expect(root).toHaveAttribute('data-contact-motion', 'full');
  const symbols = page.locator('[data-contact-symbol]');
  await expect(symbols).toHaveCount(3);
  await expect(symbols.first()).toHaveCSS('transform', 'none');
  await expect(page.locator('[data-contact-channel]')).toHaveCount(0);
  for (const method of contactContent.methods) {
    const row = page.locator(`[data-contact-method="${method.id}"]`);
    const symbol = page.locator(`[data-contact-symbol="${method.id}"]`);
    await row.hover();
    await expect(root).toHaveAttribute('data-active-contact', method.id);
    await expect
      .poll(() =>
        symbol.evaluate(
          (element) => getComputedStyle(element, '::after').opacity,
        ),
      )
      .toBe('1');
    await expect(symbol.locator('.contact-mark--light')).toHaveCSS(
      'transform',
      'none',
    );
    await expect(symbol.locator('.contact-mark--light')).toHaveCSS(
      'filter',
      'none',
    );
    await page.keyboard.press('Tab');
    await row.focus();
    await expect(row).toHaveCSS('outline-style', 'solid');
    await page.mouse.move(0, 0);
    await expect(root).toHaveAttribute('data-active-contact', method.id);
    await expect(symbol).not.toHaveAttribute('tabindex');
  }
  await page.screenshot({
    path: testInfo.outputPath('contact-instagram-focus.png'),
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-contact-motion', 'reduced');
  for (const symbol of await symbols.all())
    await expect(symbol).toHaveCSS('transform', 'none');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'transform',
    'none',
  );
  await page.locator('.site-header .brand').focus();
  await expect(root).not.toHaveAttribute('data-active-contact');
  for (const symbol of await symbols.all())
    await expect
      .poll(() =>
        symbol.evaluate(
          (element) => getComputedStyle(element, '::after').opacity,
        ),
      )
      .toBe('0');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'transform',
    'none',
  );
  expect(errors).toEqual([]);
});

test('social icon links open the approved destinations in safe new tabs', async ({
  page,
  context,
}) => {
  await context.route(/https:\/\/www\.(linkedin|instagram)\.com\//, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Intercepted destination</title>',
    }),
  );
  await page.goto('/contact');
  for (const method of contactContent.methods.filter(
    (entry) => entry.external,
  )) {
    if (!method.href) throw new Error('Approved destination missing');
    const opened = page.waitForEvent('popup');
    await page.locator(`[data-contact-method="${method.id}"]`).click();
    const popup = await opened;
    await expect(popup).toHaveURL(new URL(method.href).href);
    await popup.close();
  }
});

test('all contact themes preserve link readability and official icon contrast', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact');
  for (const theme of ['Noir', 'Synthwave', 'Original']) {
    await page.getByRole('button', { name: theme, exact: true }).click();
    const email = page.locator('[data-contact-method="email"]');
    await page.keyboard.press('Tab');
    await email.focus();
    await expect(email).toHaveCSS('outline-style', 'solid');
    const symbol = page.locator('[data-contact-symbol="email"]');
    await expect
      .poll(() =>
        symbol.evaluate(
          (element) => getComputedStyle(element, '::after').opacity,
        ),
      )
      .toBe('1');
    await expect(
      symbol.locator(
        theme === 'Synthwave' ? '.contact-mark--dark' : '.contact-mark--light',
      ),
    ).toBeVisible();
    await page.mouse.move(0, 0);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: testInfo.outputPath(`contact-${theme.toLowerCase()}.png`),
      fullPage: true,
    });
  }
});

test('Contact is one compact composition with aligned icon links and no horizontal rows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/contact');
  await expect(
    page.locator('.contact-link-row, .contact-methods, [data-contact-row]'),
  ).toHaveCount(0);
  await expect(page.locator('main a')).toHaveCount(3);
  const heading = await page.locator('h1').boundingBox();
  const description = await page.locator('.contact-description').boundingBox();
  if (!heading || !description) throw new Error('Contact introduction missing');
  expect(description.x).toBeCloseTo(heading.x, 0);
  expect(description.y).toBeGreaterThan(heading.y + heading.height);
  const labels = await page
    .locator('.contact-label')
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().top),
    );
  expect(Math.max(...labels) - Math.min(...labels)).toBeLessThan(1);
  const marks = await page
    .locator('.contact-mark--light')
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );
  expect(Math.min(...marks)).toBeGreaterThan(90);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThan(1100);
});
