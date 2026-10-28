import { useLayoutEffect, useRef } from 'react';
import {
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
} from 'three';
import { useSceneTheme } from './useSceneTheme';

const synthwaveOverrides: Readonly<
  Record<
    string,
    { color: string; emissive?: string; intensity?: number; roughness?: number }
  >
> = {
  '01 · midnight navy enamel.009': { color: '#241342', roughness: 0.3 },
  '02 · rich cobalt blue.009': { color: '#923dcc', roughness: 0.3 },
  '07 · honey brass trim.009': {
    color: '#ff65c8',
    emissive: '#ff149b',
    intensity: 0.65,
    roughness: 0.28,
  },
  '10 · sign ivory.009': {
    color: '#ffe4f6',
    emissive: '#ff6acb',
    intensity: 0.4,
  },
  '13 · rich magenta awning.009': { color: '#d51a94', roughness: 0.48 },
  '14 · awning folds in shadow.009': { color: '#58134c' },
  '15 · electric pink edge.009': {
    color: '#ff68d3',
    emissive: '#ff219f',
    intensity: 0.85,
  },
  'WORK | glossy cobalt monitor bezel.008': {
    color: '#762caa',
    emissive: '#b71bff',
    intensity: 0.25,
    roughness: 0.25,
  },
  'MUSIC | lacquered magenta pedal.008': {
    color: '#ef26b0',
    emissive: '#ff149b',
    intensity: 0.25,
  },
};

const materialOverrides: Readonly<
  Record<
    string,
    { roughness?: number; metalness?: number; emissiveIntensity?: number }
  >
> = {
  '05 · cool brushed stainless.009': { roughness: 0.38, metalness: 0.55 },
  '07 · honey brass trim.009': { roughness: 0.36, metalness: 0.55 },
  '08 · hammered copper.009': { metalness: 0.4 },
  '01 · midnight navy enamel.009': { roughness: 0.38, metalness: 0.22 },
  'WORK | glossy cobalt monitor bezel.008': { roughness: 0.32 },
  '28 · pendant amber filament.009': { emissiveIntensity: 1.6 },
};

export function useModelMaterials(scene: Object3D, invalidate: () => void) {
  const synthwave = useSceneTheme() === 'synthwave';
  const themed = useRef<
    {
      material: MeshStandardMaterial;
      color: MeshStandardMaterial['color'];
      emissive: MeshStandardMaterial['emissive'];
      emissiveIntensity: number;
      roughness: number;
    }[]
  >([]);
  useLayoutEffect(() => {
    const restored: { mesh: Mesh; material: Material | Material[] }[] = [];
    const owned = new Set<Material>();
    const clones = new Map<Material, Material>();
    scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const original = node.material;
      const replace = (material: Material) => {
        if (
          node.name === 'HIT_WORK_CRT_SCREEN' &&
          material instanceof MeshStandardMaterial
        ) {
          const readable = new MeshBasicMaterial({
            map: material.map,
            toneMapped: false,
            fog: false,
          });
          owned.add(readable);
          return readable;
        }
        if (!(material instanceof MeshStandardMaterial)) return material;
        const adjustment = materialOverrides[material.name];
        const glass =
          material instanceof MeshPhysicalMaterial && material.transmission > 0;
        let replacement = clones.get(material);
        if (!replacement) {
          const clone = material.clone();
          // Keep the entrance crisp; haze belongs to the ground and distant city.
          clone.fog = false;
          if (adjustment) Object.assign(clone, adjustment);
          if (synthwaveOverrides[material.name]) {
            themed.current.push({
              material: clone,
              color: clone.color.clone(),
              emissive: clone.emissive.clone(),
              emissiveIntensity: clone.emissiveIntensity,
              roughness: clone.roughness,
            });
          }
          if (glass && clone instanceof MeshPhysicalMaterial) {
            // The two small bottle layers do not justify a second full-scene refraction pass.
            clone.transmission = 0;
            clone.transparent = true;
            clone.opacity =
              material.name === '18b · clear bottle glass.006' ? 0.28 : 0.9;
            clone.depthWrite = false;
          }
          replacement = clone;
          clones.set(material, clone);
          owned.add(clone);
        }
        return replacement;
      };
      const replacement = Array.isArray(original)
        ? original.map(replace)
        : replace(original);
      restored.push({ mesh: node, material: original });
      node.material = replacement;
    });
    invalidate();
    return () => {
      for (const { mesh, material } of restored) mesh.material = material;
      for (const material of owned) material.dispose();
      themed.current = [];
    };
  }, [scene, invalidate]);

  useLayoutEffect(() => {
    // Theme changes only update uniforms; keep GPU programs and materials alive.
    for (const baseline of themed.current) {
      const { material } = baseline;
      material.color.copy(baseline.color);
      material.emissive.copy(baseline.emissive);
      material.emissiveIntensity = baseline.emissiveIntensity;
      material.roughness = baseline.roughness;
      const neon = synthwave ? synthwaveOverrides[material.name] : undefined;
      if (!neon) continue;
      material.color.set(neon.color);
      if (neon.roughness !== undefined) material.roughness = neon.roughness;
      if (neon.emissive) {
        material.emissive.set(neon.emissive);
        material.emissiveIntensity = neon.intensity ?? 0;
      }
    }
    invalidate();
  }, [scene, invalidate, synthwave]);
}
