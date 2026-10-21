import { Box3, MathUtils, Vector3 } from 'three';

export function fitCamera(bounds: Box3, aspect: number, fov: number) {
  const center = bounds.getCenter(new Vector3());
  const direction = new Vector3(aspect < 1 ? 0.06 : 0.26, 0.18, 1).normalize();
  const right = new Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right).normalize();
  const tanY = Math.tan(MathUtils.degToRad(fov / 2));
  const tanX = tanY * Math.max(aspect, 0.1);
  let distance = 0;
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z).sub(center);
        distance = Math.max(
          distance,
          corner.dot(direction) +
            Math.max(
              Math.abs(corner.dot(right)) / tanX,
              Math.abs(corner.dot(up)) / tanY,
            ),
        );
      }
  return {
    target: center,
    position: center.clone().addScaledVector(direction, distance * 1.07),
  };
}
