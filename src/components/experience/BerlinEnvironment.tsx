import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei/core/Texture.js';
import { BackSide, SRGBColorSpace } from 'three';
import { useSceneTheme } from './useSceneTheme';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = vec2(1.0 - uv.x, uv.y);
    // Keep scenery at infinity while retaining the camera's real orientation.
    vec4 clip = projectionMatrix * mat4(mat3(viewMatrix)) * modelMatrix * vec4(position, 1.0);
    gl_Position = clip.xyww;
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D panorama;
  uniform bool synthwave;
  varying vec2 vUv;
  void main() {
    // The new artwork's horizon is at y=1215/2048, below its equator.
    // Shift it up 36 degrees so downward views sample its dark ground.
    // Compress skyline height by 28% around its raised horizon; preserve the 360° seam.
    float horizon = 1.0 - 1215.0 / 2048.0;
    float panoramaY = horizon + (vUv.y - 0.20 - horizon) / 0.72;
    vec2 panoramaUv = vec2(vUv.x, clamp(panoramaY, 0.0, 1.0));
    gl_FragColor = texture2D(panorama, panoramaUv);
    // Soften and dim the city without lifting the foreground's black levels.
    float city = 1.0 - smoothstep(horizon + 0.03, horizon + 0.20, panoramaUv.y);
    vec3 distantCity = mix(gl_FragColor.rgb * 0.55, vec3(0.025, 0.05, 0.08), 0.12);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, distantCity, city);
    if (synthwave) {
      float haze = exp(-pow((panoramaUv.y - horizon - 0.035) / 0.16, 2.0));
      float silhouette = smoothstep(0.025, 0.13, max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)));
      gl_FragColor.rgb *= vec3(0.85, 0.65, 1.08);
      gl_FragColor.rgb += vec3(0.12, 0.012, 0.085) * haze * mix(0.2, 1.0, silhouette);
    }
    #include <colorspace_fragment>
  }
`;

export function BerlinEnvironment() {
  const synthwave = useSceneTheme() === 'synthwave';
  const panorama = useTexture('/images/berlin-blue-hour-360-v2.svg');
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    panorama.colorSpace = SRGBColorSpace;
    panorama.needsUpdate = true;
    invalidate();
  }, [panorama, invalidate]);
  return (
    <mesh
      name="BERLIN_ENVIRONMENT"
      rotation={[0, Math.PI / 2 + Math.atan(0.55), 0]}
      renderOrder={-1000}
      frustumCulled={false}
      raycast={() => {}}
    >
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        uniforms={{
          panorama: { value: panorama },
          synthwave: { value: synthwave },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
