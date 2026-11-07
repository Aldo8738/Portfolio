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
    const facts = root.locator('.kb-hero .kb-facts');
    await facts.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await expect(facts).toBeInViewport({ ratio: 1 });
    await expect(facts).toHaveCSS('opacity', '1');
    await expect(root.locator('.kb-graph')).toHaveCSS('opacity', '0');
    const graph = await root.locator('.kb-graph').elementHandle();
    const geometry = await root
      .locator('[data-node-id], [data-network-edge]')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) => node.getAttribute('transform') ?? node.getAttribute('d'),
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
    let overloaded = '';
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
          .locator('[data-node-id], [data-network-edge]')
          .evaluateAll((nodes) =>
            nodes.map(
              (node) =>
                node.getAttribute('transform') ?? node.getAttribute('d'),
            ),
          ),
      ).toEqual(geometry);
      const viewBox = await root.locator('.kb-graph').getAttribute('viewBox');
      if (progress === 0.42) overloaded = viewBox ?? '';
      if (progress === 0.55) expect(viewBox).toBe(overloaded);
      if (progress === 0.83 || progress === 0.87) {
        for (const label of await root.locator('.kb-node text').all())
          await expect(label).toBeInViewport({ ratio: 0.99 });
        expect(viewBox).not.toBe(overloaded);
        await expect(
          root
            .locator('[data-overload-node="queretaro"]')
            .locator('..')
            .locator('..'),
        ).toHaveCSS('opacity', '0');
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
