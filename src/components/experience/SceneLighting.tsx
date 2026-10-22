import { useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import {
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  Vector3,
  type Object3D,
} from 'three';
import type { SceneQuality } from './scene-quality';

const bulbNames = [
  'LIGHT_0_glowing_bulb',
  'LIGHT_1_glowing_bulb',
  'LIGHT_2_glowing_bulb',
] as const;

export function SceneLighting({
  scene,
  quality,
}: {
  scene: Object3D;
  quality: SceneQuality;
}) {
  const key = useRef<DirectionalLight>(null);
  const { gl, invalidate } = useThree();
  const bulbs = useMemo(
    () =>
      bulbNames.map((name) => {
        const bulb = scene.getObjectByName(name);
        if (!bulb) throw new Error(`Required practical lamp missing: ${name}`);
        return {
          name,
          position: bulb
            .getWorldPosition(new Vector3())
            .add(new Vector3(0, -0.06, 0.02)),
        };
      }),
    [scene],
  );
  useLayoutEffect(() => {
    const originals: { mesh: Mesh; cast: boolean; receive: boolean }[] = [];
    scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      originals.push({
        mesh: node,
        cast: node.castShadow,
        receive: node.receiveShadow,
      });
      let animated = false;
      for (
        let ancestor: Object3D | null = node;
        ancestor;
        ancestor = ancestor.parent
      )
        if (ancestor.name === 'TROMPO_ROTATING') animated = true;
      const materials = Array.isArray(node.material)
        ? node.material
        : [node.material];
      node.castShadow =
        !animated &&
        !materials.some(
          (material) =>
            material.transparent ||
            (material instanceof MeshPhysicalMaterial &&
              material.transmission > 0) ||
            material.name === '28 · pendant amber filament.009',
        );
      node.receiveShadow = true;
    });
    if (key.current) key.current.shadow.needsUpdate = true;
    gl.shadowMap.needsUpdate = true;
    invalidate();
    const refresh = () => {
      gl.shadowMap.needsUpdate = true;
      invalidate();
    };
    gl.domElement.addEventListener('webglcontextrestored', refresh);
    return () => {
      for (const { mesh, cast, receive } of originals) {
        mesh.castShadow = cast;
        mesh.receiveShadow = receive;
      }
      gl.domElement.removeEventListener('webglcontextrestored', refresh);
    };
  }, [scene, quality, gl, invalidate]);
  return (
    <>
      <hemisphereLight args={['#9dbbd0', '#2a171e', 0.4]} />
      <directionalLight
        ref={key}
        position={[-3.5, 7, 5]}
        color="#ffe3bf"
        intensity={2}
        castShadow
        shadow-mapSize={[quality.shadowSize, quality.shadowSize]}
        shadow-camera-left={-5.2}
        shadow-camera-right={5.2}
        shadow-camera-top={5.2}
        shadow-camera-bottom={-5.2}
        shadow-camera-near={3}
        shadow-camera-far={15}
        shadow-bias={-0.0008}
        shadow-normalBias={0.02}
        shadow-radius={2}
      />
      <directionalLight position={[3, 4, -4]} color="#6aadc8" intensity={1.8} />
      {(quality.practicalLights === 3 ? bulbs : bulbs.slice(1, 2)).map(
        ({ name, position }, index) => (
          <pointLight
            key={name}
            position={position}
            color="#ffd09a"
            intensity={quality.practicalLights === 3 ? [6, 8, 5][index] : 13}
            distance={4.5}
            decay={2}
          />
        ),
      )}
    </>
  );
}
