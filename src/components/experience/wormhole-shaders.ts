export const monitorTileVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = vec2(uv.x, 1.0 - uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const wormholeVertex = /* glsl */ `
  uniform vec2 corners[4];
  uniform float expansion;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec2 screen = mix(mix(corners[0], corners[1], uv.x),
                      mix(corners[2], corners[3], uv.x), uv.y);
    gl_Position = vec4(mix(screen, position.xy, expansion), 0.0, 1.0);
  }
`;

export const wormholeFragment = /* glsl */ `
  uniform sampler2D originalScreen;
  uniform float activation;
  uniform float portalOpacity;
  uniform float expansion;
  uniform float travel;
  uniform float decomposition;
  uniform float reveal;
  uniform float aspect;
  uniform float screenAspect;
  uniform float columns;
  uniform float subdivisions;
  uniform vec4 revealRegions[3];
  uniform vec3 navy;
  uniform vec3 blue;
  uniform vec3 cream;
  uniform vec3 terracotta;
  uniform vec3 magenta;
  uniform vec3 amber;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  mat2 rotate(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
  vec3 palette(float seed) {
    if (seed > 0.97) return amber;
    if (seed > 0.92) return magenta;
    if (seed > 0.75) return terracotta;
    return mix(cream, blue, step(0.5, seed));
  }
  vec3 mosaic(vec2 p, float breakup) {
    vec2 cell = floor(p);
    vec2 local = fract(p) - 0.5;
    float seed = hash(cell);
    float edge = max(fwidth(p.x), fwidth(p.y));
    float diamond = 1.0 - smoothstep(0.44 - edge, 0.44 + edge, abs(local.x) + abs(local.y));
    // Fragments inherit their parent diamond and palette before becoming square pixels.
    vec2 sub = floor(p * subdivisions);
    vec2 center = (sub + 0.5) / subdivisions - cell - 0.5;
    float parent = 1.0 - step(0.46, abs(center.x) + abs(center.y));
    vec2 fragment = abs(fract(p * subdivisions) - 0.5);
    float squares = 1.0 - smoothstep(0.29, 0.44, max(fragment.x, fragment.y));
    float separate = smoothstep(0.18 + seed * 0.45, 0.5 + seed * 0.45, breakup);
    float pixels = squares * mix(parent, step(0.56, hash(sub)), smoothstep(0.75, 1.0, breakup));
    float ink = mix(diamond, pixels, separate);
    float checker = mod(cell.x + cell.y, 2.0);
    float ribbon = 1.0 - step(1.0, mod(floor(cell.x / 3.0), 3.0));
    vec3 ceramic = mix(cream, blue, checker);
    if (mod(cell.x, 3.0) > 1.5) ceramic = mix(terracotta, cream, checker);
    vec3 color = mix(palette(seed) * 0.65, ceramic, ribbon * (1.0 - breakup * 0.25));
    // Shallow ceramic bevels and selective warm rims add depth without postprocessing.
    float bevel = smoothstep(0.31, 0.44, abs(local.x) + abs(local.y));
    float light = 0.8 + 0.22 * (local.y - local.x) + seed * 0.12;
    color *= light * (1.0 - bevel * 0.23);
    color += amber * bevel * max(0.0, local.y - local.x) * 0.22;
    ink *= mix(0.12 + step(0.93, seed) * 0.7, 1.0, ribbon);
    float line = 1.0 - smoothstep(0.0, 0.018, min(0.5 - abs(local.x), 0.5 - abs(local.y)));
    return mix(navy + amber * line * 0.16, color, ink);
  }
  float layoutSweep(vec2 point, vec4 bounds, float start) {
    vec2 outside = max(max(bounds.xy - point, point - bounds.zw), vec2(0.0));
    float distance = length(outside * vec2(aspect, 1.0));
    float across = clamp((point.x - bounds.x) / max(0.05, bounds.z - bounds.x), 0.0, 1.0);
    return start + across * 0.18 + distance * 0.7;
  }
  void main() {
    float displayAspect = mix(screenAspect, aspect, expansion);
    #ifdef MONITOR_SURFACE
      displayAspect = screenAspect;
    #endif
    vec2 p = (vUv - 0.5) * vec2(displayAspect, 1.0);
    float flight = smoothstep(0.0, 0.18, travel);
    float rotation = activation * 0.15 + travel * 1.5;
    vec2 spinning = rotate(rotation) * p;
    float radius = max(length(spinning), 0.035);
    float angle = atan(spinning.y, spinning.x) / 6.2831853;
    vec2 planar = spinning * 9.0;
    vec2 tunnel = vec2(angle * 24.0, 0.8 / radius - travel * 14.0);
    vec2 coordinates = mix(planar, tunnel, flight);
    float breakup = smoothstep(0.1, 0.95, decomposition);
    vec3 tiles = mosaic(coordinates, breakup);
    float distanceShade = mix(1.0, smoothstep(0.025, 0.32, radius), flight);
    tiles = mix(navy, tiles, distanceShade);
    float illumination = pow(max(0.0, cos(angle * 6.2831853 - 0.6)), 8.0);
    tiles *= 0.87 + illumination * 0.45 * flight;
    float core = 1.0 - smoothstep(0.025, 0.045, abs(spinning.x) + abs(spinning.y));
    tiles += amber * core * flight * (1.0 - decomposition) * 0.7;
    // Crossfade intact fragments into a square screen grid; never stretch final pixels.
    vec2 flatGrid = p * columns;
    vec2 pixel = floor(flatGrid);
    float seed = hash(pixel);
    vec2 local = abs(fract(flatGrid) - 0.5);
    float square = 1.0 - smoothstep(0.37, 0.49, max(local.x, local.y));
    float parentSeed = hash(floor(pixel / subdivisions));
    vec3 field = mix(navy, palette(parentSeed) * (0.6 + seed * 0.4), square * step(0.56, seed));
    vec3 color = mix(tiles, field, smoothstep(0.65, 1.0, decomposition));
    // Quantize the real UI's reveal sweeps to this pixel grid, rather than random holes.
    vec2 point = vec2((pixel.x + 0.5) / columns / displayAspect + 0.5,
                     0.5 - (pixel.y + 0.5) / columns);
    float threshold = min(layoutSweep(point, revealRegions[0], 0.07),
                          layoutSweep(point, revealRegions[1], 0.16));
    threshold = min(threshold, layoutSweep(point, revealRegions[2], 0.3));
    threshold = min(threshold, 0.56 + point.y * 0.25 + point.x * 0.08);
    float alpha = 1.0 - smoothstep(threshold, threshold + 0.08, reveal);
    #ifdef MONITOR_SURFACE
      color = mix(texture2D(originalScreen, vec2(vUv.x, 1.0 - vUv.y)).rgb, color, activation);
      alpha = 1.0;
    #else
      alpha *= portalOpacity;
    #endif
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;
