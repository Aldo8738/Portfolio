# Taquería Aldo — fast rotating ASCII taco (v6)

This is an optimized **real rotating ASCII point-cloud taco**, not a static loading image or a placeholder. The tortilla is an open fold with ingredients inside and a rounded seam. The renderer does **not** depend on Three.js, React, WebGL, fonts, textures, images, or remote requests.

## Open it

Double-click `ascii-taco-demo.html`. The HTML is self-contained and works offline. In DevTools, `taco.pause()`, `taco.setAngle(1.57)`, `taco.resume()` let you inspect different angles.

## Astro integration (inline critical renderer)

The Astro component loads optional Google Fonts Fira Code and redraws the canvas
after the font loads. It starts with a local monospace fallback. The standalone
HTML demo is unchanged and remains fully offline.

1. Copy `src/ascii-taco.js` to `<your-app>/src/lib/ascii-taco.js`.
2. Copy `astro/AsciiTacoLoader.astro` to `<your-app>/src/components/AsciiTacoLoader.astro` and change its renderer import to `../lib/ascii-taco.js?raw`.
3. Put `<AsciiTacoLoader />` as early as possible in your site's layout, **before** the hydrated interactive scene. It embeds the same renderer inline in the initial HTML: no additional JS request or hydration to initialize the taco.
4. When the 3D scene renders its **first usable frame**, run:

```js
window.__TAQUERIA_SCENE_READY__ = true;
window.dispatchEvent(new Event('taqueria:scene-ready'));
```

On that signal, the loader fades and releases its animation and observers. Do not emit the event just because a model finished downloading.

## Why it starts faster

- **About 59,000 points** instead of ~78,000 in v5.
- Procedural 3D geometry writes straight into `Float32Array` and `Uint8Array` buffers (no intermediate object array or copy).
- Repeated shell curves are precalculated; there are fewer redundant trigonometric calculations.
- Camera transforms use an unrolled 3×3 matrix, compact depth/color/glyph indexes, and one canvas instead of an offscreen full-size canvas and copying each frame.
- An atlas approach was measured but proved **slower** here, so the direct glyph renderer is retained.
- The **actual rotating taco's first frame draws synchronously** when the tiny inline script executes. No intentionally delayed start, pre-rendered image, fake progress timer, or separate background renderer.
- Cap to 24 frames/second; pause when hidden; respect reduced motion; release resources on scene-ready.

## Local benchmark (headless Chromium, not real-device guarantees)

1280×720 desktop: ~48 ms for renderer construction including its first draw. Four-times CPU throttling: ~153 ms. 390×844 mobile viewport emulation: ~42 ms. Median redraw in the non-throttled desktop test was ~5 ms. The file's renderer JS is ~11 KB uncompressed / ~5 KB gzip. Actual display time also depends on how soon the browser receives your HTML, system load, and other work on the main thread. These test numbers should **not** be interpreted as guaranteed first-contentful paint, particularly on real phones.

Use browser dev tools on the *complete portfolio* with mobile CPU/network throttling before shipping. The loader cannot render before its initial HTML and JavaScript arrive, but unlike v5, it has no separate dependency/network step of its own when using the Astro inline setup.

## API

`createAsciiTaco(canvas, {speed:0.42, initialAngle:-0.68, cellSize:1, reducedMotion:false})`

Returns `pause()`, `resume()`, `destroy()`, `setAngle(value)`, `setSpeed(value)`, and `getStats()`. Works from either the module source or the standalone HTML demo.
