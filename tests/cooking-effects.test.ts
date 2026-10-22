import { expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh } from 'three';
import { getCookingPlacement } from '../src/lib/cooking-effects';

it('anchors heat behind the meat and smoke above the griddle without changing the model', () => {
  const scene = new Group();
  scene.position.set(2, 0, 1);
  const heater = new Mesh(new BoxGeometry(0.32, 0.78, 0.003));
  heater.name = 'KITCHEN_MERGED_MAT_24';
  heater.position.set(-0.12, 2.27, -0.947);
  const trompo = new Mesh(new BoxGeometry(0.55, 1.35, 0.55));
  trompo.name = 'TROMPO_ROTATING';
  trompo.position.set(-0.12, 2.36, -0.68);
  scene.add(heater, trompo);
  scene.updateWorldMatrix(true, true);
  const before = scene.toJSON();
  const placement = getCookingPlacement(scene);
  expect(placement).not.toBeNull();
  if (!placement) throw new Error('Missing cooking placement');
  expect(placement.flame.x).toBeCloseTo(1.88);
  expect(placement.flame.z).toBeLessThan(placement.smoke.z);
  expect(placement.smoke.y).toBeGreaterThan(trompo.position.y);
  expect(placement.stove.x).toBeCloseTo(0.92);
  expect(placement.stove.y).toBeCloseTo(1.78);
  expect(placement.stove.z).toBeCloseTo(0.32);
  expect(placement.haze.z).toBeGreaterThan(placement.stove.z);
  expect(placement.haze.y).toBeLessThan(placement.smoke.y);
  expect(placement.ground.every((point) => point.y < placement.stove.y)).toBe(
    true,
  );
  expect(placement.ground.some((point) => point.x < scene.position.x)).toBe(
    true,
  );
  expect(placement.ground.some((point) => point.x > scene.position.x)).toBe(
    true,
  );
  expect(scene.toJSON()).toEqual(before);
  heater.geometry.dispose();
  trompo.geometry.dispose();
});

it('omits the optional effect if its source nodes are unavailable', () => {
  expect(getCookingPlacement(new Group())).toBeNull();
});
