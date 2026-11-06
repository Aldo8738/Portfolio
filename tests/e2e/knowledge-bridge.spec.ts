import { expect, test } from '@playwright/test';
import {
  knowledgeBridge,
  knowledgeBridgeBeats,
} from '../../src/content/knowledge-bridge';
import { knowledgeStoryMotion } from '../../src/components/work/knowledge-bridge/graph-motion';
import { writeFile } from 'node:fs/promises';
import { getStoryBeat } from '../../src/components/work/knowledge-bridge/story-state';
import { graphLinks } from '../../src/content/knowledge-graph';

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
  await page.waitForTimeout(450);
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

async function entryProgress(
  page: import('@playwright/test').Page,
  progress: number,
) {
  const bounds = await page.evaluate(() => {
    const hero = document.querySelector('.kb-hero');
    const facts = document.querySelector('.kb-facts');
    const stage =
      document.querySelector('.pin-spacer') ??
      document.querySelector('[data-story-stage]');
    if (!hero || !facts || !stage) throw new Error('Entry layout missing');
    const transform = getComputedStyle(facts).transform;
    const heldOffset =
      transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
    const start = Math.max(
      0,
      facts.getBoundingClientRect().bottom +
        scrollY -
        heldOffset -
        innerHeight +
        parseFloat(getComputedStyle(hero).paddingBottom),
    );
    return { start, end: stage.getBoundingClientRect().top + scrollY };
  });
  await page.evaluate(
    ({ start, end, progress }) => scrollTo(0, start + (end - start) * progress),
    { ...bounds, progress },
  );
  await page.waitForTimeout(450);
}

test('all hero information is readable before exit across viewport heights', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const information = [
    '[data-hero-copy] .eyebrow',
    'h1',
    '.kb-subheading',
    '.kb-introduction',
    '.kb-hero-metric',
    '.kb-facts > div:first-child',
    '.kb-facts > div:last-child',
    '.kb-facts',
  ];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [1280, 720],
    [390, 844],
    [375, 667],
    [1280, 600],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-case-ready', 'true');
    await page.evaluate(() => document.fonts.ready);
    const original = await root.locator('.kb-graph').elementHandle();
    if (!original) throw new Error('Graph missing');
    const inspectReading = async (selectors: readonly string[]) => {
      for (const selector of selectors) {
        const target = root.locator(selector);
        const naturalTop = await target.evaluate(
          (el) => el.getBoundingClientRect().top + scrollY,
        );
        await target.evaluate((el) => {
          const hero = document.querySelector('.kb-hero');
          if (!hero) throw new Error('Hero missing');
          scrollTo(
            0,
            Math.max(
              0,
              Math.floor(
                el.getBoundingClientRect().bottom +
                  scrollY -
                  innerHeight +
                  parseFloat(getComputedStyle(hero).paddingBottom),
              ),
            ),
          );
        });
        await expect(target).toBeInViewport({ ratio: 1 });
        await expect
          .poll(() =>
            target.evaluate((el) => {
              let opacity = 1;
              for (
                let node: Element | null = el;
                node;
                node = node.parentElement
              )
                opacity *= Number(getComputedStyle(node).opacity);
              return opacity;
            }),
          )
          .toBe(1);
        await expect(root).toHaveAttribute('data-graph-entry', '0.000');
        expect(
          await target.evaluate(
            (el) => el.getBoundingClientRect().top + scrollY,
          ),
        ).toBeCloseTo(naturalTop, 0);
        if (selector === '.kb-hero-metric')
          await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
      }
    };
    await inspectReading(information);
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath('reading-' + width + '-' + height + '.png'),
    });
    await entryProgress(page, 0.5);
    await expect
      .poll(async () => Number(await root.getAttribute('data-graph-entry')))
      .toBeCloseTo(0.5, 2);
    for (const id of ['paris', 'france'])
      await expect(
        root.locator('[data-node-id="' + id + '"]'),
      ).toBeInViewport();
    expect(
      await root
        .locator('.kb-graph')
        .evaluate((el, prior) => el === prior, original),
    ).toBe(true);
    if (width === 375 || height === 600)
      await page.screenshot({
        path: testInfo.outputPath(
          'transition-' + width + '-' + height + '.png',
        ),
      });
    await entryProgress(page, 0);
    await inspectReading(information.toReversed());
    await noOverflow(page);
    if (width < 768 || height === 600)
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
    if (width === 1440) {
      await page.setViewportSize({ width, height: 600 });
      await page.evaluate(() => scrollTo(0, 0));
      await expect(root).toHaveAttribute('data-story-mode', 'scroll');
      await inspectReading(information);
      await entryProgress(page, 0.5);
      await expect
        .poll(async () => Number(await root.getAttribute('data-graph-entry')))
        .toBeCloseTo(0.5, 2);
      await entryProgress(page, 0);
      await inspectReading(information.toReversed());
      await noOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test('records continuous entry with attached edges and unchanged graph identity', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
    recordVideo: {
      dir: testInfo.outputPath('recording'),
      size: { width: 1440, height: 900 },
    },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const measurements = { cls: 0, longTasks: [] as number[] };
    (
      window as unknown as { kbMeasurements: typeof measurements }
    ).kbMeasurements = measurements;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) measurements.cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) =>
      measurements.longTasks.push(
        ...list.getEntries().map((entry) => entry.duration),
      ),
    ).observe({ type: 'longtask', buffered: true });
  });
  await page.goto('/work/knowledge-bridge');
  const root = page.locator('[data-knowledge-bridge]');
  await expect(root).toHaveAttribute('data-case-ready', 'true');
  const graph = await root.locator('.kb-graph').elementHandle();
  const parent = await root
    .locator('[data-network-host]')
    .evaluateHandle((el) => el.parentElement);
  const paris = await root.locator('[data-node-id="paris"]').elementHandle();
  const france = await root.locator('[data-node-id="france"]').elementHandle();
  if (!graph || !paris || !france) throw new Error('Persistent nodes missing');
  const titleTop = await root
    .locator('h1')
    .evaluate((el) => el.getBoundingClientRect().top);
  for (const progress of [
    0, 0.2, 0.4, 0.5, 0.7, 0.9, 1, 0.5, 0.4, 0,
  ] as const) {
    await entryProgress(page, progress);
    if (progress > 0 && progress < 0.8) {
      expect(
        await root
          .locator('h1')
          .evaluate((el) => el.getBoundingClientRect().top),
      ).toBeCloseTo(titleTop, 0);
      const opacity = await root
        .locator('[data-hero-copy]')
        .evaluate((el) => Number(getComputedStyle(el).opacity));
      if (progress < 0.18) expect(opacity).toBe(1);
      else if (progress < 0.38) {
        expect(opacity).toBeGreaterThan(0);
        expect(opacity).toBeLessThan(1);
      } else expect(opacity).toBe(0);
      expect(
        await root
          .locator('.kb-hero-metric')
          .evaluate((el) => Number(getComputedStyle(el).opacity)),
      ).toBe(opacity);
    }
    const heroOpacity = await root
      .locator('[data-hero-copy]')
      .evaluate((el) => getComputedStyle(el).opacity);
    await expect(root.locator('.kb-facts')).toHaveCSS('opacity', heroOpacity);
    if (progress === 0) {
      await expect(root.locator('[data-hero-copy]')).toHaveCSS('opacity', '1');
      await expect(root.locator('.kb-hero-metric')).toHaveCSS('opacity', '1');
    }
    for (const id of ['paris', 'france']) {
      await expect(
        root.locator('[data-node-id="' + id + '"]'),
      ).toBeInViewport();
    }
    if ([0.2, 0.4, 0.5, 0.7].includes(progress)) {
      await page.screenshot({
        path: testInfo.outputPath(
          'hero-entry-' + Math.round(progress * 100) + '.png',
        ),
      });
    }
    expect(
      await root
        .locator('.kb-graph')
        .evaluate((el, prior) => el === prior, graph),
    ).toBe(true);
    expect(
      await root
        .locator('[data-network-host]')
        .evaluate((el, prior) => el.parentElement === prior, parent),
    ).toBe(true);
    expect(
      await root
        .locator('[data-node-id="paris"]')
        .evaluate((el, prior) => el === prior, paris),
    ).toBe(true);
    expect(
      await root
        .locator('[data-node-id="france"]')
        .evaluate((el, prior) => el === prior, france),
    ).toBe(true);
    const gaps = await page.evaluate((links) => {
      const path = document.querySelector<SVGPathElement>(
        '[data-corrected-edge]',
      );
      const from = document.querySelector<SVGGElement>(
        '[data-node-id="paris"]',
      );
      const to = document.querySelector<SVGGElement>('[data-node-id="france"]');
      if (!path || !from || !to) throw new Error('Edge endpoints missing');
      const start = path.getPointAtLength(0),
        end = path.getPointAtLength(path.getTotalLength());
      const a = from.transform.baseVal.consolidate()?.matrix,
        b = to.transform.baseVal.consolidate()?.matrix;
      if (!a || !b) throw new Error('Node transforms missing');
      const primaryGaps = [
        Math.hypot(start.x - a.e, start.y - a.f),
        Math.hypot(end.x - b.e, end.y - b.f),
      ];
      for (const [index, [fromId, toId]] of links.entries()) {
        const edge = document.querySelector<SVGPathElement>(
          '[data-network-edge="' + index + '"]',
        );
        const fromNode = document.querySelector<SVGGElement>(
          '[data-node-id="' + fromId + '"]',
        );
        const toNode = document.querySelector<SVGGElement>(
          '[data-node-id="' + toId + '"]',
        );
        if (!edge || !fromNode || !toNode)
          throw new Error('Context edge missing');
        const fromMatrix = fromNode.transform.baseVal.consolidate()?.matrix,
          toMatrix = toNode.transform.baseVal.consolidate()?.matrix;
        if (!fromMatrix || !toMatrix)
          throw new Error('Context node transform missing');
        const edgeStart = edge.getPointAtLength(0),
          edgeEnd = edge.getPointAtLength(edge.getTotalLength());
        primaryGaps.push(
          Math.hypot(edgeStart.x - fromMatrix.e, edgeStart.y - fromMatrix.f),
          Math.hypot(edgeEnd.x - toMatrix.e, edgeEnd.y - toMatrix.f),
        );
      }
      return primaryGaps;
    }, graphLinks);
    for (const gap of gaps) expect(gap).toBeLessThan(1);
    if (progress === 0.5)
      await page.screenshot({
        path: testInfo.outputPath('entry-midpoint.png'),
      });
  }
  const frameTimes = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const samples: number[] = [],
          start = scrollY;
        let count = 0,
          previous = performance.now();
        function frame(time: number) {
          samples.push(time - previous);
          previous = time;
          scrollTo(0, start + ++count * 10);
          if (count < 60) requestAnimationFrame(frame);
          else resolve(samples.slice(1));
        }
        requestAnimationFrame(frame);
      }),
  );
  const metrics = await page.evaluate(
    () =>
      (
        window as unknown as {
          kbMeasurements: { cls: number; longTasks: number[] };
        }
      ).kbMeasurements,
  );
  const ordered = frameTimes.toSorted((a, b) => a - b);
  await testInfo.attach('browser-measurements.json', {
    body: JSON.stringify(
      {
        ...metrics,
        medianFrameMs: ordered[Math.floor(ordered.length / 2)],
        p95FrameMs: ordered[Math.floor(ordered.length * 0.95)],
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });
  await writeFile(
    testInfo.outputPath('browser-measurements.json'),
    JSON.stringify(
      {
        ...metrics,
        medianFrameMs: ordered[Math.floor(ordered.length / 2)],
        p95FrameMs: ordered[Math.floor(ordered.length * 0.95)],
      },
      null,
      2,
    ),
  );
  await storyProgress(page, 0.6, true);
  await storyProgress(page, 0.79, true);
  await storyProgress(page, 0.98, true);
  const slider = root.locator('[data-history-range]');
  await slider.scrollIntoViewIfNeeded();
  await slider.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('End');
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(testInfo.outputPath('continuous-scroll.webm'));
});

test('paused hero focus and corrected compositions remain readable on desktop and phone', async ({
  page,
}, testInfo) => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-case-ready', 'true');
    await page.evaluate(() => document.fonts.ready);
    await expect(root.locator('[data-node-id="paris"]')).toBeVisible();
    await expect(root.locator('[data-node-id="france"]')).toBeVisible();
    await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
    await page.screenshot({
      path: testInfo.outputPath('still-' + width + '-hero.png'),
    });
    for (const [progress, name] of [
      [0.42, 'focus'],
      [0.98, 'corrected'],
    ] as const) {
      await storyProgress(page, progress, width >= 1100);
      await noOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath('still-' + width + '-' + name + '.png'),
      });
    }
  }
});

test('one persistent Paris France network expands continuously and rewinds its causal graph story', async ({
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
    [1280, 720],
    [1366, 768],
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
    await expect(root.locator('.kb-scene-layer .kb-graph')).toHaveCount(1);
    await expect(root.locator('[data-peripheral-point]')).toHaveCount(24);
    const original = await root.locator('.kb-graph').elementHandle();
    if (!original) throw new Error('Network missing');
    const originalParent = await root
      .locator('[data-network-host]')
      .evaluateHandle((el) => el.parentElement);
    for (const expansion of await root.locator('[data-expansion]').all())
      await expect(expansion).toHaveCSS('opacity', '0');
    const art = await root.locator('[data-hero-dock]').boundingBox(),
      metric = await root.locator('.kb-hero-metric').boundingBox();
    if (!art || !metric) throw new Error('Hero composition missing');
    expect(metric.y).toBeGreaterThan(art.y);
    await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
    await page.screenshot({ path: testInfo.outputPath(`hero-${width}.png`) });
    for (const [progress, stage] of [
      [0.23, 1],
      [0.42, 2],
      [0.7, 3],
      [0.98, 4],
    ] as const) {
      await storyProgress(page, progress, true);
      await graphMatchesDock(page);
      await expect(root.locator('.kb-scene-layer .kb-graph')).toHaveCount(1);
      expect(
        await root
          .locator('[data-network-host]')
          .evaluate(
            (el, parent) => el.parentElement === parent,
            originalParent,
          ),
      ).toBe(true);
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
    await storyProgress(page, 1.1, true);
    await graphMatchesDock(page);
    await storyAction(page, 0.36, true);
    const priority = await root
      .locator('[data-priority-packet]')
      .getAttribute('cx');
    await storyAction(page, 0.42, true);
    expect(
      await root.locator('[data-priority-packet]').getAttribute('cx'),
    ).not.toBe(priority);
    await storyAction(page, 0.62, true);
    const outgoing = await root
      .locator('[data-feedback-packet]')
      .getAttribute('cx');
    await storyAction(page, 0.64, true);
    expect(
      await root.locator('[data-feedback-packet]').getAttribute('cx'),
    ).not.toBe(outgoing);
    await expect(root.locator('[data-corrected-edge]')).toHaveCSS(
      'opacity',
      '0',
    );
    await storyAction(page, 0.7, true);
    const incoming = await root
      .locator('[data-delivery-packet]')
      .getAttribute('cx');
    await storyAction(page, 0.72, true);
    expect(
      await root.locator('[data-delivery-packet]').getAttribute('cx'),
    ).not.toBe(incoming);
    await expect(root.locator('[data-incorrect-edge]')).toHaveCSS(
      'opacity',
      '0',
    );
    await expect(root.locator('[data-return-label]')).toContainText(
      'GRAPH UPDATE',
    );
    await expect(root.locator('[data-edit-label]')).toContainText(
      'USER EDIT / API',
    );
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(750);
    await expect(root.locator('.kb-scene-layer .kb-graph')).toHaveCount(1);
    await expect(root.locator('[data-node-id="paris"]')).toHaveAttribute(
      'transform',
      'translate(140 300)',
    );
    await expect(root.locator('.kb-graph')).toHaveCount(1);
    await storyProgress(page, 0.6, true);
    const beforeReload = await page.evaluate(() => scrollY);
    await page.reload();
    await expect(root).toHaveAttribute('data-story-mode', 'pinned');
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    await expect(root).toHaveAttribute('data-story-beat', '2');
    await expect
      .poll(async () =>
        Math.abs((await page.evaluate(() => scrollY)) - beforeReload),
      )
      .toBeLessThan(2);
    await graphMatchesDock(page);
    await storyProgress(page, 0.79, true);
  }
  expect(errors).toEqual([]);
  expect(warnings).toEqual([]);
});

test('Chapter 1 gives text and graph separate stable focus and reverses cleanly', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [1280, 720],
    [390, 844],
    [375, 667],
    [1280, 600],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-case-ready', 'true');
    await page.evaluate(() => document.fonts.ready);
    const text = root.locator('.kb-chapter-one-copy');
    const host = root.locator('[data-network-host]');
    const pinned = width >= 1100 && height >= 650;
    if (pinned) {
      const start = await page
        .locator('.pin-spacer')
        .evaluate((el) => el.getBoundingClientRect().top + scrollY);
      const chapter = async (progress: number) => {
        await page.evaluate(
          (y) => scrollTo(0, y),
          start + height * 2.25 * progress,
        );
        await page.waitForTimeout(500);
      };
      for (const progress of [0.1, 0.3]) {
        await chapter(progress);
        await expect(text).toHaveCSS('opacity', '1');
        await expect(text.locator('h2')).toBeInViewport({ ratio: 1 });
        await expect(text.locator('p')).toBeInViewport({ ratio: 1 });
        await expect(host).toHaveCSS('opacity', '0');
      }
      await page.screenshot({
        path: testInfo.outputPath('chapter-text-' + width + '.png'),
      });
      await chapter(0.46);
      await expect(text).toHaveCSS('opacity', '0');
      await expect(host).toHaveCSS('opacity', '0');
      let stable: string | undefined;
      for (const progress of [0.6, 0.75, 0.9]) {
        await chapter(progress);
        await expect(host).toHaveCSS('opacity', '1');
        await expect(text).toHaveCSS('opacity', '0');
        await graphMatchesDock(page);
        const geometry = await root
          .locator('.kb-graph')
          .evaluate((el) => el.innerHTML);
        stable ??= geometry;
        expect(geometry).toBe(stable);
        for (const label of await root.locator('.kb-node text').all())
          await expect(label).toBeInViewport({ ratio: 0.999 });
      }
      await page.screenshot({
        path: testInfo.outputPath('chapter-graph-' + width + '.png'),
      });
      await chapter(0.97);
      expect(
        Number(await host.evaluate((el) => getComputedStyle(el).opacity)),
      ).toBeLessThan(0.1);
      await storyProgress(page, 0.34, true);
      await chapter(0.75);
      await expect(host).toHaveCSS('opacity', '1');
      await expect(root).toHaveAttribute('data-story-beat', '0');
      await chapter(0.2);
      await expect(text).toHaveCSS('opacity', '1');
      await expect(host).toHaveCSS('opacity', '0');
    } else {
      await expect(page.locator('.pin-spacer')).toHaveCount(0);
      await text.locator('h2').scrollIntoViewIfNeeded();
      await expect(text).toHaveCSS('opacity', '1');
      await expect(text.locator('h2')).toBeInViewport({ ratio: 1 });
      await text.locator('p').scrollIntoViewIfNeeded();
      await expect(text.locator('p')).toBeInViewport({ ratio: 1 });
      await expect(text).toHaveCSS('opacity', '1');
      await expect(host).toHaveCSS('opacity', '0');
      await page.screenshot({
        path: testInfo.outputPath(
          'chapter-natural-' + width + '-' + height + '.png',
        ),
      });
      await storyProgress(page, 0.23, false);
      await expect(host).toHaveCSS('opacity', '1');
      await expect(text).toHaveCSS('opacity', '1');
      await text.locator('h2').scrollIntoViewIfNeeded();
      await expect(text).toHaveCSS('opacity', '1');
    }
    await noOverflow(page);
  }
});

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
        if (progress === 0.675) expect(state.edit + state.response).toBe(0);
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
    expect(storyHeight).toBeLessThan(height * 4);
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
