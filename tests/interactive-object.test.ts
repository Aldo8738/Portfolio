import { expect, it } from 'vitest';
import { Object3D } from 'three';
import { isInteractiveObject } from '../src/lib/interactive-object';

it.each([
  'CRT_INTERACTION',
  'SKETCHBOOK_INTERACTION',
  'AMP_INTERACTION',
  'POLAROID_0_SWING_PIVOT',
  'POLAROID_1_SWING_PIVOT',
  'POLAROID_2_SWING_PIVOT',
  'SALSA_RED_PIVOT',
  'SALSA_GREEN_PIVOT',
  'SALSA_ORANGE_PIVOT',
])('recognizes descendants of %s as interactive', (name) => {
  const group = new Object3D();
  group.name = name;
  const mesh = new Object3D();
  group.add(mesh);
  expect(isInteractiveObject(mesh)).toBe(true);
});

it('keeps decorative objects and the shared photo rail noninteractive', () => {
  const rail = new Object3D();
  rail.name = 'POLAROIDS';
  const decoration = new Object3D();
  rail.add(decoration);
  expect(isInteractiveObject(decoration)).toBe(false);
});
