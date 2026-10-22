import { Box3, Vector3, type Object3D } from 'three';

export function getCookingPlacement(scene: Object3D) {
  const heater = scene.getObjectByName('KITCHEN_MERGED_MAT_24');
  const trompo = scene.getObjectByName('TROMPO_ROTATING');
  if (!heater || !trompo) return null;
  scene.updateWorldMatrix(true, true);
  const heaterBounds = new Box3().setFromObject(heater);
  const meatBounds = new Box3().setFromObject(trompo);
  const flame = heaterBounds.getCenter(new Vector3());
  flame.z = heaterBounds.max.z + 0.02;
  const smoke = meatBounds.getCenter(new Vector3());
  smoke.x = meatBounds.max.x - 0.02;
  smoke.y = meatBounds.max.y - 0.45;
  smoke.z = meatBounds.max.z + 0.04;
  return {
    flame,
    fireLight: flame.clone().add(new Vector3(0.38, 0.08, 0.22)),
    smoke,
    // The griddle is merged with other kitchen surfaces in the frozen asset.
    stove: scene.localToWorld(new Vector3(-1.08, 1.78, -0.68)),
    haze: scene.localToWorld(new Vector3(-1.15, 2.2, 0.25)),
    ground: [
      new Vector3(-2.8, 0.22, 0.4),
      new Vector3(-0.75, 0.18, 2.15),
      new Vector3(2.8, 0.22, 0.6),
      new Vector3(1, 0.18, 2.15),
    ].map((point) => scene.localToWorld(point)),
  };
}
