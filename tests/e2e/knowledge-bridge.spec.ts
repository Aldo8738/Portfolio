import { expect, test } from '@playwright/test';
import {
  knowledgeBridge,
  knowledgeBridgeBeats,
} from '../../src/content/knowledge-bridge';
import { knowledgeStoryMotion } from '../../src/components/work/knowledge-bridge/graph-motion';
import { getStoryBeat } from '../../src/components/work/knowledge-bridge/story-state';

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

async function graphMatchesDock(page: import('@playwright/test').Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const host = document
          .querySelector('[data-network-host]')
          ?.getBoundingClientRect();
        const dock = document
          .querySelector(
            document
              .querySelector('[data-knowledge-bridge]')
              ?.getAttribute('data-story-mode') === 'pinned' &&
              document
                .querySelector('[data-knowledge-bridge]')
                ?.getAttribute('data-story-beat') === '0'
              ? '[data-chapter-one-dock]'
              : '[data-story-dock]',
          )
          ?.getBoundingClientRect();
        if (!host || !dock) throw new Error('Graph placement missing');
        return Math.max(
          Math.abs(host.x - dock.x),
          Math.abs(host.y - dock.y),
          Math.abs(host.width - dock.width),
          Math.abs(host.height - dock.height),
        );
      }),
    )
    .toBeLessThan(1);
}
async function storyProgress(
  page: import('@playwright/test').Page,
  progress: number,
  pinned: boolean,
  screens: number = knowledgeStoryMotion.scrollScreens,
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
        (el, motion) =>
          document.querySelector<HTMLElement>('[data-network-host]')?.dataset
            .layout === 'desktop'
            ? innerHeight * motion.readingFraction
            : (el as HTMLElement).offsetHeight +
              Math.min(
                motion.readingGap,
                (innerHeight - (el as HTMLElement).offsetHeight) *
                  motion.readingFraction,
              ),
        knowledgeStoryMotion,
      );
    start = dimensions.top - anchor;
    distance = dimensions.height;
  }
  const mapped = pinned
    ? progress < 0.25
      ? 0.625 * (0.56 + progress * 1.4)
      : 0.625 + (progress - 0.25) * 0.5
    : (progress - 0.25) / 0.75;
  const y =
    !pinned && progress < 0.25
      ? Math.min(
          start - 2,
          await page
            .locator('[data-story-stage]')
            .evaluate(
              (el) =>
                el.getBoundingClientRect().top + scrollY + innerHeight * 0.3,
            ),
        )
      : start + distance * mapped;
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(650);
  await expect(page.locator('[data-knowledge-bridge]')).toHaveAttribute(
    'data-story-beat',
    String(getStoryBeat(progress)),
  );
}

async function storyAction(
  page: import('@playwright/test').Page,
  progress: number,
  pinned: boolean,
) {
  await storyProgress(page, progress, pinned);
}

test('restrained reveal and one-channel response stay settled and rewind in order', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-case-ready', 'true');
    await page.evaluate(() => document.fonts.ready);
    let settled: string[] | undefined;
    const phases = [
      0.23, 0.34, 0.39, 0.56, 0.58, 0.63, 0.675, 0.71, 0.79, 0.89,
    ];
    for (const [direction, progressList] of [
      ['forward', phases],
      ['reverse', phases.toReversed()],
    ] as const) {
      for (const progress of progressList) {
        await storyAction(page, progress, width === 1440);
        const state = await root.evaluate((element) => {
          const opacity = (selector: string) => {
            const target = element.querySelector(selector);
            if (!target) throw new Error('Story element missing: ' + selector);
            let value = 1;
            for (
              let node: Element | null = target;
              node && node !== element;
              node = node.parentElement
            )
              value *= Number(getComputedStyle(node).opacity);
            return value;
          };
          return {
            groups: [0, 1, 2].map((group) => {
              const target = element.querySelector(
                'g[data-reveal-group="' + group + '"]',
              );
              if (!target) throw new Error('Reveal group missing');
              return Number(getComputedStyle(target).opacity);
            }),
            geometry: [
              ...element.querySelectorAll(
                '[data-node-id], [data-network-edge]',
              ),
            ].map(
              (node) =>
                node.getAttribute('transform') ?? node.getAttribute('d') ?? '',
            ),
            edit: opacity('[data-edit-path]'),
            response: opacity('[data-return-path]'),
            corrected: opacity('[data-corrected-edge]'),
            incorrect: opacity('[data-incorrect-edge]'),
            editPacket: opacity('[data-feedback-packet]'),
            responsePacket: opacity('[data-delivery-packet]'),
          };
        });
        if (progress >= 0.23) {
          if (progress === 0.23) expect(state.groups).toEqual([1, 1, 1]);
          settled ??= state.geometry;
          expect(state.geometry).toEqual(settled);
        }
        expect(state.edit * state.response).toBe(0);
        expect(state.editPacket * state.responsePacket).toBe(0);
        if (progress === 0.56) {
          expect(state.incorrect).toBe(1);
          expect(state.edit + state.response + state.corrected).toBe(0);
        }
        if (progress === 0.63 || progress === 0.71) {
          expect(progress === 0.63 ? state.edit : state.response).toBe(1);
          expect(
            progress === 0.63 ? state.editPacket : state.responsePacket,
          ).toBe(1);
          expect(
            state.corrected + state.incorrect,
            JSON.stringify({
              width,
              progress,
              direction,
              corrected: state.corrected,
              incorrect: state.incorrect,
            }),
          ).toBe(0);
        }
        if (progress === 0.675)
          expect(
            state.edit + state.response,
            JSON.stringify({ width, progress, direction, state }),
          ).toBe(0);
        if (progress >= 0.79) {
          expect(state.corrected).toBe(1);
          expect(state.edit + state.response + state.incorrect).toBe(0);
        }
        await noOverflow(page);
        if (
          direction === 'forward' &&
          [0.23, 0.56, 0.63, 0.71, 0.89].includes(progress)
        )
          await page.screenshot({
            path: testInfo.outputPath(
              'restrained-' + width + '-' + progress + '.png',
            ),
          });
      }
    }
  }
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
    await root.locator('.kb-story-figure').scrollIntoViewIfNeeded();
    await expect
      .poll(async () => {
        const france = await root
          .locator('[data-node-id="france"]')
          .boundingBox();
        const germany = await root
          .locator('[data-node-id="germany"]')
          .boundingBox();
        if (!france || !germany) throw new Error('Desktop graph missing');
        return germany.x - france.x;
      })
      .toBeGreaterThan(reduced ? 350 : 250);
    await root.locator('.kb-story-figure').scrollIntoViewIfNeeded();
    await page.waitForTimeout(650);
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
    [1024, 1366, 'pinned'],
    [1024, 768, 'scroll'],
    [768, 700, 'scroll'],
    [844, 390, 'scroll'],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-story-mode', mode);
    await storyProgress(
      page,
      0.79,
      mode === 'pinned',
      knowledgeStoryMotion.tabletScrollScreens,
    );
    await expect(root.locator('.kb-graph')).toHaveCount(1);
    await noOverflow(page);
    await graphMatchesDock(page);
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
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [375, 667],
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
    await root
      .locator('.kb-facts')
      .evaluate((el) =>
        scrollTo(
          0,
          Math.max(
            0,
            el.getBoundingClientRect().bottom + scrollY - innerHeight,
          ),
        ),
      );
    await expect(root.locator('.kb-facts')).toHaveCSS('opacity', '1');
    const storyHeight = await root
      .locator('[data-kb-story]')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(storyHeight).toBeLessThan(height * 6);
    for (const [progress, stage] of [
      [0.08, 1],
      [0.33, 2],
      [0.58, 3],
      [0.83, 4],
    ] as const) {
      await storyProgress(page, progress, false);
      if (Number(await root.getAttribute('data-graph-entry')) >= 0.999)
        await graphMatchesDock(page);
      await expect(root.locator('.kb-graph')).toHaveCount(1);
      const figure = await root.locator('.kb-story-figure').boundingBox();
      if (!figure) throw new Error('Figure missing');
      expect(figure.x).toBeGreaterThanOrEqual(0);
      expect(figure.x + figure.width).toBeLessThanOrEqual(width);
      const heading = await root
        .locator(`li[data-story-beat="${stage - 1}"] h2`)
        .boundingBox();
      if (!heading) throw new Error('Active heading missing');
      if (stage === 1) expect(heading.y).toBeLessThan(figure.y);
      else
        expect(heading.y).toBeGreaterThanOrEqual(figure.y + figure.height - 1);
      const labels = await root
        .locator('.kb-graph text:visible')
        .evaluateAll((elements) =>
          elements.flatMap((el) => {
            let opacity = 1;
            for (let node: Element | null = el; node; node = node.parentElement)
              opacity *= Number(getComputedStyle(node).opacity);
            if (opacity < 0.5) return [];
            return [
              {
                label: el.textContent,
                size:
                  parseFloat(getComputedStyle(el).fontSize) *
                  ((el as SVGGraphicsElement).getScreenCTM()?.a ?? 0),
              },
            ];
          }),
        );
      for (const { label, size } of labels)
        expect(size, label ?? 'Graph label').toBeGreaterThanOrEqual(12);
      await noOverflow(page);
      if (width === 390 || width === 320)
        await page.screenshot({
          path: testInfo.outputPath(`mobile-${width}-beat-${stage}.png`),
        });
    }
    await storyAction(page, 0.6, false);
    await expect(root.locator('[data-node-id="paris"]')).toHaveAttribute(
      'transform',
      'translate(95 200)',
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
    await expect(root.locator('[data-node-id="paris"]')).toHaveAttribute(
      'transform',
      'translate(95 200)',
    );
    await expect(root.locator('[data-incorrect-edge]')).toHaveCSS(
      'opacity',
      '0',
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
    await page.setViewportSize({
      width: width + 8,
      height: width === 1440 ? 900 : 844,
    });
    await expect(range).toHaveValue(String(progress));
    expect(
      Number(await card.locator('[data-history-endpoint]').getAttribute('cy')),
    ).toBe(cy);
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
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
  for (const selector of [
    'h1',
    '.kb-subheading',
    '.kb-introduction',
    '.kb-hero-metric',
  ])
    await expect(root.locator(selector)).toHaveCSS('opacity', '1');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(root.locator('.kb-graph')).toHaveCount(1);
  await expect(root.locator('.kb-scene-layer .kb-graph')).toHaveCount(1);
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
    await graphMatchesDock(page);
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '1',
    );
    const accent = await root
      .locator('.kb-graph-metric strong')
      .evaluate((element) => getComputedStyle(element).color);
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'stroke',
      accent,
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
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({ content: 'html { font-size: 125%; }' });
  await noOverflow(page);
  for (const heading of await root.locator('li[data-story-beat] h2').all())
    await expect(heading).toBeVisible();
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
