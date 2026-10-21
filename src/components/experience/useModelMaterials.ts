import { useLayoutEffect } from 'react';
import {
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
} from 'three';

export function useModelMaterials(
  scene: Object3D,
  lowQuality: boolean,
  invalidate: () => void,
) {
  useLayoutEffect(() => {
    const restored: { mesh: Mesh; material: Material | Material[] }[] = [];
    const owned = new Set<Material>();
    const glass = new Map<Material, Material>();
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
        if (
          !lowQuality ||
          !(material instanceof MeshPhysicalMaterial) ||
          material.transmission === 0
        )
          return material;
        let simplified = glass.get(material);
        if (!simplified) {
          const clone = material.clone();
          // Mobile glass approximation avoids re-rendering the entire stand for refraction.
          clone.transmission = 0;
          clone.transparent = true;
          clone.opacity = 0.6;
          clone.depthWrite = false;
          simplified = clone;
          glass.set(material, clone);
          owned.add(clone);
        }
        return simplified;
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
  }, [scene, lowQuality, invalidate]);
}
