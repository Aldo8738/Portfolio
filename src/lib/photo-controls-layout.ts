import { Box3, PerspectiveCamera, Vector3, type Object3D } from 'three';

export interface PhotoControlsLayout {
  previousX: number;
  nextX: number;
  centerY: number;
  counterY: number;
}

export function getPhotoControlsLayout(
  photo: Object3D,
  neighbors: readonly Object3D[],
  fit: { position: Vector3; target: Vector3 },
  width: number,
  height: number,
  fov: number,
): PhotoControlsLayout | null {
  const camera = new PerspectiveCamera(fov, width / height, 0.1, 100);
  camera.position.copy(fit.position);
  camera.lookAt(fit.target);
  camera.updateMatrixWorld();
  const project = (object: Object3D) => {
    const bounds = new Box3().setFromObject(object);
    const corners: Vector3[] = [];
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z])
          corners.push(new Vector3(x, y, z).project(camera));
    return {
      left: ((Math.min(...corners.map((point) => point.x)) + 1) * width) / 2,
      right: ((Math.max(...corners.map((point) => point.x)) + 1) * width) / 2,
      top: ((1 - Math.max(...corners.map((point) => point.y))) * height) / 2,
      bottom: ((1 - Math.min(...corners.map((point) => point.y))) * height) / 2,
    };
  };
  const active = project(photo);
  let left = 16;
  let right = width - 16;
  for (const neighbor of neighbors) {
    const box = project(neighbor);
    if (box.right < active.left) left = Math.max(left, box.right);
    else if (box.left > active.right) right = Math.min(right, box.left);
    else return null;
  }
  // A 112px capsule needs an 8px gap on both sides; otherwise use the footer row.
  if (width < 800 || active.left - left < 128 || right - active.right < 128)
    return null;
  return {
    previousX: (left + active.left) / 2,
    nextX: (active.right + right) / 2,
    centerY: (active.top + active.bottom) / 2,
    counterY: active.bottom + 12,
  };
}
