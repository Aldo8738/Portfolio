export const flameVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const flameFragment = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  void main() {
    float y = vUv.y;
    float column = floor(vUv.x * 5.0);
    float sway = sin(y * 10.0 - time * 4.0 + column) * 0.1 * y;
    float x = fract(vUv.x * 5.0) + sway;
    float tongues = 0.78 + 0.12 * sin(column * 2.3 + time * 3.1)
      + 0.06 * sin(column * 4.7 - time * 4.3);
    float width = 0.5 * pow(max(0.0, 1.0 - y / tongues), 0.55);
    float edge = abs(x - 0.5);
    float alpha = (1.0 - smoothstep(width * 0.55, width + 0.015, edge))
      * (1.0 - smoothstep(tongues - 0.13, tongues, y))
      * smoothstep(0.0, 0.07, y);
    vec3 color = mix(vec3(1.0, 0.045, 0.003), vec3(1.0, 0.55, 0.08),
      (1.0 - y) * (1.0 - edge));
    gl_FragColor = vec4(color, alpha * 0.8);
    #include <colorspace_fragment>
  }
`;

export const smokeVertex = /* glsl */ `
  uniform float time;
  attribute float seed;
  attribute float atmosphere;
  varying vec2 vUv;
  varying float vAge;
  varying float vAtmosphere;
  varying vec3 vCenter;
  void main() {
    vUv = uv;
    vAtmosphere = atmosphere;
    float ground = step(1.5, atmosphere);
    float air = step(0.5, atmosphere) * (1.0 - ground);
    vAge = fract(seed + time * mix(0.17, 0.045, ground));
    vec4 center = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    center.y += mix(vAge * mix(0.85, 0.45, air), sin(time * 0.17 + seed * 19.0) * 0.03, ground);
    center.x += mix(sin(vAge * 5.0 + seed * 13.0) * 0.12 * vAge
      - vAge * mix(0.28, 0.65, air), sin(time * 0.13 + seed * 17.0) * 0.18, ground);
    center.z += mix(vAge * 0.35, sin(time * 0.1 + seed * 11.0) * 0.12, ground);
    vCenter = (modelMatrix * center).xyz;
    vec4 view = modelViewMatrix * center;
    float size = mix(mix(0.14, 0.45, air), mix(0.65, 1.5, air), vAge);
    size = mix(size, 2.3 + 0.25 * sin(seed * 17.0 + time * 0.1), ground);
    vec2 aspect = mix(vec2(mix(1.0, 1.5, air), mix(1.3, 0.65, air)), vec2(1.65, 0.65), ground);
    view.xy += position.xy * size * aspect;
    gl_Position = projectionMatrix * view;
  }
`;

export const smokeFragment = /* glsl */ `
  uniform vec3 firePosition;
  varying vec2 vUv;
  varying float vAge;
  varying float vAtmosphere;
  varying vec3 vCenter;
  void main() {
    vec2 p = vUv - 0.5;
    float ground = step(1.5, vAtmosphere);
    p.x += sin(vUv.y * 8.0 + vAge * 10.0) * 0.12;
    float soft = exp(-dot(p, p) * mix(20.0, 8.0, ground)) * (1.0 - smoothstep(0.28, 0.5, length(p)));
    float fade = smoothstep(0.0, 0.18, vAge) * (1.0 - smoothstep(0.35, 1.0, vAge));
    float wisps = 0.7 + 0.3 * sin(p.x * 13.0 + vAge * 7.0 + sin(p.y * 10.0) * 1.5);
    vec3 toFire = vCenter - firePosition;
    float fireGlow = 1.0 / (1.0 + dot(toFire, toFire) * 1.4);
    vec3 color = mix(vec3(0.15, 0.35, 0.43), vec3(1.0, 0.62, 0.28), fireGlow);
    vec2 toWarmFloor = vCenter.xz - (firePosition.xz + vec2(0.0, 2.6));
    float floorGlow = pow(1.0 / (1.0 + dot(toWarmFloor, toWarmFloor) * 0.55), 1.5);
    color = mix(color, mix(vec3(0.06, 0.15, 0.26), vec3(0.95, 0.35, 0.12), floorGlow), ground);
    float opacity = mix(mix(0.45, 0.35, clamp(vAtmosphere, 0.0, 1.0)), 0.65, ground);
    gl_FragColor = vec4(color, soft * fade * wisps * opacity);
    #include <colorspace_fragment>
  }
`;
