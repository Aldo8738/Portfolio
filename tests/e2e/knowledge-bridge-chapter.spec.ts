import { expect, test } from '@playwright/test';
import { knowledgeStoryMotion } from '../../src/components/work/knowledge-bridge/graph-motion';

for (const [width, height] of [
  [1440, 900],
  [1366, 768],
  [1280, 720],
  [390, 844],
  [375, 667],
] as const) {
  test(`Chapter 01 reads, holds, focuses and reverses at ${width}x${height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-case-ready', 'true');
    await page.evaluate(() => document.fonts.ready);
    await expect(
      root.locator('.kb-hero .kb-graph, .kb-hero-steps'),
    ).toHaveCount(0);
    await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
    await expect(
      root.locator('[data-overload-node="queretaro"] text'),
    ).toHaveText('Querétaro');
    await page.screenshot({ path: testInfo.outputPath('hero.png') });
    const composition = await root.evaluate((el) => {
      const box = (selector: string) => {
        const element = el.querySelector(selector);
        if (!element) throw new Error('Hero composition missing: ' + selector);
        const rect = element.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          bottom: rect.bottom,
          height: rect.height,
        };
      };
      const title = el.querySelector('h1');
      if (!title) throw new Error('Hero title missing');
      return {
        title: box('h1'),
        description: box('.kb-hero-description'),
        metric: box('.kb-hero-metric'),
        facts: box('.kb-facts'),
        fontSize: parseFloat(getComputedStyle(title).fontSize),
      };
    });
    expect(composition.title.height / composition.fontSize).toBeCloseTo(2, 1);
    if (width >= 1100) {
      expect(composition.description.y).toBeCloseTo(composition.metric.y, 0);
      expect(composition.metric.x).toBeGreaterThan(
        composition.description.x + composition.description.width,
      );
    } else
      expect(composition.metric.y).toBeGreaterThanOrEqual(
        composition.description.bottom,
      );
    expect(composition.facts.y).toBeGreaterThan(
      Math.max(composition.description.bottom, composition.metric.bottom),
    );
    expect(composition.facts.width).toBeCloseTo(composition.title.width, 0);
    const facts = root.locator('.kb-hero .kb-facts');
    await facts.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(facts).toBeInViewport({ ratio: 1 });
    await expect(facts).toHaveCSS('opacity', '1');
    await expect(root.locator('.kb-graph')).toHaveCSS('opacity', '0');
    const graph = await root.locator('.kb-graph').elementHandle();
    const geometry = await root
      .locator(
        '[data-node-id], [data-network-edge], [data-overload-node], [data-overload-point], [data-overload-connection]',
      )
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          JSON.stringify(
            ['transform', 'd', 'cx', 'cy'].map((name) =>
              node.getAttribute(name),
            ),
          ),
        ),
      );
    const pinned = width >= 1100;
    const bounds = await page.evaluate(
      ({ pinned, motion }) => {
        const target = document.querySelector(
          pinned ? '.pin-spacer' : '[data-chapter-one-dock]',
        );
        if (!target) throw new Error('Chapter missing');
        return {
          start:
            target.getBoundingClientRect().top +
            scrollY -
            (pinned ? 0 : innerHeight * 0.25),
          distance:
            innerHeight *
            (pinned ? motion.scrollScreens * motion.chapterFraction : 1.5),
        };
      },
      { pinned, motion: knowledgeStoryMotion },
    );
    const chapter = async (progress: number) => {
      await page.evaluate(
        ({ start, distance, progress }) =>
          scrollTo(0, start + distance * progress),
        { ...bounds, progress },
      );
      await page.waitForTimeout(500);
    };
    if (pinned) {
      await chapter(0.15);
      await expect(root.locator('.kb-chapter-one-copy')).toHaveCSS(
        'opacity',
        '1',
      );
      await expect(root.locator('.kb-graph')).toHaveCSS('opacity', '0');
    } else {
      await root.locator('.kb-chapter-one-copy h2').scrollIntoViewIfNeeded();
      await expect(root.locator('.kb-chapter-one-copy h2')).toBeInViewport();
    }
    if (pinned) {
      for (const progress of [
        0.25, 0.265, 0.27, 0.275, 0.28, 0.295, 0.31, 0.275, 0.25,
      ]) {
        await chapter(progress);
        const opacity = await root.evaluate((el) => {
          const text = el.querySelector('.kb-chapter-one-copy');
          const graph = el.querySelector('.kb-graph');
          if (!text || !graph) throw new Error('Chapter handoff missing');
          return (
            Number(getComputedStyle(text).opacity) +
            Number(getComputedStyle(graph).opacity)
          );
        });
        expect(opacity).toBeGreaterThanOrEqual(0.49);
      }
      await page.screenshot({
        path: testInfo.outputPath('chapter-handoff.png'),
      });
    }
    let overloaded = '';
    let denseMarkup: string | undefined;
    let focusedMarkup: string | undefined;
    for (const progress of [0.42, 0.55, 0.7, 0.83, 0.87, 0.55, 0.42]) {
      await chapter(progress);
      await expect(root.locator('.kb-graph')).toHaveCSS('opacity', '1');
      expect(
        await root
          .locator('.kb-graph')
          .evaluate((el, prior) => el === prior, graph),
      ).toBe(true);
      expect(
        await root
          .locator(
            '[data-node-id], [data-network-edge], [data-overload-node], [data-overload-point], [data-overload-connection]',
          )
          .evaluateAll((nodes) =>
            nodes.map((node) =>
              JSON.stringify(
                ['transform', 'd', 'cx', 'cy'].map((name) =>
                  node.getAttribute(name),
                ),
              ),
            ),
          ),
      ).toEqual(geometry);
      const markup = await root
        .locator('.kb-graph')
        .evaluate((el) => el.innerHTML);
      if (progress === 0.42 || progress === 0.55) {
        denseMarkup ??= markup;
        expect(markup).toBe(denseMarkup);
        const labels = await root
          .locator('.kb-node text, [data-overload-node] text')
          .all();
        expect(labels).toHaveLength(12);
        if (pinned && progress === 0.42) {
          const bounds = await root.locator('.kb-graph').evaluate((svg) => {
            const canvas = svg.getBoundingClientRect();
            const selector =
              '.kb-overload path,.kb-overload circle,.kb-periphery path,.kb-periphery circle,[data-network-edge],[data-corrected-edge],.kb-item-mark,.kb-node text,.kb-overload text';
            const rects = [...svg.querySelectorAll(selector)].flatMap((el) => {
              let alpha = 1;
              for (
                let node: Element | null = el;
                node;
                node = node.parentElement
              ) {
                const style = getComputedStyle(node);
                if (style.display === 'none' || style.visibility === 'hidden')
                  return [];
                alpha *= Number(style.opacity);
              }
              return alpha > 0.05 ? [el.getBoundingClientRect()] : [];
            });
            const width =
              Math.max(...rects.map((r) => r.right)) -
              Math.min(...rects.map((r) => r.left));
            const height =
              Math.max(...rects.map((r) => r.bottom)) -
              Math.min(...rects.map((r) => r.top));
            return {
              width,
              height,
              widthFraction: width / canvas.width,
              heightFraction: height / innerHeight,
            };
          });
          expect(bounds.widthFraction).toBeGreaterThanOrEqual(0.85);
          expect(bounds.widthFraction).toBeLessThanOrEqual(0.96);
          expect(bounds.heightFraction).toBeGreaterThanOrEqual(0.55);
          expect(bounds.heightFraction).toBeLessThanOrEqual(0.71);
          await testInfo.attach('settled-graph-bounds.json', {
            body: JSON.stringify(bounds),
            contentType: 'application/json',
          });
        }
        for (const label of labels)
          await expect(label).toBeInViewport({ ratio: 0.99 });
      }
      if (progress === 0.83 || progress === 0.87) {
        focusedMarkup ??= markup;
        expect(markup).toBe(focusedMarkup);
      }
      const viewBox = await root.locator('.kb-graph').getAttribute('viewBox');
      if (progress === 0.42) overloaded = viewBox ?? '';
      if (progress === 0.55) expect(viewBox).toBe(overloaded);
      if (progress === 0.83 || progress === 0.87) {
        for (const label of await root.locator('.kb-node text').all())
          await expect(label).toBeInViewport({ ratio: 0.99 });
        expect(viewBox).not.toBe(overloaded);
        await expect(root.locator('.kb-overload')).toHaveCSS('opacity', '0');
      }
      if ([0.42, 0.7, 0.83].includes(progress))
        await page.screenshot({
          path: testInfo.outputPath(`chapter-${progress}.png`),
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('reduced motion presents still overload and clean states without a pin', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [width, height] of [
    [1440, 900],
    [375, 667],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/work/knowledge-bridge');
    const root = page.locator('[data-knowledge-bridge]');
    await expect(root).toHaveAttribute('data-story-mode', 'static');
    await root
      .locator('[data-chapter-one-dock]')
      .evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect(root).toHaveAttribute('data-chapter-scene', 'overload');
    await expect(root.locator('.kb-overload')).toHaveCSS('opacity', '1');
    const original = await root
      .locator('[data-node-id="paris"]')
      .elementHandle();
    await page.screenshot({
      path: testInfo.outputPath(`reduced-overload-${width}.png`),
    });
    await root
      .locator('[data-story-dock]')
      .evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(root).toHaveAttribute('data-chapter-scene', 'clean');
    await expect(root.locator('.kb-overload')).toHaveCSS('opacity', '0');
    expect(
      await root
        .locator('[data-node-id="paris"]')
        .evaluate((el, prior) => el === prior, original),
    ).toBe(true);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`reduced-clean-${width}.png`),
    });
  }
});
