import { Box3, MathUtils, Mesh, Object3D, Vector3 } from 'three';

export const heroCamera = {
  desktopWidth: 0.33,
  mobileWidth: 0.8,
  maxHeight: 0.6,
  elevation: 0.18,
  entranceSeconds: 2.8,
  resetSeconds: 0.9,
} as const;

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
  view: 'hero' | 'comparison' | 'entrance' = 'hero',
) {
  const center = bounds.getCenter(new Vector3());
  const direction = new Vector3(
    view === 'hero'
      ? 0
      : aspect < 1
        ? 0.06
        : view === 'comparison'
          ? 0.38
          : 0.55,
    view === 'hero' ? heroCamera.elevation : view === 'comparison' ? 0.12 : 0.2,
    1,
  ).normalize();
  const right = new Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right).normalize();
  const viewportTanY = Math.tan(MathUtils.degToRad(fov / 2));
  const width = MathUtils.lerp(
    heroCamera.mobileWidth,
    heroCamera.desktopWidth,
    MathUtils.smoothstep(aspect, 0.75, 1.4),
  );
  const tanY = viewportTanY * (view === 'hero' ? heroCamera.maxHeight : 1);
  const tanX =
    viewportTanY * Math.max(aspect, 0.1) * (view === 'hero' ? width : 1);
  if (view !== 'comparison') {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity,
      maxDepth = -Infinity;
    for (const point of points) {
      const depth = point.dot(direction);
      const x = point.dot(right),
        y = point.dot(up);
      minX = Math.min(minX, x - depth * tanX);
      maxX = Math.max(maxX, x + depth * tanX);
      minY = Math.min(minY, y - depth * tanY);
      maxY = Math.max(maxY, y + depth * tanY);
      maxDepth = Math.max(maxDepth, depth);
    }
    // Solve the perspective frustum intervals instead of fixing its target to the world-box center.
    const targetDepth = center.dot(direction);
    const target = right
      .clone()
      .multiplyScalar((minX + maxX) / 2)
      .addScaledVector(up, (minY + maxY) / 2)
      .addScaledVector(direction, targetDepth);
    const depth = Math.max(
      (maxX - minX) / (2 * tanX),
      (maxY - minY) / (2 * tanY),
      maxDepth + 0.1,
    );
    return {
      target,
      position: target
        .clone()
        .addScaledVector(
          direction,
          (depth - targetDepth) * (view === 'hero' ? 1 : 1.06),
        ),
    };
  }
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
