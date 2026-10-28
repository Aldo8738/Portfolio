import { Box3, Mesh, Vector3 } from 'three';

export function fitMonitorCamera(
  screen: Mesh,
  viewPosition: Vector3,
  aspect: number,
  fov: number,
) {
  screen.updateWorldMatrix(true, false);
  screen.geometry.computeBoundingBox();
  const bounds = screen.geometry.boundingBox;
  if (!bounds) throw new Error('Monitor screen bounds missing');
  const target = new Box3().setFromObject(screen).getCenter(new Vector3());
  const normal = new Vector3()
    .fromBufferAttribute(screen.geometry.getAttribute('normal'), 0)
    .transformDirection(screen.matrixWorld);
  if (normal.dot(viewPosition.clone().sub(target)) < 0) normal.negate();
  const right = new Vector3(0, 1, 0).cross(normal).normalize();
  const up = normal.clone().cross(right).normalize();
  const tanY = Math.tan((fov * Math.PI) / 360);
  const tanX = tanY * aspect;
  let distance = 0;
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z)
          .applyMatrix4(screen.matrixWorld)
          .sub(target);
        distance = Math.max(
          distance,
          corner.dot(normal) +
            Math.max(
              Math.abs(corner.dot(right)) / tanX,
              Math.abs(corner.dot(up)) / tanY,
            ),
        );
      }
  // Keep the whole display visible with a little bezel, rather than crossing its plane.
  return {
    target,
    position: target.clone().addScaledVector(normal, distance * 1.1),
  };
}

// The frozen CRT uses top-down UVs. Keep the portal attached to those exact corners.
export function getMonitorCorners(screen: Mesh): Vector3[] {
  screen.updateWorldMatrix(true, false);
  const positions = screen.geometry.getAttribute('position');
  const uv = screen.geometry.getAttribute('uv');
  if (!uv) throw new Error('Monitor screen UVs missing');
  return [
    [0, 1],
    [1, 1],
    [0, 0],
    [1, 0],
  ].map(([u = 0, v = 0]) => {
    let closest = 0;
    let distance = Infinity;
    for (let i = 0; i < uv.count; i++) {
      const candidate = (uv.getX(i) - u) ** 2 + (uv.getY(i) - v) ** 2;
      if (candidate < distance) {
        distance = candidate;
        closest = i;
      }
    }
    return new Vector3()
      .fromBufferAttribute(positions, closest)
      .applyMatrix4(screen.matrixWorld);
  });
}
