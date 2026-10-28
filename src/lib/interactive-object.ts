import type { Object3D } from 'three';
import { themes } from './theme';

const interactiveNames = new Set<string>([
  'CRT_INTERACTION',
  'SKETCHBOOK_INTERACTION',
  'AMP_INTERACTION',
  'POLAROID_0_SWING_PIVOT',
  'POLAROID_1_SWING_PIVOT',
  'POLAROID_2_SWING_PIVOT',
  ...themes.map((theme) => theme.node),
]);

export function isInteractiveObject(object: Object3D): boolean {
  for (let node: Object3D | null = object; node; node = node.parent)
    if (interactiveNames.has(node.name)) return true;
  return false;
}
