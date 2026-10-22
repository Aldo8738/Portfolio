import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const label = process.argv[2];
if (!label || !/^[a-z0-9-]+$/.test(label))
  throw new Error('Provide a simple capture label');
const output = resolve('docs/qa/cinematic', label);
const viewQuery = process.env.CAPTURE_HERO === '1' ? '' : '&compare=1';
const desktopQuality = process.env.CAPTURE_LOW === '1' ? 'low' : 'standard';
const baseline =
  label === 'after'
    ? JSON.parse(
        await readFile(
          resolve('docs/qa/cinematic/before/measurements.json'),
          'utf8',
        ),
      )
    : null;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  args:
    process.env.PLAYWRIGHT_SOFTWARE_WEBGL === '1'
      ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
      : [],
});
const results = {};
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1280, height: 720 },
    mobile: { width: 390, height: 844 },
  })) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(
      `http://127.0.0.1:4322/?debug=1${viewQuery}${name === 'desktop' ? `&quality=${desktopQuality}` : ''}`,
    );
    const stage = page.locator('[data-scene-status]');
    await stage.waitFor({ state: 'visible' });
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-scene-status]')
          ?.getAttribute('data-scene-status') === 'ready',
      null,
      { timeout: 60000 },
    );
    results[name] = {
      viewport,
      metrics: JSON.parse(await stage.getAttribute('data-scene-metrics')),
      errors,
    };
    assert.deepEqual(errors, [], `${name}: browser errors`);
    for (const [target, point] of Object.entries(results[name].metrics.targets))
      assert.ok(
        Number.isFinite(point.x) &&
          Number.isFinite(point.y) &&
          Math.abs(point.x) < 1 &&
          Math.abs(point.y) < 1,
        `${name}: target outside viewport: ${target}`,
      );
    if (baseline && viewQuery) {
      assert.deepEqual(viewport, baseline[name].viewport);
      for (const [target, before] of Object.entries(
        baseline[name].metrics.targets,
      )) {
        const after = results[name].metrics.targets[target];
        assert.ok(
          after &&
            Math.abs(after.x - before.x) < 1e-7 &&
            Math.abs(after.y - before.y) < 1e-7,
          `${name}: comparison framing changed at ${target}`,
        );
      }
    }
    await page.screenshot({
      path: resolve(output, `${name}.png`),
      fullPage: true,
    });
    await context.close();
  }
  if (process.env.CAPTURE_BENCHMARK === '1') {
    for (const [name, viewport] of Object.entries({
      desktop: { width: 1280, height: 720 },
      mobile: { width: 390, height: 844 },
    })) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      await page.goto(
        `http://127.0.0.1:4322/?debug=1${viewQuery}&benchmark=1${name === 'desktop' ? `&quality=${desktopQuality}` : ''}`,
      );
      await page.waitForFunction(
        () =>
          document
            .querySelector('canvas')
            ?.getAttribute('data-scene-benchmark'),
        null,
        { timeout: 90000 },
      );
      results[name].benchmark = JSON.parse(
        await page.locator('canvas').getAttribute('data-scene-benchmark'),
      );
      await context.close();
    }
  }
  await writeFile(
    resolve(output, 'measurements.json'),
    JSON.stringify(results, null, 2) + '\n',
  );
  console.log(
    JSON.stringify(
      {
        output,
        profiles: Object.fromEntries(
          Object.entries(results).map(([name, data]) => [
            name,
            {
              readyMs: data.metrics.readyMs,
              calls: data.metrics.calls,
              quality: data.metrics.quality,
              benchmark: data.benchmark,
              errors: data.errors,
            },
          ]),
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
