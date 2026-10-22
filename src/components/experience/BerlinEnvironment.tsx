import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei/core/Texture.js';
import { BackSide, SRGBColorSpace } from 'three';

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
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(panorama, vUv);
    // Draw the small crescent analytically so it stays smooth on the compact atlas.
    vec2 moon = (vUv - vec2(0.576875, 0.50225)) * vec2(2.0, 1.0);
    if (abs(moon.x) < 0.03 && abs(moon.y) < 0.03) {
      float edge = max(fwidth(length(moon)), 0.00005);
      float outer = 1.0 - smoothstep(0.00775 - edge, 0.00775 + edge, length(moon));
      float inner = 1.0 - smoothstep(0.0076 - edge, 0.0076 + edge,
        length(moon + vec2(0.0028, -0.0007)));
      float crescent = outer * (1.0 - inner);
      float glow = exp(-dot(moon, moon) * 14000.0) * 0.035;
      gl_FragColor.rgb += vec3(1.0, 0.58, 0.2) * (crescent + glow);
    }
    #include <colorspace_fragment>
  }
`;

export function BerlinEnvironment() {
  const panorama = useTexture('/images/berlin-panorama.svg');
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
        uniforms={{ panorama: { value: panorama } }}
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
