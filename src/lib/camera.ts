import { Box3, MathUtils, Mesh, Object3D, Vector3 } from 'three';

export function getFramingPoints(scene: Object3D) {
  const points: Vector3[] = [];
  scene.updateWorldMatrix(true, true);
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    node.geometry.computeBoundingBox();
    const bounds = node.geometry.boundingBox;
    if (bounds)
      points.push(
        ...boxCorners(bounds).map((point) =>
          point.applyMatrix4(node.matrixWorld),
        ),
      );
  });
  return points;
}

function boxCorners(bounds: Box3) {
  const points: Vector3[] = [];
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z])
        points.push(new Vector3(x, y, z));
  return points;
}

export function fitCamera(
  bounds: Box3,
  aspect: number,
  fov: number,
  points = boxCorners(bounds),
) {
  const center = bounds.getCenter(new Vector3());
  const direction = new Vector3(aspect < 1 ? 0.06 : 0.38, 0.12, 1).normalize();
  const right = new Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right).normalize();
  const tanY = Math.tan(MathUtils.degToRad(fov / 2));
  const tanX = tanY * Math.max(aspect, 0.1);
  let distance = 0;
  // Fit mesh bounds instead of the empty corners of the overall model box.
  for (const point of points) {
    const corner = point.clone().sub(center);
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
    position: center.clone().addScaledVector(direction, distance * 1.06),
  };
}
