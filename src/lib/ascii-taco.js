/**
 * Taquería Aldo — fast rotating ASCII taco (v6)
 * Procedural open-shell 3D geometry, Canvas 2D, no 3D engine, no images.
 * Nothing is faked: the first visible frame uses the same renderer as all
 * subsequent frames. The model is stored directly in packed typed arrays.
 */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const GLYPHS = '=+*#%@$';
const PALETTE = [
  [
    '#582409',
    '#773007',
    '#99400a',
    '#bd5509',
    '#de7407',
    '#f6970b',
    '#ffb515',
    '#ffd342',
    '#ffe777',
    '#fff4bf',
  ],
  [
    '#4d1a0b',
    '#6b260b',
    '#88320e',
    '#ad4310',
    '#ca5610',
    '#e97513',
    '#f99b23',
    '#ffbd4a',
  ],
  ['#063f12', '#075c19', '#088523', '#18af28', '#42d831', '#91f43b', '#b7ff64'],
  ['#61030c', '#8b0710', '#b40816', '#dc101d', '#f6242a', '#ff5351'],
  ['#8b9990', '#b2bdb3', '#dbe7da', '#f8fff2', '#ffffff'],
];
const COLORS = PALETTE.flat();
const COLOR_OFFSETS = [0, 10, 18, 25, 31];
const SHELL = 0,
  MEAT = 1,
  GREEN = 2,
  SALSA = 3,
  ONION = 4;
function random(seed = 30101993) {
  return () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
}
function profile(u) {
  return Math.sqrt(Math.max(0, 1 - u * u));
}
function buildModel() {
  const rand = random();
  // x y z material shade glyphSeed
  // Packed typed arrays: no growing JS object array and no copying on first load.
  const MAX_POINTS = 65000;
  const xyz = new Float32Array(MAX_POINTS * 3);
  const color = new Uint8Array(MAX_POINTS);
  const glyph = new Uint8Array(MAX_POINTS);
  let count = 0;
  const put = (x, y, z, m, s) => {
    if (count >= MAX_POINTS)
      throw new Error('Taco geometry exceeded point budget');
    const off = count * 3;
    xyz[off] = x;
    xyz[off + 1] = y;
    xyz[off + 2] = z;
    color[count] =
      COLOR_OFFSETS[m] +
      Math.min(PALETTE[m].length - 1, Math.max(0, (s * PALETTE[m].length) | 0));
    glyph[count] = (rand() * 7) | 0;
    count++;
  };
  const length = 1.64,
    bottom = -0.91,
    height = 1.66;
  const rimY = (u) => bottom + height * Math.pow(profile(u), 0.92);
  // The two shell walls share a hinge at the bottom but open out toward the
  // top. They don't have an end cap, a front lid, or a solid back silhouette.
  // u follows the tortilla diameter, t travels from fold to scalloped rim.
  const shellZ = (u, t, side) => {
    const p = profile(u);
    const open = 0.11 + 0.69 * Math.sin(t * Math.PI * 0.5) * Math.pow(p, 0.66);
    const lowerBelly = 0.055 * (1 - Math.pow(t, 0.62)) * Math.pow(p, 0.9);
    return side * (open + lowerBelly);
  };
  const toasted = (x, t, side) => {
    const patches =
      0.31 *
        Math.sin(x * 7.1 + t * 13.7 + side * 2.9) *
        Math.cos(x * 13.1 - t * 8.9) +
      0.25 * Math.sin(x * 22.7 - t * 39.1) * Math.cos(x * 17.5 + t * 24.1);
    const spot = Math.max(
      0,
      0.68 * Math.sin(x * 36.5 + t * 53.7) * Math.cos(x * 23.3 - t * 40),
    );
    return 0.77 + patches * 0.72 - spot * 0.21 + (rand() - 0.5) * 0.19;
  };
  // The shell curves are identical at each longitudinal slice.
  // Precomputing them avoids thousands of trigonometric operations per start.
  const shellSteps = 86,
    shellSine = new Float32Array(shellSteps + 1);
  const shellBelly = new Float32Array(shellSteps + 1);
  for (let j = 0; j <= shellSteps; j++) {
    const t = j / shellSteps;
    shellSine[j] = Math.sin(t * Math.PI * 0.5);
    shellBelly[j] = 1 - Math.pow(t, 0.62);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i <= 112; i++) {
      const u = -0.999 + (1.998 * i) / 112,
        x = length * u,
        p = profile(u),
        top = rimY(u);
      const openingFactor = Math.pow(p, 0.66),
        bellyFactor = Math.pow(p, 0.9);
      for (let j = 0; j <= shellSteps; j++) {
        const t = j / shellSteps,
          y = mix(bottom, top, t);
        const z =
          side *
          (0.11 +
            0.69 * shellSine[j] * openingFactor +
            0.055 * shellBelly[j] * bellyFactor);
        const shade = toasted(x, t, side);
        if (rand() < 0.9) put(x, y, z, SHELL, shade);
        // This second layer is inside the open shell, not a solid end cap.
        if (rand() < 0.23)
          put(x, y, z - side * 0.048, SHELL, 0.76 + shade * 0.22);
      }
    }
    // Crisp, narrow rim running along the top of each open flap.
    for (let i = 0; i < 1600; i++) {
      const u = (rand() * 2 - 1) * 0.997,
        x = u * length,
        y = rimY(u) + (rand() - 0.5) * 0.027;
      const z = shellZ(u, 1, side) + (rand() - 0.5) * 0.034;
      put(x, y, z, SHELL, 0.83 + rand() * 0.17);
    }
  }
  // Smoothly folded bottom seam connecting the two tortilla sides.
  // Crucially, it is only a tiny rounded hinge along the bottom, not a slab.
  for (let i = 0; i < 2000; i++) {
    const u = rand() * 1.995 - 0.9975,
      theta = rand() * Math.PI;
    const x = length * u;
    const y = bottom + 0.015 - 0.04 * Math.sin(theta);
    const z = 0.155 * Math.cos(theta);
    put(x, y, z, SHELL, 0.43 + rand() * 0.35);
    if (rand() < 0.45)
      put(x, y + 0.012 * (rand() - 0.5), z * 0.78, SHELL, 0.4 + rand() * 0.28);
  }
  // Chunky carne, sitting INSIDE the V and reaching the open rim. Use little
  // individual ellipsoidal clusters so you see texture through the opening.
  for (let b = 0; b < 280; b++) {
    const u = (rand() * 2 - 1) * 0.94,
      p = profile(u),
      x = length * u;
    const z = (rand() * 2 - 1) * (0.6 * Math.pow(p, 0.62));
    const y = rimY(u) - 0.29 + rand() * 0.4;
    const radius = 0.055 + rand() * 0.13;
    for (let n = 0; n < 40; n++) {
      const longitude = TAU * rand(),
        h = rand() * 2 - 1,
        planar = Math.sqrt(1 - h * h);
      const dx = radius * Math.cos(longitude) * planar,
        dy = radius * 0.7 * h,
        dz = radius * Math.sin(longitude) * planar;
      put(x + dx, y + dy, z + dz, MEAT, 0.49 + rand() * 0.5);
    }
  }
  // Meat-filled central interior, visible between shell edges from end-on.
  // All of these points live in the cavity, not projected on the outer wall.
  for (let n = 0; n < 4500; n++) {
    const u = (rand() * 2 - 1) * 0.965,
      h = profile(u),
      x = length * u;
    const y = bottom + height * h * (0.7 + rand() * 0.3);
    const z =
      (rand() * 2 - 1) *
      (0.08 + (0.58 * (y - bottom)) / Math.max(0.12, height * h)) *
      Math.pow(h, 0.52);
    const t = rand();
    const m = t > 0.81 ? GREEN : t > 0.71 ? SALSA : t > 0.66 ? ONION : MEAT;
    put(x, y, z, m, 0.48 + rand() * 0.52);
  }
  // Dense interior filler to prevent the black background from peeking through
  // the cavity at edge-on and quarter-turn views. This lives fully inside the
  // shell and acts like volume/occlusion rather than outer garnish.
  for (let n = 0; n < 4200; n++) {
    const u = (rand() * 2 - 1) * 0.93,
      h = profile(u),
      x = length * u;
    const y = bottom + 0.1 + height * h * (0.4 + rand() * 0.42);
    const z = (rand() * 2 - 1) * (0.2 + 0.34 * Math.pow(h, 0.55));
    const t = rand();
    const m = t > 0.9 ? GREEN : t > 0.84 ? SALSA : t > 0.77 ? ONION : MEAT;
    put(x, y, z, m, 0.5 + rand() * 0.46);
  }
  // Irregular cilantro leaf clusters, salsa cubes and tiny white onion bits.
  // A raised garnish crest remains visible over BOTH shell flaps at every yaw.
  for (let b = 0; b < 290; b++) {
    const u = (rand() * 2 - 1) * 0.93,
      p = profile(u),
      x = length * u;
    const z = (rand() * 2 - 1) * (0.6 * Math.pow(p, 0.56)),
      y = rimY(u) - 0.06 + rand() * 0.27;
    const isLeaf = b < 150,
      isSalsa = b >= 150 && b < 245;
    const m = isLeaf ? GREEN : isSalsa ? SALSA : ONION;
    const rad = isLeaf
      ? 0.055 + rand() * 0.09
      : isSalsa
        ? 0.033 + rand() * 0.055
        : 0.026 + rand() * 0.042;
    const count = isLeaf ? 35 : isSalsa ? 38 : 41;
    for (let n = 0; n < count; n++) {
      const theta = rand() * TAU,
        r = Math.sqrt(rand()) * rad;
      const dx = r * Math.cos(theta) * 1.27,
        dz = r * Math.sin(theta) * 1.12;
      const dy = (rand() - 0.48) * rad * 0.88 + (isLeaf ? 0.035 : 0);
      put(x + dx, y + dy, z + dz, m, 0.62 + rand() * 0.38);
    }
  }
  return {
    xyz: xyz.subarray(0, count * 3),
    color: color.subarray(0, count),
    glyph: glyph.subarray(0, count),
    count,
  };
}

let MODEL;
function getModel() {
  return MODEL ?? (MODEL = buildModel());
}
const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Starts on creation; call destroy() when the 3D scene is ready. */
export function createAsciiTaco(canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement))
    throw new Error('Expected canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D not available');
  const model = getModel(),
    xyz = model.xyz,
    colors = model.color,
    glyphs = model.glyph;
  const reduced = options.reducedMotion ?? reduceMotion();
  let speed = options.speed ?? 0.42,
    angle = options.initialAngle ?? -0.68;
  const cellScale = clamp(options.cellSize ?? 1, 0.65, 1.55);
  let width = 0,
    height = 0,
    dpr = 1,
    cellW = 5,
    cellH = 6,
    cols = 1,
    rows = 1;
  let playing = true,
    raf = 0,
    last = 0,
    lastPaint = 0,
    observer;
  let winners = new Int32Array(1),
    depths = new Float32Array(1);
  // Fixed camera rotations can be precomputed outside the inner point loop.
  const cp = Math.cos(0.29),
    sp = Math.sin(0.29),
    cr = Math.cos(-0.045),
    sr = Math.sin(-0.045);
  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    winners.fill(-1);
    depths.fill(-Infinity);
    const ca = Math.cos(angle),
      sa = Math.sin(angle);
    // Unroll the complete 3D rotation into a single 3x3 matrix.
    const m00 = cr * ca - sr * sp * sa,
      m01 = -sr * cp,
      m02 = -cr * sa - sr * sp * ca;
    const m10 = sr * ca + cr * sp * sa,
      m11 = cr * cp,
      m12 = -sr * sa + cr * sp * ca;
    const m20 = cp * sa,
      m21 = sp,
      m22 = cp * ca;
    const size = Math.min(width / 4.35, height / 3.3);
    const cx = width * 0.5,
      cy = height * 0.515;
    const invW = 1 / cellW,
      invH = 1 / cellH;
    for (let i = 0, j = 0; i < model.count; i++, j += 3) {
      const x = xyz[j],
        y = xyz[j + 1],
        z = xyz[j + 2];
      const depth = m20 * x + m21 * y + m22 * z;
      const pers = 1 / (1 - depth * 0.055);
      const X = m00 * x + m01 * y + m02 * z;
      const Y = m10 * x + m11 * y + m12 * z;
      const col = ((cx + X * size * pers) * invW) | 0,
        row = ((cy - Y * size * pers) * invH) | 0;
      if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
      const slot = row * cols + col;
      if (depth > depths[slot]) {
        depths[slot] = depth;
        winners[slot] = i;
      }
    }
    let previous = -1;
    for (let i = 0; i < winners.length; i++) {
      const n = winners[i];
      if (n === -1) continue;
      const c = colors[n];
      if (c !== previous) {
        ctx.fillStyle = COLORS[c];
        previous = c;
      }
      ctx.fillText(
        GLYPHS[glyphs[n]],
        ((i % cols) + 0.5) * cellW,
        (((i / cols) | 0) + 0.5) * cellH,
      );
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width)),
      h = Math.max(1, Math.round(rect.height));
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    if (w === width && h === height && pixelRatio === dpr) return;
    width = w;
    height = h;
    dpr = pixelRatio;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cellW = clamp(width / 198, 3, 6) * cellScale;
    cellH = cellW * 1.24;
    cols = Math.ceil(width / cellW);
    rows = Math.ceil(height / cellH);
    winners = new Int32Array(cols * rows);
    depths = new Float32Array(cols * rows);
    ctx.font = `700 ${Math.round(cellH * 1.27)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    draw();
  }
  function tick(now) {
    if (!playing) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    if (!reduced) angle += dt * speed;
    if (now - lastPaint >= 1000 / 24) {
      draw();
      lastPaint = now;
    }
    if (!reduced) raf = requestAnimationFrame(tick);
  }
  // Draw synchronously the first time, so there's no intentional delay.
  resize();
  lastPaint = performance.now();
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
  } else window.addEventListener('resize', resize);
  if (!reduced) raf = requestAnimationFrame(tick);
  return {
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
    },
    resume() {
      if (playing || reduced) return;
      playing = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    },
    destroy() {
      playing = false;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
    },
    setSpeed(v) {
      if (Number.isFinite(+v)) speed = +v;
    },
    setAngle(v) {
      angle = Number(v) || 0;
      draw();
    },
    getStats() {
      return {
        points: model.count,
        cells: cols * rows,
        canvas: { width, height, dpr },
      };
    },
  };
}
