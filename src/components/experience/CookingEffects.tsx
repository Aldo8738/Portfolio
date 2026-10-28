import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  InstancedMesh,
  Matrix4,
  UniformsLib,
  UniformsUtils,
  Vector3,
  type Object3D,
  type ShaderMaterial,
} from 'three';
import { getCookingPlacement } from '../../lib/cooking-effects';
import type { SceneQuality } from './scene-quality';
import {
  flameFragment,
  flameVertex,
  smokeFragment,
  smokeVertex,
} from './cooking-shaders';
import { wetGroundFragment, wetGroundVertex } from './wet-ground-shaders';
import { useSceneTheme } from './useSceneTheme';

const ignoreRaycast = () => {};

export function CookingEffects({
  scene,
  quality,
  active,
  sceneRevealed,
  reducedMotion,
}: {
  scene: Object3D;
  quality: SceneQuality;
  active: boolean;
  sceneRevealed: boolean;
  reducedMotion: boolean;
}) {
  const placement = useMemo(() => getCookingPlacement(scene), [scene]);
  const synthwave = useSceneTheme() === 'synthwave';
  const count = quality.name === 'standard' ? 8 : 6;
  const seeds = useMemo(
    () =>
      Float32Array.from({ length: count }, (_, i) => (i * 0.61803398875) % 1),
    [count],
  );
  const atmosphere = useMemo(() => new Float32Array(count), [count]);
  const uniforms = useMemo(
    () => ({
      ...UniformsUtils.clone(UniformsLib.fog),
      time: { value: 0 },
      synthwave: { value: synthwave },
      firePosition: { value: placement?.fireLight ?? new Vector3() },
    }),
    [placement, synthwave],
  );
  const smoke = useRef<InstancedMesh>(null);
  const flameMaterial = useRef<ShaderMaterial>(null);
  const smokeMaterial = useRef<ShaderMaterial>(null);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    if (!placement || !smoke.current) return;
    const matrix = new Matrix4();
    for (let i = 0; i < count; i++) {
      const source = i < count / 2 ? placement.smoke : placement.stove;
      smoke.current.setMatrixAt(
        i,
        matrix.makeTranslation(source.x, source.y, source.z),
      );
    }
    smoke.current.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [placement, count, invalidate]);
  useFrame((_, delta) => {
    if (!active || !sceneRevealed || reducedMotion) return;
    uniforms.time.value += Math.min(delta, 0.05);
    // Fiber preserves its own uniform wrappers; update the mounted materials.
    const flameTime = flameMaterial.current?.uniforms.time;
    const smokeTime = smokeMaterial.current?.uniforms.time;
    if (flameTime) flameTime.value = uniforms.time.value;
    if (smokeTime) smokeTime.value = uniforms.time.value;
  });
  if (!placement) return null;
  return (
    <group name="COOKING_EFFECTS">
      <mesh
        name="WET_GROUND"
        position={[0, -0.035, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-1}
        raycast={ignoreRaycast}
      >
        <planeGeometry args={[40, 40]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={wetGroundVertex}
          fragmentShader={wetGroundFragment}
          fog
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh
        name="TROMPO_FLAME"
        position={placement.flame}
        raycast={ignoreRaycast}
      >
        <planeGeometry args={[0.9, 0.92]} />
        <shaderMaterial
          ref={flameMaterial}
          uniforms={uniforms}
          vertexShader={flameVertex}
          fragmentShader={flameFragment}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <instancedMesh
        key={count}
        name="COOKING_SMOKE"
        ref={smoke}
        args={[undefined, undefined, count]}
        frustumCulled={false}
        raycast={ignoreRaycast}
      >
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute
            attach="attributes-seed"
            args={[seeds, 1]}
          />
          <instancedBufferAttribute
            attach="attributes-atmosphere"
            args={[atmosphere, 1]}
          />
        </planeGeometry>
        <shaderMaterial
          ref={smokeMaterial}
          uniforms={uniforms}
          vertexShader={smokeVertex}
          fragmentShader={smokeFragment}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
