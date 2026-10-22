import { useLayoutEffect } from 'react';
import {
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
} from 'three';

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
  '28 · pendant amber filament.009': { emissiveIntensity: 0.65 },
};

export function useModelMaterials(scene: Object3D, invalidate: () => void) {
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
          });
          owned.add(readable);
          return readable;
        }
        if (!(material instanceof MeshStandardMaterial)) return material;
        const adjustment = materialOverrides[material.name];
        const glass =
          material instanceof MeshPhysicalMaterial && material.transmission > 0;
        if (!adjustment && !glass) return material;
        let replacement = clones.get(material);
        if (!replacement) {
          const clone = material.clone();
          if (adjustment) Object.assign(clone, adjustment);
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
    };
  }, [scene, invalidate]);
}
