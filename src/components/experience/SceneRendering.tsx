import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { BasicShadowMap, Mesh, PCFShadowMap } from 'three';
import type { SceneQuality } from './scene-quality';
import { useSceneTheme } from './useSceneTheme';

export function SceneRendering({ quality }: { quality: SceneQuality }) {
  const theme = useSceneTheme();
  const { gl, scene, invalidate, setDpr, viewport } = useThree();
  useLayoutEffect(() => {
    setDpr(Math.min(viewport.initialDpr, quality.maxDpr));
    const shadowType =
      quality.name === 'standard' ? PCFShadowMap : BasicShadowMap;
    if (gl.shadowMap.type !== shadowType) {
      gl.shadowMap.type = shadowType;
      gl.shadowMap.needsUpdate = true;
      scene.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material])
          material.needsUpdate = true;
      });
      invalidate();
    }
  }, [quality, viewport.initialDpr, setDpr, gl, scene, invalidate]);
  return (
    <fogExp2
      attach="fog"
      args={[theme === 'synthwave' ? '#211932' : '#14243b', 0.035]}
    />
  );
}
