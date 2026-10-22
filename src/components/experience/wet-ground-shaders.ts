export const wetGroundVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// shortcut: analytic light pools suit blurred wet ground; profile planar reflections if mirrored model detail becomes necessary.
export const wetGroundFragment = /* glsl */ `
  uniform vec3 firePosition;
  varying vec3 vWorld;
  float grainHash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float concreteNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(grainHash(cell), grainHash(cell + vec2(1.0, 0.0)), f.x),
      mix(grainHash(cell + vec2(0.0, 1.0)), grainHash(cell + vec2(1.0)), f.x), f.y);
  }
  void main() {
    vec2 p = vWorld.xz;
    float fade = 1.0 - smoothstep(6.0, 12.0, length(p));
    if (fade < 0.001) discard;
    float aggregate = concreteNoise(p * 4.0);
    float wet = smoothstep(0.35, 0.7, concreteNoise(p * 0.7) * 0.75 + aggregate * 0.25);
    float grain = mix(0.5, grainHash(floor(p * 220.0)),
      1.0 - smoothstep(0.012, 0.035, length(fwidth(p))));
    vec3 normal = vec3(0.0, 1.0, 0.0);
    vec3 view = normalize(cameraPosition - vWorld);
    vec3 toFire = firePosition - vWorld;
    vec3 halfFire = normalize(normalize(toFire) + view);
    float warmSpecular = pow(max(dot(normal, halfFire), 0.0), mix(18.0, 55.0, wet))
      * mix(0.08, 0.65, wet) / (1.0 + dot(toFire, toFire) * 0.2);
    vec3 halfCool = normalize(normalize(vec3(3.0, 4.0, -4.0)) + view);
    float coolSpecular = pow(max(dot(normal, halfCool), 0.0), 35.0) * wet * 0.06;
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0);
    vec2 reflection = p - (firePosition.xz + vec2(0.0, 3.2));
    float warmPool = exp(-reflection.x * reflection.x * 0.5
      - reflection.y * reflection.y * 0.45) * wet * (0.75 + aggregate * 0.25);
    vec3 color = vec3(0.018, 0.023, 0.03) * (0.94 + aggregate * 0.08 + grain * 0.015)
      * (1.0 - wet * 0.25);
    color += vec3(0.008, 0.015, 0.025) * wet * (0.3 + fresnel);
    color += vec3(0.12, 0.3, 0.48) * coolSpecular;
    color += vec3(1.0, 0.32, 0.06) * (warmSpecular + warmPool * 0.14);
    float contact = (1.0 - smoothstep(2.8, 3.6, abs(p.x)))
      * (1.0 - smoothstep(1.8, 2.5, abs(p.y)));
    color *= 1.0 - contact * 0.65;
    gl_FragColor = vec4(color, fade * 0.92);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
