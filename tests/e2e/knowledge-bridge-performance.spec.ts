import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { knowledgeStoryMotion } from '../../src/components/work/knowledge-bridge/graph-motion';

const label = process.env.KB_PROFILE_LABEL;
const profiles = [
  { name: 'desktop', width: 1440, height: 900, cpu: 1 },
  { name: 'short-desktop', width: 1280, height: 600, cpu: 1 },
  { name: 'mobile-cpu4', width: 390, height: 844, cpu: 4 },
] as const;

interface ProfileSamples {
  frames: Record<string, number[]>;
  dockReads: number;
  longTasks: number[];
}
interface ProfileControls {
  setPhase(name: string): void;
  finish(): ProfileSamples;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function summarizeTrace(json: string) {
  const data: unknown = JSON.parse(json);
  if (!record(data) || !Array.isArray(data.traceEvents))
    throw new Error('Invalid Chrome trace');
  const events: Record<string, { count: number; ms: number }> = {};
  const forcedLayouts: { ms: number; functions: string[] }[] = [];
  for (const event of data.traceEvents) {
    if (
      !record(event) ||
      event.ph !== 'X' ||
      typeof event.name !== 'string' ||
      typeof event.dur !== 'number'
    )
      continue;
    if (
      ![
        'Layout',
        'UpdateLayoutTree',
        'Paint',
        'PrePaint',
        'FunctionCall',
      ].includes(event.name)
    )
      continue;
    const summary = (events[event.name] ??= { count: 0, ms: 0 });
    summary.count++;
    summary.ms += event.dur / 1000;
    if (
      event.name !== 'Layout' ||
      !record(event.args) ||
      !record(event.args.beginData)
    )
      continue;
    const stack = event.args.beginData.stackTrace;
    if (Array.isArray(stack) && stack.length)
      forcedLayouts.push({
        ms: event.dur / 1000,
        functions: stack
          .filter(record)
          .map((frame) => String(frame.functionName ?? '(anonymous)'))
          .slice(0, 5),
      });
  }
  return {
    events,
    forcedLayoutCount: forcedLayouts.length,
    forcedLayoutMs: forcedLayouts.reduce((sum, event) => sum + event.ms, 0),
    largestForcedLayouts: forcedLayouts
      .toSorted((a, b) => b.ms - a.ms)
      .slice(0, 5),
  };
}

for (const profile of profiles) {
  test.describe('Knowledge Bridge profile ' + profile.name, () => {
    test.use({
      viewport: { width: profile.width, height: profile.height },
      reducedMotion: 'no-preference',
      isMobile: profile.width < 768,
      hasTouch: profile.width < 768,
      deviceScaleFactor: 1,
    });
    test('compare identical forward and reverse scroll sweeps', async ({
      page,
      browser,
    }, testInfo) => {
      test.skip(
        !label,
        'Opt-in profiling: set KB_PROFILE_LABEL to before or after.',
      );
      test.setTimeout(120000);
      if (!label || !/^[a-z0-9-]+$/.test(label))
        throw new Error('Invalid profile label');
      const directory = join(
        '.cache',
        'knowledge-bridge-profile',
        label,
        profile.name,
      );
      await mkdir(directory, { recursive: true });
      const session = await page.context().newCDPSession(page);
      await session.send('Emulation.setCPUThrottlingRate', {
        rate: profile.cpu,
      });
      await session.send('Performance.enable');
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/work/knowledge-bridge');
      const root = page.locator('[data-knowledge-bridge]');
      await expect(root).toHaveAttribute('data-case-ready', 'true');
      await page.evaluate(() => document.fonts.ready);
      const bounds = await page.evaluate((motion) => {
        const hero = document.querySelector('.kb-hero'),
          facts = document.querySelector('.kb-facts');
        const stage =
          document.querySelector('.pin-spacer') ??
          document.querySelector('[data-story-stage]');
        const copy = document.querySelector('[data-story-copy]'),
          figure = document.querySelector<HTMLElement>('.kb-story-figure');
        if (!hero || !facts || !stage || !copy || !figure)
          throw new Error('Profile geometry missing');
        const start = Math.max(
          0,
          facts.getBoundingClientRect().bottom +
            scrollY -
            innerHeight +
            parseFloat(getComputedStyle(hero).paddingBottom),
        );
        const entryEnd = stage.getBoundingClientRect().top + scrollY;
        const end = document.querySelector('.pin-spacer')
          ? entryEnd + innerHeight * motion.scrollScreens
          : copy.getBoundingClientRect().bottom +
            scrollY -
            figure.offsetHeight -
            Math.min(
              motion.readingGap,
              (innerHeight - figure.offsetHeight) * motion.readingFraction,
            );
        return { start, entryEnd, end };
      }, knowledgeStoryMotion);
      await page.evaluate((y) => scrollTo(0, y), Math.floor(bounds.start));
      await expect(root.locator('[data-hero-value]')).toHaveText('81.5');
      const runs = [];
      for (let run = 0; run < 3; run++) {
        await expect(root).toHaveAttribute('data-graph-entry', '0.000');
        await session.send('Tracing.start', {
          categories:
            'devtools.timeline,disabled-by-default-devtools.timeline.stack',
          transferMode: 'ReturnAsStream',
        });
        const before = (await session.send('Performance.getMetrics')).metrics;
        await page.evaluate(() => {
          const dock = document.querySelector('[data-hero-dock]'),
            storyDock = document.querySelector('[data-story-dock]');
          const originalRect = Element.prototype.getBoundingClientRect;
          let dockReads = 0;
          Element.prototype.getBoundingClientRect = function () {
            if (this === dock || this === storyDock) dockReads++;
            return originalRect.call(this);
          };
          const longTasks: number[] = [];
          const observer = new PerformanceObserver((list) =>
            longTasks.push(...list.getEntries().map((entry) => entry.duration)),
          );
          observer.observe({ type: 'longtask' });
          const frames: Record<string, number[]> = {};
          let phase = '',
            previous: number | undefined,
            frameId = 0;
          function frame(time: number) {
            if (phase && previous !== undefined)
              frames[phase]?.push(time - previous);
            previous = time;
            frameId = requestAnimationFrame(frame);
          }
          frameId = requestAnimationFrame(frame);
          (window as unknown as { kbProfile: ProfileControls }).kbProfile = {
            setPhase(name) {
              phase = name;
              previous = undefined;
              frames[name] = [];
            },
            finish() {
              cancelAnimationFrame(frameId);
              longTasks.push(
                ...observer.takeRecords().map((entry) => entry.duration),
              );
              observer.disconnect();
              Element.prototype.getBoundingClientRect = originalRect;
              return { frames, dockReads, longTasks };
            },
          };
        });
        let samples: ProfileSamples;
        const positions: Record<string, number> = {};
        try {
          for (const segment of [
            { name: 'entry-forward', from: bounds.start, to: bounds.entryEnd },
            { name: 'story-forward', from: bounds.entryEnd, to: bounds.end },
            { name: 'story-reverse', from: bounds.end, to: bounds.entryEnd },
            { name: 'entry-reverse', from: bounds.entryEnd, to: bounds.start },
          ]) {
            await page.evaluate(
              (name) =>
                (
                  window as unknown as { kbProfile: ProfileControls }
                ).kbProfile.setPhase(name),
              segment.name,
            );
            await session.send('Input.synthesizeScrollGesture', {
              x: profile.width / 2,
              y: profile.height / 2,
              yDistance: segment.from - segment.to,
              speed: Math.max(
                1,
                Math.round(Math.abs(segment.to - segment.from) / 1.8),
              ),
              gestureSourceType: 'mouse',
              preventFling: true,
            });
            const position = await page.evaluate(() => scrollY);
            positions[segment.name] = position;
            expect(Math.abs(position - segment.to)).toBeLessThan(5);
          }
        } finally {
          samples = await page.evaluate(() =>
            (
              window as unknown as { kbProfile: ProfileControls }
            ).kbProfile.finish(),
          );
        }
        const after = (await session.send('Performance.getMetrics')).metrics;
        const completed = new Promise<{ stream?: string }>((resolve) =>
          session.once('Tracing.tracingComplete', resolve),
        );
        await session.send('Tracing.end');
        const { stream } = await completed;
        if (!stream) throw new Error('Chrome trace stream missing');
        let trace = '';
        while (true) {
          const chunk = await session.send('IO.read', { handle: stream });
          trace += chunk.base64Encoded
            ? Buffer.from(chunk.data, 'base64').toString('utf8')
            : chunk.data;
          if (chunk.eof) break;
        }
        await session.send('IO.close', { handle: stream });
        await writeFile(join(directory, 'run-' + run + '.trace.json'), trace);
        const metrics: Record<string, number> = {};
        for (const name of [
          'LayoutCount',
          'LayoutDuration',
          'RecalcStyleCount',
          'RecalcStyleDuration',
          'ScriptDuration',
          'TaskDuration',
        ]) {
          metrics[name] =
            (after.find((metric) => metric.name === name)?.value ?? 0) -
            (before.find((metric) => metric.name === name)?.value ?? 0);
        }
        const frames = Object.fromEntries(
          Object.entries(samples.frames).map(([name, intervals]) => {
            const sorted = intervals.toSorted((a, b) => a - b);
            return [
              name,
              {
                count: sorted.length,
                medianMs: sorted[Math.floor(sorted.length / 2)],
                p95Ms: sorted[Math.floor(sorted.length * 0.95)],
                over25Ms: sorted.filter((ms) => ms > 25).length,
              },
            ];
          }),
        );
        runs.push({
          run,
          positions,
          dockReads: samples.dockReads,
          longTasks: samples.longTasks,
          frames,
          metrics,
          trace: summarizeTrace(trace),
        });
        await page.evaluate((y) => scrollTo(0, y), Math.floor(bounds.start));
      }
      const report = {
        label,
        profile,
        browser: browser.version(),
        platform: process.platform,
        durationPerSegmentMs: 1800,
        input:
          'Chrome native wheel gestures; RAF only samples cadence; mobile-sized CPU4 is a rendering proxy, not physical touch',
        bounds,
        runs,
      };
      await writeFile(
        join(directory, 'summary.json'),
        JSON.stringify(report, null, 2) + '\n',
      );
      await testInfo.attach('profile-summary.json', {
        body: JSON.stringify(report),
        contentType: 'application/json',
      });
      await expect(root.locator('.kb-graph')).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  });
}
