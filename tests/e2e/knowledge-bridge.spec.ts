import { expect, test } from '@playwright/test';
import {
  knowledgeBridge,
  knowledgeBridgeBeats,
} from '../../src/content/knowledge-bridge';

test.use({ hasTouch: true });

test('hero counts smoothly to the measured value once and respects reduced motion', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/work/knowledge-bridge');
    const metric = page.locator('[data-hero-value]');
    await expect(page.locator('[data-knowledge-bridge]')).toHaveAttribute(
      'data-case-ready',
      'true',
    );
    await expect
      .poll(async () => Number(await metric.textContent()))
      .toBeGreaterThan(0);
    const initial = Number(await metric.textContent());
    expect(initial).toBeLessThan(81.5);
    await page.waitForTimeout(250);
    const later = Number(await metric.textContent());
    expect(later).toBeGreaterThan(initial);
    expect(later).toBeLessThan(81.5);
    await page.screenshot({
      path: testInfo.outputPath(`hero-count-${width}.png`),
    });
    await expect(metric).toHaveText('81.5');
    await page.setViewportSize({
      width: width === 1440 ? 1200 : 360,
      height: 844,
    });
    await expect(metric).toHaveText('81.5');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/knowledge-bridge');
  await expect(page.locator('[data-knowledge-bridge]')).toHaveAttribute(
    'data-case-ready',
    'true',
  );
  await expect(page.locator('[data-hero-value]')).toHaveText('81.5');
});

async function noOverflow(page: import('@playwright/test').Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function storyProgress(
  page: import('@playwright/test').Page,
  progress: number,
  pinned: boolean,
  screens = 2.1,
) {
  const dimensions = await page.locator('[data-story-copy]').evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY,
    height: el.getBoundingClientRect().height,
  }));
  let start: number, distance: number;
  if (pinned) {
    start = await page
      .locator('.pin-spacer')
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
    distance = await page.evaluate((screens) => innerHeight * screens, screens);
  } else {
    const anchor = await page
      .locator('.kb-story-figure')
      .evaluate(
        (el) =>
          (el as HTMLElement).offsetHeight +
          Math.min(
            200,
            (innerHeight - (el as HTMLElement).offsetHeight) * 0.72,
          ),
      );
    start = dimensions.top - anchor;
    distance = dimensions.height;
  }
  await page.evaluate((y) => scrollTo(0, y), start + distance * progress);
  await page.waitForTimeout(450);
  await expect(page.locator('[data-knowledge-bridge]')).toHaveAttribute(
    'data-story-beat',
    String(progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.8 ? 2 : 3),
  );
}

test('one organic network moves from hero to the pinned figure and rewinds its causal graph story', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [],
    warnings: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type()))
      warnings.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ]) {
    if (!width || !height) throw new Error('Viewport missing');
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-story-mode', 'pinned');
    await page.evaluate(() => document.fonts.ready);
    await expect(root.locator('.kb-graph')).toHaveCount(1);
    await expect(root.locator('[data-hero-dock] .kb-graph')).toHaveCount(1);
    await expect(root.locator('[data-peripheral-point]')).toHaveCount(64);
    const original = await root.locator('.kb-graph').elementHandle();
    if (!original) throw new Error('Network missing');
    const art = await root.locator('[data-hero-dock]').boundingBox(),
      metric = await root.locator('.kb-hero-metric').boundingBox();
    if (!art || !metric) throw new Error('Hero composition missing');
    expect(metric.y).toBeGreaterThanOrEqual(art.y + art.height);
    await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
    await page.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    for (const [progress, stage] of [
      [0.23, 1],
      [0.42, 2],
      [0.79, 3],
      [0.98, 4],
    ] as const) {
      await storyProgress(page, progress, true);
      await expect(root.locator('[data-story-dock] .kb-graph')).toHaveCount(1);
      expect(
        await root
          .locator('.kb-graph')
          .evaluate((element, prior) => element === prior, original),
      ).toBe(true);
      await expect(root.locator('li[data-active="true"]')).toHaveCount(1);
      for (const item of await root.locator('li[data-active="false"]').all())
        await expect(item).toHaveCSS('opacity', '0');
      await noOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath(`desktop-${width}-beat-${stage}.png`),
      });
    }
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '1',
    );
    await expect(root.locator('[data-incorrect-edge]')).toHaveCSS(
      'opacity',
      '0',
    );
    await expect(root.locator('[data-graph-metric]')).toContainText('1.57s');
    await storyProgress(page, 0.36, true);
    const focus = await root
      .locator('[data-graph-layer="viewport"]')
      .getAttribute('transform');
    const priority = await root
      .locator('[data-priority-packet]')
      .getAttribute('cx');
    await storyProgress(page, 0.42, true);
    expect(
      await root
        .locator('[data-graph-layer="viewport"]')
        .getAttribute('transform'),
    ).not.toBe(focus);
    expect(
      await root.locator('[data-priority-packet]').getAttribute('cx'),
    ).not.toBe(priority);
    await storyProgress(page, 0.57, true);
    const outgoing = await root
      .locator('[data-feedback-packet]')
      .getAttribute('cx');
    await storyProgress(page, 0.6, true);
    expect(
      await root.locator('[data-feedback-packet]').getAttribute('cx'),
    ).not.toBe(outgoing);
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '0',
    );
    await storyProgress(page, 0.68, true);
    const incoming = await root
      .locator('[data-delivery-packet]')
      .getAttribute('cx');
    await storyProgress(page, 0.71, true);
    expect(
      await root.locator('[data-delivery-packet]').getAttribute('cx'),
    ).not.toBe(incoming);
    await expect(root.locator('[data-incorrect-edge]')).toHaveCSS(
      'opacity',
      '1',
    );
    await expect(root.locator('[data-return-label]')).toContainText(
      'GRAPH UPDATE',
    );
    await expect(root.locator('[data-edit-label]')).toContainText(
      'USER EDIT / API',
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(750);
    await expect(root.locator('[data-hero-dock] .kb-graph')).toHaveCount(1);
    await expect(root.locator('.kb-graph')).toHaveCount(1);
    await storyProgress(page, 0.6, true);
    await page.reload();
    await expect(root).toHaveAttribute('data-story-mode', 'pinned');
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    await storyProgress(page, 0.79, true);
  }
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test('desktop graph fills the right column without requiring a pin', async ({
  page,
}, testInfo) => {
  for (const reduced of [true, false]) {
    await page.setViewportSize({ width: 1920, height: reduced ? 900 : 600 });
    await page.emulateMedia({
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute(
      'data-story-mode',
      reduced ? 'static' : 'scroll',
    );
    await expect(root.locator('[data-network-host]')).toHaveAttribute(
      'data-layout',
      'desktop',
    );
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    const shooter = await root
      .locator('[data-node-id="shooter"]')
      .boundingBox();
    const rpg = await root.locator('[data-node-id="rpg"]').boundingBox();
    if (!shooter || !rpg) throw new Error('Desktop graph missing');
    expect(rpg.x - shooter.x).toBeGreaterThan(reduced ? 450 : 350);
    await root.locator('.kb-story-figure').scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(
        `desktop-unpinned-${reduced ? 'reduced' : 'short'}.png`,
      ),
    });
  }
});

test('tablet and short landscape preserve a single responsive canvas without unsafe pins', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height, mode] of [
    [768, 1024, 'pinned'],
    [768, 700, 'scroll'],
    [844, 390, 'scroll'],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-story-mode', mode);
    await storyProgress(page, 0.79, mode === 'pinned', 1.8);
    await expect(root.locator('.kb-graph')).toHaveCount(1);
    await noOverflow(page);
    const caption = await root.locator('.kb-story-figure').boundingBox();
    if (!caption) throw new Error('Caption missing');
    if (mode === 'pinned') {
      expect(caption.y).toBeGreaterThanOrEqual(0);
      expect(caption.y + caption.height).toBeLessThanOrEqual(height);
    } else await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`responsive-${width}-${height}.png`),
    });
  }
});

test('phone stages reuse one evolving SVG with readable labels and ordinary touch scrolling', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [width, height] of [
    [320, 568],
    [375, 812],
    [390, 844],
    [430, 932],
  ]) {
    if (!width || !height) throw new Error('Viewport missing');
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-story-mode', 'scroll');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(root.locator('.kb-graph')).toHaveCount(1);
    await expect(root.locator('[data-mobile-figure]')).toHaveCount(0);
    await expect(root.locator('[data-network-host]')).toHaveAttribute(
      'data-layout',
      'mobile',
    );
    await root.locator('[data-hero-value]').scrollIntoViewIfNeeded();
    await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
    await page.evaluate(() => scrollTo(0, 0));
    if (width === 390)
      await page.screenshot({ path: testInfo.outputPath('mobile-hero.png') });
    const storyHeight = await root
      .locator('[data-kb-story]')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(storyHeight).toBeLessThan(height * 2.5);
    for (const [progress, stage] of [
      [0.2, 1],
      [0.4, 2],
      [0.79, 3],
      [0.98, 4],
    ] as const) {
      await storyProgress(page, progress, false);
      await expect(root.locator('.kb-graph')).toHaveCount(1);
      const figure = await root.locator('.kb-story-figure').boundingBox();
      if (!figure) throw new Error('Figure missing');
      expect(figure.x).toBeGreaterThanOrEqual(0);
      expect(figure.x + figure.width).toBeLessThanOrEqual(width);
      const heading = await root
        .locator(`li[data-story-beat="${stage - 1}"] h2`)
        .boundingBox();
      if (!heading) throw new Error('Active heading missing');
      expect(heading.y).toBeGreaterThanOrEqual(figure.y + figure.height - 1);
      for (const text of await root.locator('.kb-graph text:visible').all()) {
        const size = await text.evaluate(
          (el) =>
            parseFloat(getComputedStyle(el).fontSize) *
            ((el as SVGGraphicsElement).getScreenCTM()?.a ?? 0),
        );
        expect(size).toBeGreaterThanOrEqual(12);
      }
      await noOverflow(page);
      if (width === 390 || width === 320)
        await page.screenshot({
          path: testInfo.outputPath(`mobile-${width}-beat-${stage}.png`),
        });
    }
    await storyProgress(page, 0.6, false);
    await expect(root.locator('[data-node-id="skyrim"]')).toHaveAttribute(
      'transform',
      'translate(200 45)',
    );
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '0',
    );
    await expect(root.locator('[data-edit-label]')).toContainText('USER EDIT');
    await expect(root.locator('[data-return-label]')).toContainText(
      'WEBSOCKET',
    );
    await storyProgress(page, 0.79, false);
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '1',
    );
    await storyProgress(page, 0.4, false);
    await expect(root.locator('[data-node-id="skyrim"]')).toHaveAttribute(
      'transform',
      'translate(275 245)',
    );
    await expect(root.locator('[data-incorrect-edge]')).toHaveCSS(
      'opacity',
      '1',
    );
    if (width === 390) {
      await root
        .locator('.kb-results')
        .evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await expect(root.locator('.kb-result-primary dd')).toContainText(
        '1.57s',
      );
      await expect(root.locator('.kb-result-secondary dd')).toContainText(
        '72.4%',
      );
      await page.screenshot({
        path: testInfo.outputPath('mobile-results.png'),
      });
    }
  }
  expect(errors).toEqual([]);
});

test('history slider directly morphs an edge and endpoint with mouse, touch and keyboard', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto('/work/knowledge-bridge');
    const card = page.locator('[data-checkpoint]'),
      range = card.locator('[data-history-range]');
    await range.scrollIntoViewIfNeeded();
    const box = await range.boundingBox();
    if (!box) throw new Error('Range missing');
    expect(box.height).toBeGreaterThanOrEqual(44);
    const y = box.y + box.height / 2,
      end = box.x + box.width - 8,
      middle = box.x + box.width * 0.4;
    const statusBefore = await card.getByRole('status').textContent();
    if (width === 1440) {
      await page.mouse.move(end, y);
      await page.mouse.down();
      await page.mouse.move(middle, y, { steps: 8 });
    } else {
      const session = await page.context().newCDPSession(page);
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: end, y }],
      });
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: middle, y }],
      });
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
      await session.detach();
    }
    const progress = Number(await range.inputValue());
    expect(progress).toBeGreaterThan(10);
    expect(progress).toBeLessThan(90);
    const cy = Number(
      await card.locator('[data-history-endpoint]').getAttribute('cy'),
    );
    expect(cy).toBeGreaterThan(95);
    expect(cy).toBeLessThan(245);
    await expect(card).toHaveAttribute('data-checkpoint-version', 'transition');
    await expect(range).toHaveAttribute('aria-valuetext', /not a saved state/);
    await expect(card.locator('[data-checkpoint-change]')).toContainText(
      'illustrative interpolation',
    );
    if (width === 1440) {
      await expect(card.getByRole('status')).toHaveText(
        statusBefore ?? 'Human correction',
      );
      await page.mouse.up();
    }
    await card.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.screenshot({
      path: testInfo.outputPath(`history-${width}-middle.png`),
    });
    await range.focus();
    await page.keyboard.press('Home');
    await expect(range).toHaveValue('0');
    await expect(card).toHaveAttribute('data-checkpoint-version', '0');
    await expect(card.locator('[data-history-endpoint]')).toHaveAttribute(
      'cy',
      '245',
    );
    const originalPath = await card
      .locator('[data-history-edge]')
      .getAttribute('d');
    await page.keyboard.press('ArrowRight');
    await expect(range).toHaveValue('1');
    expect(
      await card.locator('[data-history-edge]').getAttribute('d'),
    ).not.toBe(originalPath);
    await page.keyboard.press('End');
    await expect(range).toHaveValue('100');
    await expect(card.locator('[data-history-endpoint]')).toHaveAttribute(
      'cy',
      '95',
    );
    for (const version of [0, 1, 0, 1] as const) {
      await card.locator(`[data-checkpoint-select="${version}"]`).tap();
      await expect(card).toHaveAttribute(
        'data-checkpoint-version',
        String(version),
      );
      await expect(range).toHaveValue(String(version * 100));
      await expect(card.getByRole('status')).toHaveText(
        knowledgeBridge.checkpoint.versions[version],
      );
      if (width !== 320) {
        await page
          .locator('.kb-checkpoints')
          .evaluate((el) => el.scrollIntoView({ block: 'start' }));
        await page.screenshot({
          path: testInfo.outputPath(`history-${width}-${version}.png`),
        });
      }
    }
    await card.getByRole('button', { name: 'Restore original' }).click();
    await expect(range).toHaveValue('0');
    await expect(card.locator('[data-history-endpoint]')).toHaveAttribute(
      'cy',
      '245',
    );
    for (const button of await card.locator('button').all()) {
      const bounds = await button.boundingBox();
      if (!bounds) throw new Error('Button missing');
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await noOverflow(page);
  }
});

test('reduced motion, themes, resize, focused skip link and revisits restore a complete single graph', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/work/knowledge-bridge');
  const root = page.locator('[data-knowledge-bridge]');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).not.toBeInViewport();
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Tab');
  await expect(skip).not.toBeInViewport();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(root).toHaveAttribute('data-story-mode', 'static');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(root.locator('.kb-graph')).toHaveCount(1);
  await expect(root.locator('[data-story-dock] .kb-graph')).toHaveCount(1);
  await expect(root.locator('[data-corrected-edge]')).toHaveCSS('opacity', '1');
  await expect(root.locator('[data-incorrect-edge]')).toHaveCSS('opacity', '0');
  for (const text of await root
    .locator('li[data-story-beat] h2, li[data-story-beat] p')
    .all())
    await expect(text).toHaveCSS('opacity', '1');
  const slider = root.locator('[data-history-range]');
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(root.locator('[data-history-endpoint]')).toHaveAttribute(
    'cy',
    '245',
  );
  await page.keyboard.press('End');
  await expect(root.locator('[data-history-endpoint]')).toHaveAttribute(
    'cy',
    '95',
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute('data-story-mode', 'scroll');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  for (const theme of ['noir', 'synthwave', 'original']) {
    await page.locator(`[data-theme-id="${theme}"]`).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await storyProgress(page, 0.79, false);
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '1',
    );
    await noOverflow(page);
  }
  await root.locator('[data-checkpoint-restore]').click();
  await expect(root.locator('[data-history-range]')).toHaveValue('0');
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide')),
  );
  await expect(root).not.toHaveAttribute('data-case-ready');
  await expect(root.locator('[data-checkpoint-controls]')).toBeHidden();
  await expect(root.locator('.kb-graph')).toHaveCount(1);
  await page.evaluate(() =>
    window.dispatchEvent(
      new PageTransitionEvent('pageshow', { persisted: true }),
    ),
  );
  await expect(root).toHaveAttribute('data-case-ready', 'true');
  await expect(slider).toHaveValue('100');
  await page.locator('[rel="next"]').click();
  await expect(page).toHaveURL(/\/work\/trading-agent$/);
  await page.goBack();
  await expect(root).toHaveAttribute('data-case-ready', 'true');
});

test('without JavaScript the one graph, final comparison and saved relation remain meaningful HTML', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/work/knowledge-bridge');
  const root = page.locator('[data-knowledge-bridge]');
  await expect(root.locator('.kb-graph')).toHaveCount(1);
  await expect(root.locator('.kb-graph')).toBeVisible();
  await expect(root.locator('[data-kb-section]')).toHaveCount(4);
  for (const beat of knowledgeBridgeBeats)
    await expect(
      root.getByRole('heading', { name: beat.title, exact: true }),
    ).toBeVisible();
  await expect(root.locator('[data-checkpoint-controls]')).toBeHidden();
  await expect(root.locator('[data-history-endpoint]')).toHaveAttribute(
    'cy',
    '95',
  );
  await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
  await expect(root.locator('.kb-results')).toContainText('72.4%');
  await expect(root.locator('.kb-result-primary dd')).toContainText('8.47s');
  await expect(root.locator('.kb-result-primary dd')).toContainText('1.57s');
  await expect(root.getByRole('link', { name: 'Read thesis' })).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath('no-js-mobile.png'),
    fullPage: true,
  });
  await root.getByRole('link', { name: 'All selected work' }).click();
  await expect(page).toHaveURL(/\/work$/);
  await context.close();
});
